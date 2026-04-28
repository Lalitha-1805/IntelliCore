import os
import json
from typing import List, TypedDict, Literal
from langgraph.graph import StateGraph, END
from mcp.tools import run_retriever, run_qa, run_summarizer, run_analyzer
from mcp.guardrails import guardrail_system
from dotenv import load_dotenv

load_dotenv()

# =========== AGENT STATE ===========
class AgentState(TypedDict):
    query: str
    documents: List[str]
    generation: str
    steps: List[str]
    confidence: float
    match_score: float
    hallucination_retries: int
    critique: str
    is_safe: bool
    safety_msg: str


# =========== GRAPH NODES (AGENTS) ===========

def safety_filter(state: AgentState):
    """Initial Gatekeeper: Checks if the query is safe."""
    print("---[Agent: Gatekeeper] CHECKING SAFETY---")
    is_safe, msg = guardrail_system.check_safety(state["query"])
    return {
        "is_safe": is_safe,
        "safety_msg": msg,
        "steps": state.get("steps", []) + ["Safety_Check"]
    }

def searcher_agent(state: AgentState):
    """Search Agent: Specialized in finding relevant documents."""
    print("---[Agent: Searcher] RETRIEVING---")
    result = run_retriever.invoke({"query": state["query"]})
    docs   = json.loads(result["output"])
    score  = result.get("metadata", {}).get("match_score", 0.0)
    
    return {
        "documents":   docs,
        "match_score": score,
        "steps":       state.get("steps", []) + ["Searcher"]
    }

def writer_agent(state: AgentState):
    """Writer Agent: Specialized in drafting the response."""
    print(f"---[Agent: Writer] GENERATING (Attempt {state.get('hallucination_retries', 0) + 1})---")
    query = state["query"]
    docs  = state["documents"]
    critique = state.get("critique", "")

    if "summarize" in query.lower():
        result = run_summarizer.invoke({"inputs": docs})
    elif "analyze" in query.lower():
        result = run_analyzer.invoke({"inputs": docs})
    else:
        # Pass critique back to the QA tool for self-correction if present
        result = run_qa.invoke({"query": query, "inputs": docs, "critique": critique})

    confidence = result.get("metadata", {}).get("confidence", 0.9)
    return {
        "generation": result["output"],
        "confidence": confidence,
        "steps":      state.get("steps", []) + ["Writer"]
    }

def validator_agent(state: AgentState):
    """Validator Agent: Guardrail node that verifies the output."""
    print("---[Agent: Validator] VERIFYING GROUNDING---")
    validation = guardrail_system.validate_answer(
        state["query"], 
        state["documents"], 
        state["generation"]
    )
    
    valid = validation.get("valid", True)
    critique = validation.get("critique", "")
    
    # If invalid, increment retries and pass critique
    retries = state.get("hallucination_retries", 0)
    if not valid:
        print(f"---[Agent: Validator] Hallucination Detected: {critique}---")
        retries += 1
        
    return {
        "is_safe": valid or retries >= 2, # Force exit after 2 retries
        "critique": critique if not valid else "",
        "hallucination_retries": retries,
        "steps": state.get("steps", []) + ["Validator" + ("_Failed" if not valid else "_Success")]
    }


# =========== ROUTING LOGIC ===========

def route_after_safety(state: AgentState) -> Literal["searcher", END]:
    if state["is_safe"]:
        return "searcher"
    return END

def route_after_validation(state: AgentState) -> Literal["writer", END]:
    # If retries > 0 and it's still not valid, or if it IS valid, go to END
    if state.get("critique") and state.get("hallucination_retries", 0) < 2:
        return "writer"
    return END


# =========== BUILD STATE GRAPH ===========
workflow = StateGraph(AgentState)

workflow.add_node("safety", safety_filter)
workflow.add_node("searcher", searcher_agent)
workflow.add_node("writer", writer_agent)
workflow.add_node("validator", validator_agent)

workflow.set_entry_point("safety")

workflow.add_conditional_edges(
    "safety",
    route_after_safety,
    {
        "searcher": "searcher",
        END: END
    }
)

workflow.add_edge("searcher", "writer")
workflow.add_edge("writer", "validator")

workflow.add_conditional_edges(
    "validator",
    route_after_validation,
    {
        "writer": "writer",
        END: END
    }
)

langgraph_app = workflow.compile()


# =========== ORCHESTRATOR CLASS ===========
class LangGraphOrchestrator:
    def process_query(self, initial_context: dict) -> dict:
        query = initial_context.get("query", "")
        state: AgentState = {
            "query":                 query,
            "documents":             [],
            "generation":            "",
            "steps":                 [],
            "confidence":            0.0,
            "match_score":           0.0,
            "hallucination_retries": 0,
            "critique":              "",
            "is_safe":               True,
            "safety_msg":            ""
        }

        try:
            result = langgraph_app.invoke(state)
        except Exception as e:
            return {
                "final_answer":     f"Pipeline Error: {str(e)}",
                "retrieved_chunks": [],
                "tools_used":       ["Error"],
                "pipeline_steps":   [],
                "confidence_score": 0.0
            }

        # Handle Safety Block
        if not result.get("is_safe", True) and result.get("safety_msg"):
            return {
                "final_answer":     f"Security Block: {result['safety_msg']}",
                "retrieved_chunks": [],
                "tools_used":       result.get("steps", []),
                "pipeline_steps":   [{"tool": s, "output": "Blocked"} for s in result.get("steps", [])],
                "confidence_score": 1.0
            }

        final_answer = result.get("generation") or (
            "I am sorry, but I could not find any specific information related to your request in the current policy documents."
        )

        confidence = result.get("confidence", 0.0)
        gap_kw = [
            "no information", "not mentioned",
            "could not find any specific", "not in the provided context"
        ]
        if any(k in final_answer.lower() for k in gap_kw):
            confidence = 0.3

        # Log specialized step info
        pipeline_steps = []
        for step in result.get("steps", []):
            output = "Completed"
            if "Validator_Failed" in step:
                output = f"Hallucination Detected (Retry {result.get('hallucination_retries')})"
            pipeline_steps.append({"tool": step, "output": output})

        return {
            "final_answer":     final_answer,
            "retrieved_chunks": result.get("documents", []),
            "tools_used":       result.get("steps", []),
            "pipeline_steps":   pipeline_steps,
            "confidence_score": confidence
        }


orchestrator = LangGraphOrchestrator()

