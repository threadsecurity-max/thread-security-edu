from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from app.config import QDRANT_URL, QDRANT_API_KEY

class VectorStore:
    def __init__(self):
        self.client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        self.embedder = SentenceTransformer("BAAI/bge-small-en-v1.5")
        self.collection_name = "thread_security_docs"
        
    def search(self, query: str, top_k: int = 5):
        query_vector = self.embedder.encode(query).tolist()
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=top_k
        )
        return results
