import os
import sys
import re

# Ensure the root directory is in the path to import data.chunker
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))

from app.retrieval.qdrant_client import VectorStore
from app.retrieval.bm25 import BM25Retriever
from data.chunker import extract_chunks

COURSE_ALIASES = {
    "Python for AI": ["python ai", "python for artificial intelligence"],
    "Data Analysis": ["data analytics", "analytics"],
    "Data Science": ["data science"],
    "Machine Learning": ["machine learning", "ml"],
    "Deep Learning": ["deep learning", "dl"],
    "Foundational AI": ["foundational ai", "foundation ai", "ai foundation"],
    "Agentic AI and Intelligent System Engineering": ["agentic ai", "intelligent systems", "ai agents", "multi agent"],
    "AI Engineering & Generative AI": ["ai engineering", "generative ai", "gen ai"],
    "AI Infrastructure, Cloud & LLMOps Engineering": ["ai infrastructure", "cloud ai", "llmops", "mlops"],
    "AI Security & Responsible AI Engineering": ["ai security", "responsible ai"],
    "Cyber Fundamentals": ["cyber fundamentals", "cyber basics", "cybersecurity basics"],
    "Computer Networking & Network Security": ["computer networking", "network security", "networking security"],
    "Ethical Hacking & Offensive Security": ["ethical hacking", "offensive security"],
    "Vulnerability Assessment & Penetration Testing (VAPT)": ["vapt", "vulnerability assessment", "penetration testing", "pentest"],
    "Security Operations Center (SOC) & Blue Team": ["soc", "soc analyst", "blue team", "security operations center"],
    "Advanced Cybersecurity & Red Team Operations": ["advanced cybersecurity", "red team", "red team operations"],
    "Red Team Operations & Offensive Security": ["red team operations", "red teaming"],
    "Blue Team Operations & Defensive Security": ["blue team operations", "blue teaming", "defensive security"],
    "Bug Bounty Hunting & Web Application Security": ["bug bounty", "web application security", "web app security"],
    "Linux for Cybersecurity & Security Operations": ["linux cybersecurity", "linux for security", "linux security"],
}


class HybridRetriever:
    def __init__(self):
        self.vector_store = VectorStore()
        self.bm25_retriever = BM25Retriever()
        self._initialize_bm25()
        
    def _initialize_bm25(self):
        """Loads documents into the local BM25 index on startup."""
        data_dir = os.path.join(os.path.dirname(__file__), '../../data')
        chunks = extract_chunks(data_dir)
        self.documents = [c["text"] for c in chunks]
        self.course_documents = [
            c["text"] for c in chunks
            if c["type"] in {"course", "fellowship_track"}
        ]
        self.bm25_retriever.index(self.documents)

    @staticmethod
    def _query_terms(query: str) -> set[str]:
        stop_words = {
            "a", "about", "all", "and", "are", "course", "courses", "details",
            "do", "for", "give", "i", "in", "is", "me", "of", "please", "tell",
            "the", "this", "what", "which", "with", "ai", "artificial", "intelligence",
            "cyber", "cybersecurity", "security",
        }
        return set(re.findall(r"[a-z0-9]+", query.lower())) - stop_words

    def _find_specific_course_documents(self, query: str) -> list[str]:
        query_lower = query.lower()
        broad_catalog_markers = [
            "all courses", "all the courses", "every course", "each course",
            "ai courses", "cyber courses", "what do you offer", "what you offer",
            "course catalogue", "course catalog", "all programs", "all tracks",
        ]
        if any(marker in query_lower for marker in broad_catalog_markers):
            return []

        domain_only_query = re.fullmatch(
            r"(?:show me |tell me about |what are |what is |give me )?"
            r"(?:ai|artificial intelligence|cyber|cybersecurity|cyber security)"
            r"(?: courses?| programs?| catalogue| catalog)?[?.! ]*",
            query_lower,
        )
        if domain_only_query:
            return []

        query_terms = self._query_terms(query)
        if not query_terms:
            return []

        matches = []
        for document in self.course_documents:
            title = document.split("\n", 1)[0]
            title_terms = set(re.findall(r"[a-z0-9]+", title.lower()))
            title_matches = query_terms <= title_terms
            alias_matches = any(
                alias in query_lower and title.lower().endswith(course_name.lower())
                for course_name, aliases in COURSE_ALIASES.items()
                for alias in aliases
            )
            if title_matches or alias_matches:
                matches.append(document)

        return matches

    def search(self, query: str, top_k: int = 5):
        """
        Performs Hybrid Search using Reciprocal Rank Fusion (RRF) 
        to combine Semantic (Qdrant) and Keyword (BM25) search results.
        """
        query_lower = query.lower()
        specific_course_documents = self._find_specific_course_documents(query)
        if specific_course_documents:
            return specific_course_documents

        is_specific = any(
            keyword in query_lower
            for keyword in [
                "45 day", "45-day", "6 month", "6-month", "fellowship", "foundational",
                "tell me about", "what is", "explain", "details", "describe", "which course",
                "which program", "syllabus", "curriculum", "what will i learn",
            ]
        )
        requested_domain = None
        if not is_specific and any(term in query_lower for term in ["ai", "artificial intelligence"]):
            requested_domain = "artificial intelligence"
        elif not is_specific and any(term in query_lower for term in ["cyber", "cybersecurity", "security"]):
            requested_domain = "cybersecurity"

        if requested_domain:
            matching_courses = [
                document for document in self.course_documents
                if f"domain: {requested_domain}" in document.lower()
            ]
            if matching_courses:
                return matching_courses

        # 1. Semantic Search (Qdrant)
        try:
            qdrant_results = self.vector_store.search(query, top_k=top_k)
        except Exception as e:
            print(f"Warning: Qdrant search failed ({e}). Falling back to BM25 only.")
            qdrant_results = []
        
        # 2. Keyword Search (BM25)
        bm25_results = self.bm25_retriever.search(query, top_k=top_k)
        
        # 3. Reciprocal Rank Fusion (RRF) algorithm
        rrf_scores = {}
        
        # Rank Qdrant results (k=60 is standard for RRF)
        for rank, res in enumerate(qdrant_results):
            text = res.payload.get("text", "")
            if text not in rrf_scores:
                rrf_scores[text] = 0.0
            rrf_scores[text] += 1.0 / (60 + rank)
            
        # Rank BM25 results
        for rank, res in enumerate(bm25_results):
            text = res["document"]
            if text not in rrf_scores:
                rrf_scores[text] = 0.0
            rrf_scores[text] += 1.0 / (60 + rank)
            
        query_terms = self._query_terms(query)
        ranked_results = []
        for text, score in rrf_scores.items():
            title = text.split("\n", 1)[0].lower()
            title_terms = set(re.findall(r"[a-z0-9]+", title))
            title_match = bool(query_terms) and query_terms <= title_terms
            ranked_results.append((text, score + (1.0 if title_match else 0.0)))

        sorted_results = sorted(ranked_results, key=lambda item: item[1], reverse=True)
        
        # Return the top_k text contexts for the LLM
        return [item[0] for item in sorted_results[:top_k]]

# Example usage/testing
if __name__ == "__main__":
    retriever = HybridRetriever()
    results = retriever.search("Tell me about Red Teaming")
    print("Top Hybrid Results:")
    for i, res in enumerate(results):
        print(f"\n--- Result {i+1} ---")
        print(res)
