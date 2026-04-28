# IntelliCore: Enterprise AI Knowledge Management System

IntelliCore is a production-grade Enterprise Knowledge Management System (KMS) built with a multi-agentic RAG architecture. It leverages the Model Context Protocol (MCP) concepts and LangGraph to provide accurate, reliable, and observable enterprise policy information to employees and administrators.

## 🚀 Overview

IntelliCore streamlines policy management operations by providing an intelligent interface for policy retrieval, automated gap detection, and employee support. It features a state-of-the-art RAG pipeline that can process both text and visual data (charts, tables) from enterprise documents.

### Key Concepts Covered

- **RAG (Retrieval-Augmented Generation)**: Implements a high-performance retrieval system using **ChromaDB** as a vector store and **Sentence-Transformers** for embedding generation. The system supports multi-modal ingestion, where text and visual elements (like charts or tables) are extracted from PDFs via **Vision AI**, vectorized, and then retrieved based on semantic similarity.
- **Agentic Framework**: Built with **LangGraph** for structured, stateful multi-agent workflows.
- **Multi-Agent Systems**: Features specialized agents for retrieval, QA, and validation.
- **Model Context Protocol (MCP)**: Adheres to the principles of the **Model Context Protocol** by decoupling model reasoning from data sources.
- **Guardrails**: Implementation of input validation and output hallucination checks.
- **Observability**: Real-time logging of queries, confidence scores, and system metrics via MongoDB.

---

## 🏗️ Architecture

IntelliCore follows a modern decoupled architecture designed for scalability and observability.

<p align="center">
  <img src="assets/architecture_dia.png" width="80%" alt="Architecture Diagram">
</p>

### Tech Stack Summary

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS | Modern, responsive dashboard and chat interface. |
| **Backend** | FastAPI (Python) | High-performance API orchestrating the AI agents. |
| **Orchestration** | LangGraph, MCP | Stateful multi-agent workflows and tool standardization. |
| **Vector Store** | ChromaDB | Local vector database for sub-second semantic search. |
| **Primary DB** | MongoDB | Persistent storage for user data, logs, and analytics. |
| **LLMs** | Llama 3.3 70B (Groq) | High-speed inference for reasoning and generation. |
| **Vision AI** | Llama 3.2 Vision | Processing of visual elements in policy documents. |

---

## 📂 Project Structure

```text
.
├── assets/             # Project screenshots and diagrams
├── backend/            # FastAPI server and AI logic
│   ├── mcp/           # Model Context Protocol tool implementations
│   ├── rag/           # RAG pipeline and vectorization logic
│   ├── tests/         # Backend unit and integration tests
│   └── main.py        # Entry point for the backend
├── frontend/           # React application
│   ├── src/           # Component and page source code
│   └── public/        # Static assets
└── README.md           # Project documentation
```

---

## 🧠 Deep Dive: Core Concepts

### 1. Retrieval-Augmented Generation (RAG)

In IntelliCore, RAG is the engine that transforms static documents into a dynamic knowledge base. It ensures the AI doesn't rely on its training data, but instead "looks up" specific enterprise policies before answering.

#### I. The Multi-Modal Ingestion Pipeline
1.  **Extraction (Text & Vision):** Uses `PyMuPDF` for text and **Llama 3.2 Vision** for charts, tables, and diagrams.
2.  **Chunking:** Documents are broken into overlapping chunks (500-1000 characters) to maintain semantic continuity.
3.  **Vectorization:** Chunks are converted into 768-dimensional embeddings using `all-MiniLM-L6-v2`.

#### II. Semantic Storage (ChromaDB)
Vectors are stored in **ChromaDB**. It uses mathematical proximity (Cosine Similarity) rather than keyword matching, allowing for sub-second retrieval across thousands of pages.

#### III. The Retrieval Process
- **Query Embedding:** User questions are converted into vectors in real-time.
- **Top-K Fetching:** The system retrieves the top 10 most relevant chunks based on semantic similarity.

#### IV. Augmented Generation (Groundedness)
Retrieved chunks are injected into the LLM prompt as **context**, forcing the model to answer based ONLY on the provided documents.

### 2. Model Context Protocol (MCP)

IntelliCore uses MCP to decouple the AI’s **reasoning** (LLM) from its **capabilities** (tools and data).

#### I. Tool Decoupling
The LLM acts as an orchestrator. It knows it needs to "retrieve information," but the MCP layer handles the specific implementation (talking to ChromaDB).

#### II. The Standardized Tool Registry
Centralized in `backend/mcp/tools.py`, all capabilities follow a consistent schema:
- **Retriever:** Data sourcing via RAG.
- **QA Tool:** Knowledge extraction with grounded logic.
- **Summarizer:** Information compression.
- **Vision Analyzer:** Interpretation of visual document elements.

#### III. Operational Flow
1.  **Selection:** Agents identify the best tool for the query.
2.  **Invocation:** Agents send structured parameters to the tool.
3.  **Response:** Tools return consistent JSON with output and metadata (confidence scores).

### 3. Agentic Framework

Built using **LangGraph**, the framework provides a stateful, multi-agent orchestration system following a "Self-Correcting RAG" pattern.

#### I. The Orchestration Layer
Uses a **State Graph** that allows the system to loop back and correct itself if a "hallucination" is detected.

#### II. The Specialist Agents
- **🛡️ Gatekeeper (Safety):** Blocks restricted requests (e.g., salary/password queries).
- **🔍 Searcher (Retrieval):** Fetches relevant document segments from ChromaDB.
- **✍️ Writer (Generation):** Drafts responses using Llama 3.3 70B via Groq.
- **✅ Validator (Verification):** Fact-checks the Writer's response against source documents.

