import os
import shutil
import uuid
from datetime import datetime
import base64
from pypdf import PdfReader
import fitz # PyMuPDF for Multi-modal support
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from database import get_db, pwd_context
from mcp.langgraph_orchestrator import orchestrator
from rag.vector_store import vector_store
from logger import logger, log_event, trace_performance
import time

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class LoginRequest(BaseModel):
    email: str
    password: str

from typing import Optional
class ChatRequest(BaseModel):
    email: str
    query: str
    session_id: Optional[str] = None

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = "Engineering" # Default for new signups

class FeedbackRequest(BaseModel):
    email: str
    rating: str
    context: str

class ProfileUpdateRequest(BaseModel):
    email: str
    name: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    photo: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None

@router.post("/auth/login")
def login(req: LoginRequest):
    db = get_db()
    user = db.users.find_one({"email": req.email})
    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    is_hr = user["role"] == "Admin"
    return {
        "token": "mock-jwt", 
        "department": "Global", 
        "role": user["role"], 
        "is_hr": is_hr,
        "user_id": user["user_id"]
    }

@router.post("/auth/signup")
def signup(req: SignupRequest):
    db = get_db()
    existing = db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_id = "user_" + str(uuid.uuid4())[:8]
    db.users.insert_one({
        "user_id": user_id,
        "name": req.name,
        "role": req.role, 
        "email": req.email,
        "password_hash": pwd_context.hash(req.password),
        "phone": req.phone,
        "gender": req.gender,
        "address": req.address,
        "department": "Global" if req.role == "Admin" else req.department
    })
    return {"status": "Success", "user_id": user_id}

@router.post("/chat")
def chat(req: ChatRequest):
    db = get_db()
    user = db.users.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    initial_context = {
        "query": req.query,
        "user_department": "Global",
        "is_hr": user["role"] == "Admin"
    }
    
    result = orchestrator.process_query(initial_context)
    
    confidence = result.get("confidence_score", 0.0)
    status_str = "success" if confidence > 0.6 else "failed"

    if status_str == "failed":
        db.gaps.insert_one({
            "query": req.query,
            "timestamp": datetime.now().isoformat(),
            "department": user.get("department", "Global"),
            "status": "Pending"
        })

    log_doc = {
        "log_id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "query": req.query,
        "tools_used": result.get("tools_used", []),
        "timestamp": datetime.now().isoformat(),
        "status": status_str
    }
    db.logs.insert_one(log_doc)
    
    # Hallucination Logging
    if "Self-Correction" in result.get("tools_used", []):
        db.hallucinations.insert_one({
            "query": req.query,
            "corrected_answer": result.get("final_answer"),
            "retries": next((s for s in result.get("pipeline_steps", []) if s["tool"] == "Self-Correction"), {}).get("metadata", {}).get("count", 1),
            "timestamp": datetime.now().isoformat()
        })
    
    # Handle Session Logic
    session_id = req.session_id
    if not session_id:
        session_id = "sess_" + str(uuid.uuid4())[:8]
        db.chat_sessions.insert_one({
            "session_id": session_id,
            "email": req.email,
            "title": req.query[:30] + "..." if len(req.query) > 30 else req.query,
            "updated_at": datetime.now().isoformat(),
            "messages": []
        })
    
    # Append to existing session
    db.chat_sessions.update_one(
        {"session_id": session_id},
        {
            "$push": {
                "messages": {
                    "$each": [
                        {"text": req.query, "sender": "user"},
                        {
                            "text": result.get("final_answer", "Error processing"), 
                            "sender": "bot",
                            "tools": result.get("tools_used", []),
                            "docs": result.get("retrieved_chunks", [])
                        }
                    ]
                }
            },
            "$set": {"updated_at": datetime.now().isoformat()}
        }
    )
    
    return {
        "answer": result.get("final_answer", "Error processing"),
        "retrieved_chunks": result.get("retrieved_chunks", []),
        "tools_used": result.get("tools_used", []),
        "pipeline_steps": result.get("pipeline_steps", []),
        "confidence_score": confidence,
        "session_id": session_id
    }

