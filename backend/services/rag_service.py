import json
import re
import os
from typing import List, Dict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from config import get_settings

settings = get_settings()


class RAGService:
    """Service for Retrieval-Augmented Generation"""

    def __init__(self, embedding_service):
        print("[DEBUG] Initializing RAGService...")
        self.embedding_service = embedding_service

        print("[DEBUG] Loading LLM...")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3.1-flash-lite-preview",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7
        )
        print("[DEBUG] LLM Initialized Successfully")

    def _extract_text(self, content) -> str:
        """Extract plain text from LLM response content (handles str or list of blocks)"""
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            return " ".join(
                block["text"] for block in content
                if isinstance(block, dict) and block.get("type") == "text"
            )
        return str(content)

    # ✅ ATS SCORE
    def generate_ats_score(self, resume_text: str, job_description: str) -> Dict:
        print("\n[DEBUG] ===== ATS SCORE FUNCTION START =====")

        prompt = PromptTemplate.from_template("""
        Analyze the resume vs job description.

        Return ONLY valid JSON:
        {{
          "ats_score": number,
          "missing_skills": [],
          "matching_skills": [],
          "suggestions": []
        }}

        Resume:
        {resume}

        Job Description:
        {job_description}
        """)

        chain = prompt | self.llm

        try:
            response = chain.invoke({
                "resume": resume_text,
                "job_description": job_description
            })
        except Exception as e:
            print("[ERROR] LLM Call Failed:", str(e))
            raise

        try:
            raw_text = self._extract_text(response.content)
            cleaned = re.sub(r"```json|```", "", raw_text).strip()
            return json.loads(cleaned)
        except Exception as e:
            print("[ERROR] JSON Parsing Failed:", str(e))
            return {"ats_score": 0, "missing_skills": [], "matching_skills": [], "suggestions": []}

    # ✅ INTERVIEW QUESTIONS
    def generate_interview_questions(
        self, resume_text: str, job_description: str, question_type: str = "general"
    ) -> List[Dict]:
        print("\n[DEBUG] ===== INTERVIEW QUESTIONS FUNCTION START =====")

        type_prompt = {
            "hr": "Generate 5 HR interview questions",
            "technical": "Generate 5 technical interview questions",
            "role_specific": "Generate 5 role-specific interview questions",
            "general": "Generate 5 general interview questions"
        }

        prompt = PromptTemplate.from_template("""
        {type}

        Resume:
        {resume}

        Job Description:
        {job_description}

        Return ONLY JSON:
        [
          {{
            "question": "",
            "model_answer": ""
          }}
        ]
        """)

        chain = prompt | self.llm

        try:
            response = chain.invoke({
                "resume": resume_text,
                "job_description": job_description,
                "type": type_prompt.get(question_type)
            })
        except Exception as e:
            print("[ERROR] LLM Call Failed:", str(e))
            raise

        try:
            raw_text = self._extract_text(response.content)
            cleaned = re.sub(r"```json|```", "", raw_text).strip()
            return json.loads(cleaned)
        except Exception as e:
            print("[ERROR] JSON Parsing Failed:", str(e))
            return []

    def generate_contextual_answer(self, user_question: str, context_texts: List[str]) -> str:
        print("\n[DEBUG] ===== CONTEXTUAL ANSWER FUNCTION START =====")

        context = "\n".join(context_texts)

        prompt = PromptTemplate.from_template("""
        Answer using ONLY the provided context.

        Context:
        {context}

        Question:
        {question}
        """)

        chain = prompt | self.llm

        try:
            response = chain.invoke({"context": context, "question": user_question})
        except Exception as e:
            print("[ERROR] LLM Call Failed:", str(e))
            raise

        return self._extract_text(response.content)

    def generate_skill_recommendations(
        self, resume_text: str, missing_skills: List[str]
    ) -> List[Dict]:
        print("\n[DEBUG] ===== SKILL RECOMMENDATION FUNCTION START =====")

        prompt = PromptTemplate.from_template("""
        Provide learning recommendations.

        Resume:
        {resume}

        Missing Skills:
        {missing_skills}

        Return ONLY JSON:
        [
          {{
            "skill": "",
            "importance": "",
            "resources": [],
            "learning_time": ""
          }}
        ]
        """)

        chain = prompt | self.llm

        try:
            response = chain.invoke({
                "resume": resume_text,
                "missing_skills": ", ".join(missing_skills)
            })
        except Exception as e:
            print("[ERROR] LLM Call Failed:", str(e))
            raise

        try:
            raw_text = self._extract_text(response.content)
            cleaned = re.sub(r"```json|```", "", raw_text).strip()
            return json.loads(cleaned)
        except Exception as e:
            print("[ERROR] JSON Parsing Failed:", str(e))
            return []