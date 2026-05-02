import json
import os
from typing import List, Tuple
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import get_settings

settings = get_settings()

class EmbeddingService:
    """Service for generating and managing embeddings"""
    
    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.index = None
        self.metadata = []
        self.index_path = settings.FAISS_INDEX_PATH
        self.metadata_path = f"{self.index_path}_metadata.json"
        
        # Try to load existing index
        if os.path.exists(self.index_path):
            self.load_index()
    
    def split_text(self, text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
        """Split text into chunks"""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = splitter.split_text(text)
        return chunks
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for texts"""
        embeddings = self.model.encode(texts, show_progress_bar=False)
        return embeddings
    
    def create_index(self, texts: List[str], metadata: List[dict] = None):
        """Create FAISS index from texts"""
        embeddings = self.generate_embeddings(texts)
        
        # Initialize FAISS index
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embeddings.astype(np.float32))
        
        # Store metadata
        if metadata is None:
            self.metadata = [{"text": text} for text in texts]
        else:
            self.metadata = metadata
        
        self.save_index()
    
    def search(self, query: str, k: int = 5) -> List[Tuple[str, float]]:
        """Search for similar documents"""
        if self.index is None:
            return []
        
        query_embedding = self.generate_embeddings([query])[0]
        distances, indices = self.index.search(
            np.array([query_embedding]).astype(np.float32), k
        )
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.metadata):
                results.append((
                    self.metadata[idx]["text"],
                    float(distances[0][i])
                ))
        
        return results
    
    def save_index(self):
        """Save FAISS index to disk"""
        os.makedirs(self.index_path, exist_ok=True)
        faiss.write_index(self.index, os.path.join(self.index_path, "index.faiss"))
        
        # Save metadata
        with open(self.metadata_path, "w") as f:
            json.dump(self.metadata, f)
    
    def load_index(self):
        """Load FAISS index from disk"""
        try:
            index_file = os.path.join(self.index_path, "index.faiss")
            if os.path.exists(index_file):
                self.index = faiss.read_index(index_file)
            
            if os.path.exists(self.metadata_path):
                with open(self.metadata_path, "r") as f:
                    self.metadata = json.load(f)
        except Exception as e:
            print(f"Error loading index: {e}")