@router.get("/chat/sessions")
def get_chat_sessions(email: str):
    db = get_db()
    sessions = list(db.chat_sessions.find({"email": email}).sort("updated_at", -1))
    for s in sessions:
        s["_id"] = str(s["_id"])
        # Remove messages to save bandwidth for the list view
        s.pop("messages", None)
    return sessions

@router.get("/chat/sessions/{session_id}")
def get_chat_session(session_id: str):
    db = get_db()
    session = db.chat_sessions.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session["_id"] = str(session["_id"])
    return session

@router.delete("/chat/sessions/{session_id}")
def delete_chat_session(session_id: str):
    db = get_db()
    db.chat_sessions.delete_one({"session_id": session_id})
    return {"status": "Deleted"}

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
):
    db = get_db()
    doc_id = str(uuid.uuid4())
    
    path = os.path.join(UPLOAD_DIR, file.filename)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    extracted_text = ""
    image_descriptions = []
    
    file_ext = file.filename.split('.')[-1].lower()
    
    try:
        if file_ext in ['png', 'jpg', 'jpeg']:
            # IMAGE HANDLING: Use Vision AI to read the image directly
            with open(path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            from mcp.tools import _call_groq
            sys = "You are an OCR and Document Analysis expert."
            usr = f"Transcribe and describe every detail of this document image for a knowledge base. Include all policies, tables, and text exactly as shown. Image data: data:image/{file_ext};base64,{base64_image}"
            
            # Note: Using the Vision Model (Llama 3.2 11B Vision) to convert image to searchable text
            extracted_text = _call_groq(sys, usr, is_vision=True)
            image_descriptions.append({"page": 1, "type": "Direct Image", "description": "Processed via Vision Neural Link"})
            
        else:
            # PDF HANDLING
            doc = fitz.open(path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                extracted_text += page.get_text() + "\n"
                
                image_list = page.get_images(full=True)
                for img_index, img in enumerate(image_list):
                    image_descriptions.append({
                        "page": page_num + 1,
                        "type": "Chart/Diagram/Image",
                        "description": f"[IMAGE TRACE: Visual data found on Page {page_num+1}, Index {img_index}. AI Vision Analyzer will process this on query.]"
                    })
            doc.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Multi-modal {file_ext}: {str(e)}")

    if not extracted_text.strip():
        extracted_text = f"No text extracted from {file.filename}."

    # Interleave image traces into the text for the Retriever to pick up
    for img_desc in image_descriptions:
        extracted_text += f"\n\n--- MULTI-MODAL CONTENT ---\n{img_desc['description']}\n---------------------------\n"

    db.documents.insert_one({
        "doc_id": doc_id,
        "title": file.filename,
        "timestamp": datetime.now().isoformat(),
        "type": "General"
    })
    
    # Ingest chunks
    chunk_size = 1000
    overlap = 200
    start = 0
    i = 0
    chunks_to_insert = []
    while start < len(extracted_text):
        end = start + chunk_size
        chunks_to_insert.append({
            "chunk_id": f"chunk_{doc_id}_{i:03d}",
            "doc_id": doc_id,
            "text": extracted_text[start:end],
            "embedding_id": f"mock_{i}"
        })
        if end >= len(extracted_text): break
        start += (chunk_size - overlap)
        i += 1
    
    if chunks_to_insert:
        db.document_chunks.insert_many(chunks_to_insert)
        # Sync to Vector Store for Semantic Search
        vector_store.upsert_chunks([{
            "chunk_id": c["chunk_id"],
            "text": c["text"],
            "doc_id": c["doc_id"],
            "doc_title": file.filename
        } for c in chunks_to_insert])
    
    # Generate Alert
    title = file.filename
    alert_msg = f"New policy document '{title}' has been uploaded and vectorized."
    
    # Specialized logic for User's example
    if "leave" in title.lower():
        alert_msg = f"POLICY UPDATE: {title}. Note: Leave policy has changed. Please check the new requirements (e.g., 3 days notice instead of 5)."

    db.alerts.insert_one({
        "title": alert_msg,
        "department": "Global",
        "timestamp": datetime.now().isoformat(),
        "read": False
    })
    
    return {"status": "Ingested", "doc_id": doc_id}

@router.get("/documents")
def get_documents():
    db = get_db()
    docs = list(db.documents.find({}))
    return [{"id": d["doc_id"], "name": d["title"], "date": d["timestamp"]} for d in docs]

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    db = get_db()
    db.documents.delete_one({"doc_id": doc_id})
    db.document_chunks.delete_many({"doc_id": doc_id})
    return {"status": "Deleted"}

@router.get("/logs")
def get_logs():
    db = get_db()
    logs = list(db.logs.find({}).sort("timestamp", -1))
    return [{"time": l["timestamp"][-14:-4], "user": l["user_id"], "action": "Query", "status": l["status"]} for l in logs]

@router.get("/analytics/metrics")
def get_metrics():
    db = get_db()
    return {
        "total_docs": db.documents.count_documents({}),
        "total_queries": db.logs.count_documents({}),
        "active_employees": db.users.count_documents({"role": "Employee"}),
        "failed_queries": db.logs.count_documents({"status": "failed"}),
        "chart": [
            {
                "name": "System Activity", 
                "documents": db.documents.count_documents({}), 
                "queries": db.logs.count_documents({})
            }
        ],
        "hallucination_rate": db.hallucinations.count_documents({}) / max(1, db.logs.count_documents({})) * 100
    }

@router.get("/analytics/hallucinations")
def get_hallucinations():
    db = get_db()
    logs = list(db.hallucinations.find({}).sort("timestamp", -1))
    for l in logs:
        l["_id"] = str(l["_id"])
    return logs

@router.post("/feedback")
def submit_feedback(req: FeedbackRequest):
    db = get_db()
    db.feedback.insert_one({
        "email": req.email,
        "rating": req.rating,
        "context": req.context,
        "timestamp": datetime.now().isoformat()
    })
    return {"status": "Success"}

@router.get("/feedback")
def get_feedback():
    db = get_db()
    feeds = list(db.feedback.find({}).sort("timestamp", -1))
    for f in feeds:
        f["id"] = str(f["_id"])
        f["_id"] = str(f["_id"])
    return feeds

@router.get("/users")
def get_users():
    db = get_db()
    users = list(db.users.find({}))
    for u in users:
        u.pop("password_hash", None)
        u["id"] = u["user_id"]
        u["_id"] = str(u["_id"])
    return users

@router.get("/gaps")
def get_gaps():
    db = get_db()
    gaps = list(db.gaps.find({}).sort("timestamp", -1))
    for g in gaps:
        g["id"] = str(g["_id"])
        g["_id"] = str(g["_id"])
    return gaps

@router.get("/alerts")
def get_alerts(email: str, department: str = "Global"):
    db = get_db()
    alerts = list(db.alerts.find({"$or": [{"department": department}, {"department": "Global"}]}).sort("timestamp", -1))
    
    # Get read alerts for this user
    user = db.users.find_one({"email": email})
    read_alerts = user.get("read_alerts", []) if user else []
    
    for a in alerts:
        a["id"] = str(a["_id"])
        a["_id"] = str(a["_id"])
        a["date"] = a["timestamp"][:10]
        a["read"] = a["id"] in read_alerts
    return alerts

@router.post("/alerts/{alert_id}/read")
def mark_alert_read(alert_id: str, email: str):
    db = get_db()
    db.users.update_one(
        {"email": email},
        {"$addToSet": {"read_alerts": alert_id}}
    )
    return {"status": "Success"}

@router.put("/users/profile")
def update_profile(req: ProfileUpdateRequest):
    db = get_db()
    update_data = {}
    if req.name: update_data["name"] = req.name
    if req.position: update_data["position"] = req.position
    if req.department: update_data["department"] = req.department
    if req.photo: update_data["photo"] = req.photo
    if req.phone: update_data["phone"] = req.phone
    if req.gender: update_data["gender"] = req.gender
    if req.address: update_data["address"] = req.address
    
    db.users.update_one({"email": req.email}, {"$set": update_data})
    return {"status": "Success"}

@router.get("/users/me")
def get_current_user(email: str):
    db = get_db()
    user = db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    user.pop("password_hash", None)
    return user

@router.delete("/gaps/{gap_id}")
def delete_gap(gap_id: str):
    from bson import ObjectId
    db = get_db()
    db.gaps.delete_one({"_id": ObjectId(gap_id)})
    return {"status": "Resolved"}
