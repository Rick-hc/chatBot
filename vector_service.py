#!/usr/bin/env python3
"""
Vector Embedding and Search Service for Excel Q&A Data
"""

import os
import json
import numpy as np
import faiss
from typing import List, Dict, Any, Tuple
from openai import OpenAI
from dotenv import load_dotenv
import logging
import pickle

from excel_loader import ExcelQALoader

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self, 
                 embedding_model: str = "text-embedding-3-large",
                 index_file: str = "qa_embeddings.index",
                 metadata_file: str = "qa_metadata.pkl"):
        
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.embedding_model = embedding_model
        self.index_file = index_file
        self.metadata_file = metadata_file
        
        self.index = None
        self.metadata = []
        self.dimension = 3072  # text-embedding-3-large dimension
        
        # Try to load existing index
        self._load_existing_index()
    
    def _load_existing_index(self):
        """Load existing FAISS index and metadata if available"""
        try:
            if os.path.exists(self.index_file) and os.path.exists(self.metadata_file):
                self.index = faiss.read_index(self.index_file)
                with open(self.metadata_file, 'rb') as f:
                    self.metadata = pickle.load(f)
                logger.info(f"Loaded existing index with {len(self.metadata)} records")
                return True
        except Exception as e:
            logger.error(f"Error loading existing index: {e}")
        
        return False
    
    def _save_index(self):
        """Save FAISS index and metadata to disk"""
        try:
            if self.index is not None:
                faiss.write_index(self.index, self.index_file)
                with open(self.metadata_file, 'wb') as f:
                    pickle.dump(self.metadata, f)
                logger.info(f"Saved index with {len(self.metadata)} records")
        except Exception as e:
            logger.error(f"Error saving index: {e}")
    
    def create_embedding(self, text: str) -> List[float]:
        """Create embedding for a single text"""
        try:
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error creating embedding: {e}")
            return None
    
    def build_index_from_excel(self, force_rebuild: bool = False) -> bool:
        """Build FAISS index from Excel data"""
        try:
            # Skip if index exists and not forcing rebuild
            if not force_rebuild and self.index is not None and len(self.metadata) > 0:
                logger.info("Index already exists, skipping rebuild")
                return True
            
            # Load Excel data
            loader = ExcelQALoader()
            records = loader.load_excel_files()
            
            if not records:
                logger.error("No records loaded from Excel files")
                return False
            
            logger.info(f"Building embeddings for {len(records)} records...")
            
            # Create embeddings for all questions
            embeddings = []
            valid_records = []
            
            for i, record in enumerate(records):
                if i % 10 == 0:
                    logger.info(f"Processing record {i+1}/{len(records)}")
                
                embedding = self.create_embedding(record['question'])
                if embedding is not None:
                    embeddings.append(embedding)
                    valid_records.append(record)
                else:
                    logger.warning(f"Failed to create embedding for record {record['id']}")
            
            if not embeddings:
                logger.error("No valid embeddings created")
                return False
            
            # Convert to numpy array
            embeddings_array = np.array(embeddings, dtype=np.float32)
            
            # Create FAISS index
            self.index = faiss.IndexFlatIP(self.dimension)  # Inner product for cosine similarity
            
            # Normalize vectors for cosine similarity
            faiss.normalize_L2(embeddings_array)
            
            # Add to index
            self.index.add(embeddings_array)
            self.metadata = valid_records
            
            # Save to disk
            self._save_index()
            
            logger.info(f"Successfully built index with {len(valid_records)} records")
            return True
            
        except Exception as e:
            logger.error(f"Error building index: {e}")
            return False
    
    def search_similar(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar questions"""
        try:
            if self.index is None or not self.metadata:
                logger.error("Index not built yet")
                return []
            
            # Create embedding for query
            query_embedding = self.create_embedding(query)
            if query_embedding is None:
                logger.error("Failed to create query embedding")
                return []
            
            # Convert to numpy array and normalize
            query_array = np.array([query_embedding], dtype=np.float32)
            faiss.normalize_L2(query_array)
            
            # Search
            scores, indices = self.index.search(query_array, min(top_k, len(self.metadata)))
            
            # Prepare results
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < len(self.metadata):
                    record = self.metadata[idx].copy()
                    record['similarity_score'] = float(score)
                    results.append(record)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching: {e}")
            return []
    
    def get_answer_by_id(self, record_id: str) -> str:
        """Get answer by record ID"""
        try:
            for record in self.metadata:
                if record['id'] == record_id:
                    return record['answer']
            return None
        except Exception as e:
            logger.error(f"Error getting answer by ID: {e}")
            return None
    
    def get_stats(self) -> Dict[str, Any]:
        """Get service statistics"""
        return {
            "total_records": len(self.metadata) if self.metadata else 0,
            "index_built": self.index is not None,
            "embedding_model": self.embedding_model,
            "dimension": self.dimension
        }

if __name__ == "__main__":
    # Test the vector service
    logging.basicConfig(level=logging.INFO)
    
    service = VectorService()
    
    # Build index
    print("Building index from Excel data...")
    success = service.build_index_from_excel()
    
    if success:
        print(f"Index built successfully!")
        print(f"Stats: {service.get_stats()}")
        
        # Test search
        query = "マーケティングとは何ですか？"
        print(f"\nSearching for: {query}")
        results = service.search_similar(query, top_k=3)
        
        for i, result in enumerate(results):
            print(f"\nResult {i+1}:")
            print(f"ID: {result['id']}")
            print(f"Score: {result['similarity_score']:.4f}")
            print(f"Q: {result['question'][:100]}...")
            print(f"A: {result['answer'][:100]}...")
    else:
        print("Failed to build index")