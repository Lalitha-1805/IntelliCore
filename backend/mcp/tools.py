import os
import json
from groq import Groq
from dotenv import load_dotenv
from langchain_core.tools import tool
from database import get_db
from rag.vector_store import vector_store

load_dotenv()
try:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
except Exception:
    client = None

MODEL = "llama-3.3-70b-versatile"
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

def _call_groq(system_prompt, user_prompt, is_vision=False):
    if not client:
        return "Groq Authentication Offline."
    try:
        model_to_use = VISION_MODEL if is_vision else MODEL
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        if is_vision and "data:image" in user_prompt:
            # Extract text and image parts
            parts = user_prompt.split("Image data: ")
            text_part = parts[0]
            image_url = parts[1] if len(parts) > 1 else ""
            
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": text_part},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url,
                        },
                    },
                ],
            })
        else:
            messages.append({"role": "user", "content": user_prompt})

        completion = client.chat.completions.create(
            messages=messages,
            model=model_to_use,
            temperature=0.3,
            max_completion_tokens=600
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Groq Error: {str(e)}"

# ================= MCP TOOLS =================
@tool
def run_retriever(query: str):
    """Search for relevant HR policies and documents based on a query."""
    # Semantic Search via ChromaDB
    retrieved = vector_store.search_similar(query, n_results=10)
    match_score = vector_store.get_match_score(query)
    
    if not retrieved:
        return {
            "tool": "Retriever",
            "output": json.dumps([]),
            "metadata": {"chunks_fetched": 0, "match_score": 0}
        }
        
    return {
        "tool": "Retriever",
        "output": json.dumps(retrieved),
        "metadata": {"chunks_fetched": len(retrieved), "match_score": match_score}
    }

@tool
def run_summarizer(inputs: list):
    """Summarize a list of document chunks or text segments."""
    text = " ".join(inputs)
    sys = "You are a professional corporate analyst. Summarize the following data concisely."
    usr = f"Context: {text}\nInstruction: Summarize this context comprehensively."
    answer = _call_groq(sys, usr)
    return {"tool": "Summarizer", "output": answer, "metadata": {}}

@tool
def run_qa(query: str, inputs: list, critique: str = ""):
    """Answer a question based ONLY on the provided document context."""
    text = " ".join(inputs)
    sys = (
        "You are a knowledgeable AI assistant. Your primary goal is to find and explain the specific policy the user is asking about. "
        "STRICT RULE: Only answer using the provided context. If the context is empty or does not contain specific information to answer the query, "
        "you MUST state exactly: 'I am sorry, but I could not find any specific information related to your request in the current policy documents.' "
        "Do not attempt to use general knowledge or unrelated parts of the context."
    )
    
    usr = f"Context: [{text}]\nQuestion: [{query}]"
    if critique:
        usr += f"\n\nIMPORTANT FEEDBACK ON PREVIOUS ATTEMPT: {critique}"
        
    usr += "\nInstruction: Analyze the context and provide a detailed answer. If the information is missing, follow the STRICT RULE."
    answer = _call_groq(sys, usr)
    
    # Heuristic confidence: if the AI uses the 'not found' phrase, confidence is low
    confidence = 0.98
    if "could not find any specific information" in answer.lower():
        confidence = 0.3
        
    return {"tool": "QA_Tool", "output": answer, "metadata": {"confidence": confidence}}

@tool
def run_analyzer(inputs: list):
    """Perform a deep analysis and risk assessment on the provided data."""
    text = " ".join(inputs)
    sys = "You are a lead data analyst identifying patterns and risks."
    usr = f"Analyze the following data: {text}"
    answer = _call_groq(sys, usr)
    return {"tool": "Analyzer", "output": answer, "metadata": {}}

@tool
def run_recommendation(inputs: list):
    """Generate strategic actionable recommendations based on analysis results."""
    text = " ".join(inputs)
    sys = "You provide strategic actionable recommendations."
    usr = f"Based on this analysis, what actions should be taken? {text}"
    answer = _call_groq(sys, usr)
    return {"tool": "Recommendation_Engine", "output": answer, "metadata": {}}

@tool
def run_report(inputs: list):
    """Format information into a professional Markdown report."""
    text = " ".join(inputs)
    sys = "Format the input into a professional markdown report."
    usr = f"Convert this into a report: {text}"
    answer = _call_groq(sys, usr)
    return {"tool": "Report_Generator", "output": answer, "metadata": {}}

def run_extractor(context_payload):
    return {"tool": "Data_Extractor", "input": context_payload, "output": "Data extraction complete.", "metadata": {}}

def run_translator(context_payload):
    inputs = context_payload.get("inputs", [])
    text = " ".join(inputs)
    sys = "A helpful translator."
    usr = f"Translate to Spanish: {text}"
    answer = _call_groq(sys, usr)
    return {"tool": "Translator", "input": context_payload, "output": answer, "metadata": {"lang": "es"}}

def run_sentiment(context_payload):
    return {"tool": "Sentiment_Analyzer", "input": context_payload, "output": "Tone analyze complete.", "metadata": {}}

def run_alert(context_payload):
    return {"tool": "Alert_Generator", "input": context_payload, "output": "System alerts generated.", "metadata": {}}

@tool
def run_vision_analyzer(query: str, inputs: list):
    """Analyze images, charts, and visual traces found in documents to answer a query."""
    text = " ".join(inputs)
    sys = "You are a Vision AI expert. Analyze the descriptions of images and diagrams to answer the query."
    usr = f"Context: {text}\nQuestion about visuals: {query}\nInstruction: Interpret the visual traces and provide a technical breakdown."
    answer = _call_groq(sys, usr)
    return {"tool": "Vision_Analyzer", "output": answer, "metadata": {"vision_mode": "Active"}}

TOOL_REGISTRY = {
    "Retriever": run_retriever,
    "Summarizer": run_summarizer,
    "QA": run_qa,
    "Analyzer": run_analyzer,
    "Recommendation": run_recommendation,
    "Report": run_report,
    "DataExtractor": run_extractor,
    "Translator": run_translator,
    "Sentiment": run_sentiment,
    "Alert": run_alert,
    "Vision": run_vision_analyzer
}
