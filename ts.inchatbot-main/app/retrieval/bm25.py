from rank_bm25 import BM25Okapi

class BM25Retriever:
    def __init__(self):
        self.corpus = []
        self.tokenized_corpus = []
        self.bm25 = None
        
    def index(self, documents):
        self.corpus = documents
        self.tokenized_corpus = [doc.split(" ") for doc in self.corpus]
        self.bm25 = BM25Okapi(self.tokenized_corpus)
        
    def search(self, query: str, top_k: int = 5):
        if not self.bm25:
            return []
        tokenized_query = query.split(" ")
        # Get scores
        doc_scores = self.bm25.get_scores(tokenized_query)
        # Sort and return top_k
        top_indices = sorted(range(len(doc_scores)), key=lambda i: doc_scores[i], reverse=True)[:top_k]
        return [{"document": self.corpus[i], "score": doc_scores[i]} for i in top_indices]
