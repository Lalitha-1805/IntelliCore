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
In IntelliCore, **Retrieval-Augmented Generation (RAG)** is the engine that transforms static documents into a dynamic knowledge base. It ensures the AI doesn't rely on its training data, but instead "looks up" your specific enterprise policies before answering.

Here is the structural breakdown of the RAG pipeline:

### I. The Multi-Modal Ingestion Pipeline
Before an agent can search for information, the data must be prepared. This happens in three stages:

*   **Extraction (Text & Vision):** The system uses `PyMuPDF` for standard text. For complex elements like **charts, tables, and diagrams**, it uses **Llama 3.2 Vision** to interpret the visual data and convert it into a detailed textual description.
*   **Chunking:** Large documents are broken into smaller, overlapping "chunks" (typically 500-1000 characters). This ensures that the context isn't lost at the edges of a paragraph.
*   **Vectorization:** Each chunk is passed through an embedding model (`all-MiniLM-L6-v2`). This converts human language into a **768-dimensional mathematical vector** that represents its semantic meaning.

### II. Semantic Storage (ChromaDB)
The generated vectors are stored in **ChromaDB**, a specialized vector database. 
*   **Indexing:** Instead of searching for keywords (like "vacation"), the database looks for "mathematical proximity." 
*   **Speed:** Even with thousands of pages, the vector store can find the most relevant chunks in under 100 milliseconds.

### III. The Retrieval Process
When a query enters the system, the **Searcher Agent** executes the following:
1.  **Query Embedding:** The user's question (e.g., "What is the travel policy for Mumbai?") is converted into a vector using the same model used for the documents.
2.  **Similarity Search:** The system calculates the "Cosine Similarity" between the question vector and all document vectors in the database.
3.  **Top-K Fetching:** It retrieves the top 10 most relevant chunks based on their similarity score.

### IV. Augmented Generation (Groundedness)
This is where the "Augmented" part comes in. The retrieved chunks are injected into the LLM prompt as **context**.

**The Prompt Structure:**
> "You are an AI assistant. Use ONLY the following context to answer the user's question. If the answer isn't there, say you don't know."
> 
> **Context:** [Chunk 1: Mumbai travel allowance is 5000...] [Chunk 2: Travel bookings must be done via portal...]
> 
> **Question:** "What is the travel policy for Mumbai?"

### V. Multi-Modal Retrieval (Vision Integration)
A unique feature of IntelliCore's RAG is its ability to "see" documents. 
*   If a policy contains a **flowchart** for approval processes, the Vision AI has already described that flowchart in text. 
*   When you ask "Who approves my travel?", the RAG system retrieves the *textual description of that flowchart*, allowing the LLM to explain a visual process as if it were reading text.

### 2. Model Context Protocol (MCP)
In IntelliCore, the **Model Context Protocol (MCP)** is used as an architectural standard to decouple the AI’s "reasoning" (the LLM) from its "capabilities" (the tools and data). 

Following MCP principles ensures that the agentic framework remains modular, extensible, and model-agnostic.

### I. The Core Philosophy: Decoupling
The primary goal of MCP in this system is to separate **what** the model wants to do from **how** it is actually done. 
*   **The LLM:** Acts as the orchestrator. It knows it needs to "retrieve information" or "summarize text."
*   **The MCP Layer:** Provides a standardized interface for these actions. The LLM doesn't need to know how to talk to ChromaDB or handle PDF parsing; it just calls the `Retriever` tool.

### II. The Standardized Tool Registry
All system capabilities are centralized in `backend/mcp/tools.py`. Each tool is registered with a consistent schema, which includes:
*   **Name:** Unique identifier (e.g., `Retriever`, `Vision`, `Analyzer`).
*   **Description:** A clear natural language explanation that tells the LLM *when* to use the tool.
*   **Input Schema:** Strict definition of what data the tool expects (e.g., a `query` string or a list of `documents`).

### III. Tool Implementation (The "MCP Tools")
The system implements several key MCP tools that the agents can invoke:

| Tool | Role | Implementation Detail |
| :--- | :--- | :--- |
| **Retriever** | Data Sourcing | Interfaces with the RAG pipeline and ChromaDB. |
| **QA Tool** | Knowledge Extraction | Specialized prompt logic for grounded answering. |
| **Summarizer** | Information Compression | Condenses large document sets into executive summaries. |
| **Vision Analyzer** | Visual Interpretation | Processes visual traces and charts from documents. |
| **Report Generator** | Content Formatting | Converts raw analysis into professional Markdown reports. |

### IV. Operational Flow (The Protocol in Action)
When an agent (like the **Writer Agent**) needs to perform an action, it follows the MCP workflow:
1.  **Selection:** Based on the user's query, the agent identifies which tool in the registry is most appropriate.
2.  **Invocation:** The agent sends the required parameters (context, query) to the tool.
3.  **Standardized Response:** The tool returns a structured JSON object containing the `output` and `metadata` (like confidence scores or match metrics).
4.  **State Update:** The agent takes this output and updates the **Global Agent State**, making the result available to subsequent agents in the graph.