#### III. The Workflow (Self-Correction Loop)
1.  **Safety Check** → If safe, proceed.
2.  **Retrieval** → Fetch documents.
3.  **Generation** → Writer creates a draft.
4.  **Validation** → If the Validator detects a hallucination, it sends a critique back to the Writer for a retry (up to 2 retries).
### 4. Multi Agent System

#### I. State Management (`AgentState`)
All agents communicate through a shared "Global Memory":
```python
class AgentState(TypedDict):
    query: str                 # User's input
    documents: List[str]       # Context from ChromaDB
    generation: str            # Current draft
    steps: List[str]           # Trace of agent actions
    critique: str              # Feedback for self-correction
    hallucination_retries: int # Loop prevention counter
```

#### II. Operational Phases
- **Phase A (Gatekeeping):** Scans for restricted keywords.
- **Phase B (Retrieval):** populates the state with document chunks.
- **Phase C (Generation):** Chooses the best tool (QA, Summarizer, etc.) to draft a response.
- **Phase D (Validation):** Ensures **Faithfulness** and **Answer Relevance**.
- **Phase E (Self-Correction):** Loops back to the Writer with specific feedback if validation fails.






---

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB (Running locally or via Atlas)
- Groq API Key

### Backend Setup
1. Navigate to the `backend` directory.
2. Create a `.env` file with the following:
   ```env
   GROQ_API_KEY=your_api_key_here
   MONGO_URI=mongodb://localhost:27017
   DATABASE_NAME=policy_kms_db
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 Usage Guide

IntelliCore provides distinct interfaces for employees and policy administrators.

### 1. Employee Journey
*   **Access the Assistant**: Navigate to the Employee Portal and use the chat interface to ask natural language questions about company policies.
*   **View Policy Alerts**: Check the 'Alerts' tab for real-time notifications about new or updated policies relevant to your department.
*   **History Management**: Access previous conversations through the sidebar to resume or reference past queries.

### 2. Administrator Journey
*   **Document Ingestion**: Use the 'Knowledge Base' section to upload PDFs or images. The system will automatically process and vectorize the content.
*   **Gap Detection**: Monitor the 'Policy Gaps' dashboard to see what questions are being asked that the current documentation doesn't cover.
*   **Observability**: Use the 'Hallucination Guard' and 'Live Logs' to ensure the AI's responses are accurate and grounded in your specific documents.

---

## ✨ Core Features

### 👥 Employee Platform
- **Intelligent Policy Assistant**: A conversational interface to ask complex questions about company policies using natural language.
- **Contextual Retrieval**: Answers are automatically personalized based on the user's department and employment status.
- **Traceable Answers**: Transparency into the AI's reasoning, showing exactly which document chunks and tools (Searcher, QA) were used.
- **Session Persistence**: Complete chat history management, allowing employees to start new threads or resume past conversations.
- **Real-time Policy Alerts**: Instant notifications when new policies relevant to the user's department are published.

### 🛡️ Policy Administrator Dashboard
- **Multimodal Document Ingestion**: Seamlessly upload PDF policies or document screenshots. The system uses **Vision AI** to OCR and vectorize content.
- **Policy Gap Analytics**: Automatically identifies "Knowledge Gaps"—questions employees are asking that are not yet covered by existing documentation.
- **System Observability**:
    - **Live Query Logs**: Real-time monitoring of all employee-AI interactions.
    - **Health Metrics**: Tracking of system uptime, query success rates, and hallucination frequency.
- **Hallucination Guard**: A dedicated view to review and analyze cases where the **Validator Agent** intervened to prevent AI errors.
- **Knowledge Base Management**: Full CRUD operations for policy documents and vectorized knowledge chunks.

---

## 📸 Implementation Screenshots

### 🏠 Landing Page
<p align="center">
  <img src="assets/landing.png" width="100%" alt="Landing Page">
</p>

### 👥 Employee Portal
<p align="center">
  <img src="assets/emp_chat.png" width="49%" alt="Employee Chat">
  <img src="assets/emp_alerts.png" width="49%" alt="Policy Alerts">
</p>
<p align="center">
  <img src="assets/emp_profile.png" width="49%" alt="Employee Profile">
  <img src="assets/emp_feedback.png" width="49%" alt="Employee Feedback">
</p>

### 🛡️ Policy Administrator Dashboard
<p align="center">
  <img src="assets/admin_dashboard.png" width="49%" alt="Admin Dashboard">
  <img src="assets/admin_bot.png" width="49%" alt="Enterprise Policy Assistant">
</p>
<p align="center">
  <img src="assets/admin_policygap.png" width="49%" alt="Policy Gap Detection">
  <img src="assets/admin_hallunication.png" width="49%" alt="Hallucination Guard">
</p>
<p align="center">
  <img src="assets/admin_emp_list.png" width="49%" alt="Employee Management">
  <img src="assets/admin_vfeed.png" width="49%" alt="View Feedback">
</p>
<p align="center">
  <img src="assets/admin_pro.png" width="49%" alt="Admin Profile">
</p>

---

## 🏁 Conclusion

IntelliCore represents a leap forward in enterprise knowledge accessibility. By combining the precision of **RAG**, the flexibility of the **Model Context Protocol**, and the reasoning power of **Llama 3.3**, it transforms static policy documents into a dynamic, interactive, and observable knowledge asset. It not only empowers employees with instant, accurate information but also provides administrators with the analytical tools needed to maintain a robust and comprehensive knowledge base.

---
