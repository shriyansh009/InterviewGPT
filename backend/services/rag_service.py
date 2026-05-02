import json
from typing import List, Dict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from config import get_settings

settings = get_settings()


class RAGService:
    """Service for Retrieval-Augmented Generation"""

    def __init__(self, embedding_service):
        self.embedding_service = embedding_service
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7
        )

    # ✅ ATS SCORE
    def generate_ats_score(self, resume_text: str, job_description: str) -> Dict:

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

        response = chain.invoke({
            "resume": resume_text,
            "job_description": job_description
        })

        try:
            return json.loads(response.content)
        except:
            return {
                "ats_score": 0,
                "missing_skills": [],
                "matching_skills": [],
                "suggestions": []
            }

    # ✅ INTERVIEW QUESTIONS
    def generate_interview_questions(
        self,
        resume_text: str,
        job_description: str,
        question_type: str = "general"
    ) -> List[Dict]:

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

        response = chain.invoke({
            "resume": resume_text,
            "job_description": job_description,
            "type": type_prompt.get(question_type)
        })

        try:
            return json.loads(response.content)
        except:
            return []

    def generate_contextual_answer(
        self,
        user_question: str,
        context_texts: List[str]
    ) -> str:

        context = "\n".join(context_texts)

        prompt = PromptTemplate.from_template("""
        Answer using ONLY the provided context.

        Context:
        {context}

        Question:
        {question}
        """)

        chain = prompt | self.llm

        response = chain.invoke({
            "context": context,
            "question": user_question
        })

        return response.content

    def generate_skill_recommendations(
        self,
        resume_text: str,
        missing_skills: List[str]
    ) -> List[Dict]:

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

        response = chain.invoke({
            "resume": resume_text,
            "missing_skills": ", ".join(missing_skills)
        })

        try:
            return json.loads(response.content)
        except:
            return []