from sentence_transformers import CrossEncoder

class Reranker:
    def __init__(self):
        # Using a smaller cross-encoder for latency
        self.model = CrossEncoder("BAAI/bge-reranker-base")
        
    def rerank(self, query: str, documents: list[str], top_k: int = 3):
        pairs = [[query, doc] for doc in documents]
        scores = self.model.predict(pairs)
        
        # Combine docs and scores
        scored_docs = list(zip(documents, scores))
        # Sort by score descending
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        
        return scored_docs[:top_k]
