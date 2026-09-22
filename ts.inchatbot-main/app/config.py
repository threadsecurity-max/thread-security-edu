import os
from dotenv import load_dotenv

load_dotenv(override=True)

# Vector DB
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

# LLM Providers
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# Cache
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Authentication
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key")
JWT_ALGORITHM = "HS256"

# Thresholds
CONFIDENCE_THRESHOLD = 0.75
TTFT_TARGET_MS = 500
