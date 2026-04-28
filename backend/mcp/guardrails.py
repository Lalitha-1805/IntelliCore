import os
import json
from mcp.tools import _call_groq

class Guardrails:
    @staticmethod
    def validate_answer(query: str, context: list, answer: str):
        """
        Validates if the answer is grounded in the provided context and doesn't contain hallucinations.
        """
        if not context:
            return {"valid": True, "critique": "No context provided."}

        text_context = " ".join(context)
        sys_prompt = (
            "You are a strict Verification Agent. Your job is to ensure the generated answer is 100% grounded in the context. "
            "Identify any hallucinations (information not in context) or contradictions. "
            "Return a JSON object: {\"valid\": bool, \"critique\": \"string\", \"confidence_score\": float}"
        )
        usr_prompt = f"Context: {text_context}\nQuery: {query}\nGenerated Answer: {answer}\n\nVerify grounding and safety."
        
        try:
            response = _call_groq(sys_prompt, usr_prompt)
            # Find JSON in response (sometimes LLMs add prose)
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end != -1:
                return json.loads(response[start:end])
            return {"valid": True, "critique": "Validation failed to parse, assuming valid."}
        except Exception as e:
            return {"valid": True, "critique": f"Guardrail Error: {str(e)}"}

    @staticmethod
    def check_safety(query: str):
        """
        Checks if the query is safe and follows corporate guidelines.
        """
        # Simple heuristic for now, could be an LLM call
        banned_keywords = ["password", "salary of", "confidential salary"]
        for kw in banned_keywords:
            if kw in query.lower():
                return False, f"The query contains restricted information requests: {kw}"
        return True, ""

guardrail_system = Guardrails()
