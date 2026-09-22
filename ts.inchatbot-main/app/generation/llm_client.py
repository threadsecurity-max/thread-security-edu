from groq import Groq

from app.config import GROQ_API_KEY, GROQ_MODEL


class LLMClient:
    def __init__(self):
        self.provider = "groq"
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = self._resolve_model()

    def _resolve_model(self) -> str:
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is missing. Set it in the environment or .env file.")

        return GROQ_MODEL

    def generate_stream(self, prompt: str, system_message: str):
        stream = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt},
            ],
            model=self.model,
            temperature=0.0,
            stream=True,
        )

        for chunk in stream:
            choices = getattr(chunk, "choices", None) or []
            if not choices:
                continue

            for choice in choices:
                delta = getattr(choice, "delta", None)
                if delta is None:
                    continue

                content = getattr(delta, "content", None)
                if content:
                    yield content
