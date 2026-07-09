import structlog
from app.config import get_settings

logger = structlog.get_logger()


class LLMService:
    def __init__(self):
        self.settings = get_settings()
        self._client = None
        self._groq_client = None

    def _get_client(self):
        if self._client is None and self.settings.llm_api_key:
            from openai import OpenAI
            self._client = OpenAI(
                api_key=self.settings.llm_api_key,
                base_url=self.settings.llm_base_url,
            )
        return self._client

    def _get_groq(self):
        if self._groq_client is None and self.settings.groq_api_key:
            from groq import Groq
            self._groq_client = Groq(api_key=self.settings.groq_api_key)
        return self._groq_client

    async def generate(self, system_prompt: str, context: str, messages: list[dict], user_message: str) -> str:
        full_user_content = f"{context}\n\n---\n\n**User Question:** {user_message}"

        try:
            client = self._get_client()
            if client:
                return self._call(client, self.settings.llm_model, system_prompt, messages, full_user_content)
        except Exception as e:
            logger.warning("Primary LLM failed, falling back to Groq", error=str(e))

        try:
            groq = self._get_groq()
            if groq:
                return self._call(groq, "llama-3.3-70b-versatile", system_prompt, messages, full_user_content)
        except Exception as e:
            logger.error("Groq fallback also failed", error=str(e))

        return "I'm having trouble connecting to the AI service right now. Please try again in a moment."

    def _call(self, client, model: str, system_prompt: str, history: list, user_message: str) -> str:
        msgs = [{"role": "system", "content": system_prompt}]
        for msg in history[-10:]:
            role = "user" if msg["role"] == "USER" else "assistant"
            msgs.append({"role": role, "content": msg["content"]})
        msgs.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model=model,
            messages=msgs,
            max_tokens=1024,
            temperature=0.7,
        )
        return response.choices[0].message.content


llm_service = LLMService()
