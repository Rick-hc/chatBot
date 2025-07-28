import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
import logging
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class ChromaClient:
    def __init__(self, persist_directory: str = "./chroma_db"):
        try:
            self.client = chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(
                    allow_reset=True,
                    anonymized_telemetry=False,
                    persist_directory=persist_directory
                )
            )
            self.collection_name = "qa_embeddings"
            self.collection = None
            logger.info(f"ChromaDB client initialized with persist_directory: {persist_directory}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB client: {e}")
            raise
        
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    def get_or_create_collection(self):
        try:
            logger.info(f"Getting or creating collection: {self.collection_name}")
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"Collection '{self.collection_name}' ready")
            return self.collection
        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
            raise
    
    def add_documents(self, documents: List[str], metadatas: List[Dict], ids: List[str], embeddings: Optional[List[List[float]]] = None):
        if not self.collection:
            self.get_or_create_collection()
        
        try:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids,
                embeddings=embeddings
            )
            logger.info(f"Added {len(documents)} documents to collection")
        except Exception as e:
            logger.error(f"Failed to add documents: {e}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    def search_similar(self, query_embeddings: List[List[float]], n_results: int = 20) -> Dict:
        if not self.collection:
            self.get_or_create_collection()
        
        try:
            logger.info(f"Searching for {n_results} similar documents")
            
            if not query_embeddings or not query_embeddings[0]:
                raise ValueError("Query embeddings cannot be empty")
            
            results = self.collection.query(
                query_embeddings=query_embeddings,
                n_results=min(n_results, self.count_documents()),
                include=["documents", "metadatas", "distances"]
            )
            
            logger.info(f"Search completed, found {len(results.get('ids', []))} results")
            return results
            
        except Exception as e:
            logger.error(f"Failed to search: {e}")
            raise
    
    def delete_collection(self):
        try:
            self.client.delete_collection(name=self.collection_name)
            logger.info(f"Deleted collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Failed to delete collection: {e}")
            raise
    
    def count_documents(self) -> int:
        if not self.collection:
            self.get_or_create_collection()
        
        try:
            return self.collection.count()
        except Exception as e:
            logger.error(f"Failed to count documents: {e}")
            return 0