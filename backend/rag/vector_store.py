import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import uuid

# Configuration
CHROMA_DATA_PATH = "chroma_db_v2"
MODEL_NAME = "all-MiniLM-L6-v2"

class VectorStore:
    def __init__(self):
        # Initialize the embedding model
        self.model = SentenceTransformer(MODEL_NAME)
        
        # Initialize ChromaDB client (Persistent)
        self.client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)
        
        # Get or create the collection
        self.collection = self.client.get_or_create_collection(
            name="hr_policies",
            metadata={"hnsw:space": "cosine"} # Use cosine similarity
        )

    def upsert_chunks(self, chunks):
        """
        Chunks list of dicts: [{"chunk_id": str, "text": str, "doc_id": str, "doc_title": str}]
        """
        if not chunks:
            return
            
        ids = [c["chunk_id"] for c in chunks]
        documents = [c["text"] for c in chunks]
        metadatas = [{"doc_id": c["doc_id"], "doc_title": c.get("doc_title", "Unknown")} for c in chunks]
        
        # Generate embeddings
        embeddings = self.model.encode(documents).tolist()
        
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )

    def search_similar(self, query, n_results=5):
        """
        Returns list of strings (documents)
        """
        query_embedding = self.model.encode([query]).tolist()
        
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=n_results
        )
        
        # Flatten results and return document texts
        if results and results["documents"]:
            return results["documents"][0]
        return []

    def get_match_score(self, query):
        """
        Returns the highest similarity score (1 - distance)
        """
        query_embedding = self.model.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=1
        )
        if results and results["distances"] and results["distances"][0]:
            # Chroma distances are usually squared L2 or cosine distance (1 - similarity)
            # For 'cosine' space, score = 1 - distance
            return 1.0 - results["distances"][0][0]
        return 0.0

# Singleton instance
vector_store = VectorStore()
