import os
import json
import uuid
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

# Use environment variables or defaults
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

COLLECTION_NAME = "thread_security_docs"

def dict_to_text(data_dict, title=""):
    """Converts a dictionary into a readable text chunk for the LLM."""
    text = f"{title}\n" if title else ""
    for k, v in data_dict.items():
        if isinstance(v, list):
            text += f"{k.replace('_', ' ').title()}:\n"
            for item in v:
                if isinstance(item, dict):
                    text += "  - " + ", ".join(f"{sub_k}: {sub_v}" for sub_k, sub_v in item.items()) + "\n"
                else:
                    text += f"  - {item}\n"
        elif isinstance(v, dict):
            text += f"{k.replace('_', ' ').title()}: {json.dumps(v)}\n"
        else:
            text += f"{k.replace('_', ' ').title()}: {v}\n"
    return text.strip()

def extract_chunks(data_dir):
    chunks = []
    
    # 1. Process platform info
    platform_path = os.path.join(data_dir, "platform_info.json")
    if os.path.exists(platform_path):
        with open(platform_path, 'r') as f:
            data = json.load(f)
            text = dict_to_text(data, "ThreadSecurity Platform & Student Benefits Info")
            chunks.append({"text": text, "source": "platform_info", "type": "general"})

    # 2. Process mentors
    mentors_path = os.path.join(data_dir, "mentors.json")
    if os.path.exists(mentors_path):
        with open(mentors_path, 'r') as f:
            data = json.load(f)
            for mentor in data.get("mentors", []):
                text = dict_to_text(mentor, f"Mentor Profile: {mentor.get('name')}")
                chunks.append({"text": text, "source": "mentors", "type": "mentor"})

    # 3. Process projects
    projects_path = os.path.join(data_dir, "projects.json")
    if os.path.exists(projects_path):
        with open(projects_path, 'r') as f:
            data = json.load(f)
            for proj in data.get("projects", []):
                text = dict_to_text(proj, f"Real-world Project: {proj.get('title')}")
                chunks.append({"text": text, "source": "projects", "type": "project"})

    # 4. Process courses
    courses_dir = os.path.join(data_dir, "courses")
    if os.path.exists(courses_dir):
        for filename in os.listdir(courses_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(courses_dir, filename)
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    domain = data.get("domain", "")
                    program_type = data.get("program_type", "")
                    duration = data.get("duration", "")
                    
                    # Handle multiple courses inside a single file
                    if "courses" in data:
                        for course in data["courses"]:
                            course_meta = {"domain": domain, "program_type": program_type, "duration": duration, **course}
                            text = dict_to_text(course_meta, f"Course Info: {course.get('course_name', '')}")
                            chunks.append({"text": text, "source": filename, "type": "course"})
                    
                    # Handle tracks (fellowships) inside a single file
                    elif "tracks" in data:
                        for track in data["tracks"]:
                            track_meta = {"domain": domain, "program_type": program_type, "duration": duration, **track}
                            text = dict_to_text(track_meta, f"Fellowship Track: {track.get('track_name', '')}")
                            chunks.append({"text": text, "source": filename, "type": "fellowship_track"})
                    
                    # Handle single course files
                    elif "modules" in data:
                         text = dict_to_text(data, f"Course Info: {data.get('title', '')}")
                         chunks.append({"text": text, "source": filename, "type": "course"})

    return chunks

def index_data():
    data_dir = os.path.join(os.path.dirname(__file__))
    print(f"Extracting chunks from {data_dir}...")
    
    chunks = extract_chunks(data_dir)
    print(f"Generated {len(chunks)} text chunks.")
    
    print("Loading embedding model (BAAI/bge-small-en-v1.5)...")
    embedder = SentenceTransformer("BAAI/bge-small-en-v1.5")
    
    print("Connecting to Qdrant...")
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    
    # Recreate collection to ensure clean state
    print(f"Recreating collection '{COLLECTION_NAME}'...")
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )
    
    points = []
    print("Embedding chunks and preparing points...")
    for idx, chunk in enumerate(chunks):
        text = chunk["text"]
        vector = embedder.encode(text).tolist()
        point_id = str(uuid.uuid4())
        
        points.append(
            PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "text": text,
                    "source": chunk["source"],
                    "type": chunk["type"]
                }
            )
        )
    
    print(f"Pushing {len(points)} points to Qdrant...")
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    
    print("Indexing complete! Knowledge base is ready.")

if __name__ == "__main__":
    index_data()
