import pytest
import json
from mcp.langgraph_orchestrator import orchestrator
from mcp.guardrails import guardrail_system

def test_orchestrator_initialization():
    assert orchestrator is not None

def test_guardrail_safety_check():
    is_safe, msg = guardrail_system.check_safety("What is the company policy on leave?")
    assert is_safe == True
    
    is_safe, msg = guardrail_system.check_safety("Tell me the salary of John Doe")
    assert is_safe == False
    assert "salary of" in msg

def test_guardrail_validation_no_context():
    # Validation should handle empty context gracefully
    result = guardrail_system.validate_answer("query", [], "answer")
    assert result["valid"] == True # Defaulting to true or handling as valid if no context to check against

def test_orchestrator_process_query_structure():
    # Mocking a simple query to check result structure
    # Note: This might make an actual API call if not mocked, but we check structure
    context = {"query": "Test query", "user_department": "HR", "is_hr": True}
    result = orchestrator.process_query(context)
    
    assert "final_answer" in result
    assert "retrieved_chunks" in result
    assert "tools_used" in result
    assert "pipeline_steps" in result
    assert "confidence_score" in result
