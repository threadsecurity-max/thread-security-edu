from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, AsyncGenerator
import hashlib
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.cache.redis_client import CacheClient
from app.retrieval.hybrid_search import HybridRetriever
from app.generation.llm_client import LLMClient
from app.generation.prompts import SYSTEM_PROMPT, build_prompt, check_hardcoded_response, is_broad_catalog_query

# Setup FastAPI
app = FastAPI(title="ThreadSecurity RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str
    session_id: str

# Initialize Singleton Services
cache_client = CacheClient()
retriever = HybridRetriever()
llm_client = LLMClient()

@app.get("/")
async def health_check():
    return {"status": "ok", "service": "ThreadSecurity Chatbot API is running"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, authorization: Optional[str] = Header(None)):
    query = request.query.strip()
    logger.info(f"Received query: {query[:50]}")

    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    hardcoded = check_hardcoded_response(query)
    if hardcoded:
        logger.info("Returning hardcoded response for NLP shortcut")
        async def hardcoded_stream():
            yield hardcoded
        return StreamingResponse(hardcoded_stream(), media_type="text/plain; charset=utf-8")

    # 1. Check Redis Cache
    query_hash = hashlib.md5(query.lower().encode()).hexdigest()
    cache_key = f"chat_cache:{query_hash}"

    cached_response = cache_client.get(cache_key)
    if cached_response:
        logger.info("Returning cached response")
        async def cached_stream():
            yield cached_response
        return StreamingResponse(cached_stream(), media_type="text/plain; charset=utf-8")

    # 2. Retrieve Context
    logger.info("Running hybrid search...")
    try:
        # A catalogue question needs enough context for every course or track.
        # Focused questions stay small so unrelated programs cannot dilute the answer.
        retrieval_limit = 12 if is_broad_catalog_query(query) else 5
        top_contexts = retriever.search(query, top_k=retrieval_limit)
        logger.info(f"Got {len(top_contexts)} contexts")
    except Exception as e:
        logger.error(f"Retriever error: {e}")
        top_contexts = []

    # 3. Build Prompt
    final_prompt = build_prompt(query, top_contexts)

    # 4. Stream response
    async def stream_response() -> AsyncGenerator[str, None]:
        try:
            logger.info(f"Calling LLM with model: {llm_client.model}")
            loop = asyncio.get_running_loop()
            chunks = await loop.run_in_executor(
                None,
                lambda: list(llm_client.generate_stream(final_prompt, SYSTEM_PROMPT))
            )
            logger.info(f"Got {len(chunks)} chunks from LLM")
            full_response = []
            for chunk in chunks:
                full_response.append(chunk)
                yield chunk
                await asyncio.sleep(0)
            cache_client.set(cache_key, "".join(full_response), ttl=3600)
            logger.info("Stream completed successfully")
        except Exception as e:
            logger.error(f"LLM streaming error: {type(e).__name__}: {e}")
            yield f"\n\n*Error: Could not get a response from the AI model. ({type(e).__name__}: {str(e)})*"

    return StreamingResponse(stream_response(), media_type="text/plain; charset=utf-8")