### V. Benefits of the MCP Approach
*   **Extensibility:** Adding a new capability (e.g., a "Slack Notification" tool) simply requires adding one function to the registry. The core agent logic remains untouched.
*   **Model Agnostic:** Because the tools are standardized, you can swap out the underlying LLM (e.g., from Groq/Llama to OpenAI/GPT-4o) without rewriting any data access logic.
*   **Observability:** Since every interaction follows the same protocol, the system can log every tool call, input, and output in a uniform format for the **Administrator Dashboard**.

### 3. Agentic Framework
The agentic framework in IntelliCore is built using LangGraph, providing a stateful, multi-agent orchestration system. It follows a "Self-Correcting RAG" (Retrieval-Augmented Generation) pattern to ensure that answers are safe, accurate, and grounded in your documents.

Here is a breakdown of how the framework operates:

I. The Orchestration Layer (LangGraph)
The core logic resides in backend/mcp/langgraph_orchestrator.py. Instead of a simple linear pipeline, it uses a State Graph that allows the system to loop back and correct itself if an error or "hallucination" is detected.

II. The Specialist Agents
The framework divides the workload among four specialized "agents" (nodes in the graph):

🛡️ Gatekeeper (Safety Agent): The first line of defense. It checks the user's query against safety guardrails (defined in guardrails.py) to block restricted requests (e.g., asking for confidential salaries or passwords).
🔍 Searcher (Retrieval Agent): Specialized in finding relevant document chunks. It interfaces with ChromaDB to perform semantic searches and fetches the top 10 most relevant segments.
✍️ Writer (Generation Agent): Powered by Groq (Llama 3.3 70B). It takes the retrieved documents and drafts a response. It can switch between different modes:
QA: For specific questions.
Summarizer: For "Summarize X" requests.
Analyzer: For deep risk or pattern assessment.
✅ Validator (Verification Agent): This is the most critical agent for reliability. It compares the Writer's response against the original document chunks. If it detects information that isn't in the source (a hallucination), it triggers a Self-Correction Loop.
III. The Workflow (Self-Correction Loop)
The magic happens in the conditional logic of the graph:

Safety Check: If unsafe → END (Return security block).
Retrieval: Fetch documents.
Generation: Writer creates a draft.
Validation: Validator checks grounding.
If Valid: → END (Return final answer).
If Hallucination Detected: The Validator sends a critique back to the Writer, which tries again (up to 2 retries) to fix the error.

### 4. Multi Agent System
I. Core Architecture (LangGraph Orchestration)
The system is built on a directed acyclic graph (DAG) with conditional loops, managed by LangGraph. Unlike a standard linear chain, this architecture allows the system to make decisions, route tasks dynamically, and repeat steps if the quality isn't met.

Nodes: Each node represents a specialized agent or function (Gatekeeper, Searcher, Writer, Validator).
Edges: These define the "roads" between agents.
Conditional Edges: Logic gates that decide where to go next based on the current state (e.g., "If hallucination detected, go back to Writer").
II. State Management (AgentState)
The "brain" of the operation is the shared state. Every agent reads from and writes to this central dictionary, ensuring a single source of truth throughout the execution.

python
class AgentState(TypedDict):
    query: str                 # User's input
    documents: List[str]       # Context retrieved from ChromaDB
    generation: str            # Current draft of the response
    steps: List[str]           # Trace of agent actions (Audit Trail)
    critique: str              # Feedback for self-correction
    is_safe: bool              # Safety flag
    hallucination_retries: int # Counter to prevent infinite loops
III. The Multi-Agent Operational Workflow
The framework executes in five distinct phases:

Phase A: Security Gatekeeping
Agent: safety_filter
Action: Scans the query for restricted keywords (e.g., confidential data).
Branching: If unsafe, it routes directly to the END node with a security block message.
Phase B: Contextual Retrieval
Agent: searcher_agent
Action: Triggers the run_retriever tool. It performs a semantic search against ChromaDB to find the most relevant document chunks.
Output: populates the documents list in the State.
Phase C: Intelligent Generation
Agent: writer_agent
Action: Evaluates the query and documents. It chooses the appropriate Groq-powered tool (run_qa, run_summarizer, or run_analyzer) to draft a response.
Context: If a critique exists from a previous failed validation, the writer uses it to refine the new draft.
Phase D: Grounding Validation (The Guardrail)
Agent: validator_agent
Action: Acts as a critic. It compares the generation against the documents to ensure Faithfulness and Answer Relevance.
Logic:
Success: If the answer is grounded, it routes to END.
Failure: If it detects a hallucination, it writes a critique and increments hallucination_retries.
Phase E: Self-Correction Loop
Routing: If the validator fails and retries are under the limit (2), the graph loops back to the Writer Agent. The Writer now has the original context plus the Validator's specific feedback on what it got wrong.
IV. Tool Integration (MCP Principles)
Each agent doesn't perform "magic"; they invoke standardized tools from the MCP Tool Registry (backend/mcp/tools.py).

Decoupling: The Agents handle the logic (when to do what), while the Tools handle the execution (how to talk to the DB or LLM).
Standardization: Every tool returns a consistent JSON schema, allowing the Orchestrator to parse results reliably regardless of which model or database is being used.

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
