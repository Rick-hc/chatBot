import asyncio
import numpy as np
from typing import List, Dict, Optional, Tuple
import logging
from concurrent.futures import ThreadPoolExecutor
from sklearn.metrics.pairwise import cosine_similarity
import faiss
import pickle
import os

from app.core.cache import cache_result, cache
from app.core.circuit_breaker import circuit_breaker, CircuitBreakerConfig
from app.db.chroma_client import ChromaClient

logger = logging.getLogger(__name__)

class UltraFastVectorService:
    def __init__(self):
        self.chroma_client = ChromaClient()
        self.memory_index: Optional[faiss.IndexFlatIP] = None
        self.qa_embeddings: List[np.ndarray] = []
        self.qa_metadata: List[Dict] = []
        self.executor = ThreadPoolExecutor(max_workers=8)
        self.index_loaded = False
        
    async def initialize(self):
        """Initialize all components for maximum speed"""
        try:
            await asyncio.gather(
                self._load_memory_index(),
                self.chroma_client.get_or_create_collection(),
                cache.initialize_redis()
            )
            logger.info("Vector service initialized successfully")
        except Exception as e:
            logger.error(f"Vector service initialization error: {e}")
    
    async def _load_memory_index(self):
        """Load FAISS index into memory for instant search"""
        try:
            index_path = "./faiss_index.pkl"
            if os.path.exists(index_path):
                loop = asyncio.get_event_loop()
                with ThreadPoolExecutor() as executor:
                    index_data = await loop.run_in_executor(
                        executor, self._load_index_sync, index_path
                    )
                    
                self.memory_index = index_data["index"]
                self.qa_embeddings = index_data["embeddings"]
                self.qa_metadata = index_data["metadata"]
                self.index_loaded = True
                logger.info(f"Memory index loaded: {len(self.qa_embeddings)} vectors")
            else:
                await self._build_memory_index()
        except Exception as e:
            logger.warning(f"Memory index load error: {e}")
    
    def _load_index_sync(self, path: str) -> Dict:
        with open(path, 'rb') as f:
            return pickle.load(f)
    
    async def _build_memory_index(self):
        """Build FAISS index from existing data"""
        try:
            # This would load from your QA data source
            logger.info("Building memory index from scratch...")
            # Implementation would depend on your data source
            pass
        except Exception as e:
            logger.error(f"Index build error: {e}")
    
    @circuit_breaker(CircuitBreakerConfig(failure_threshold=3, recovery_timeout=30))
    @cache_result("vector_search", ttl=1800)
    async def ultra_fast_search(
        self, 
        query_embedding: List[float], 
        top_k: int = 20
    ) -> List[Dict]:
        """Ultra-fast vector search with multiple fallback strategies"""
        
        # Strategy 1: Memory index (fastest - microseconds)
        if self.index_loaded and self.memory_index:
            try:
                results = await self._search_memory_index(query_embedding, top_k)
                if results:
                    logger.debug("Memory index search successful")
                    return results
            except Exception as e:
                logger.warning(f"Memory index search failed: {e}")
        
        # Strategy 2: Parallel search across multiple backends
        search_tasks = []
        
        # Chroma search
        search_tasks.append(self._search_chroma(query_embedding, top_k))
        
        # Direct numpy search (fallback)
        search_tasks.append(self._search_numpy_fallback(query_embedding, top_k))
        
        # Execute searches in parallel and return first successful result
        for task in asyncio.as_completed(search_tasks):
            try:
                result = await task
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Search strategy failed: {e}")
                continue
        
        # Final fallback: empty result with error logging
        logger.error("All search strategies failed")
        return []
    
    async def _search_memory_index(
        self, 
        query_embedding: List[float], 
        top_k: int
    ) -> List[Dict]:
        """Search using in-memory FAISS index"""
        if not self.memory_index or not self.qa_embeddings:
            return []
        
        loop = asyncio.get_event_loop()
        query_vector = np.array([query_embedding], dtype=np.float32)
        
        # Run FAISS search in thread pool
        with ThreadPoolExecutor() as executor:
            scores, indices = await loop.run_in_executor(
                executor,
                lambda: self.memory_index.search(query_vector, min(top_k, len(self.qa_embeddings)))
            )
        
        results = []
        for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
            if idx >= 0 and idx < len(self.qa_metadata):
                result = self.qa_metadata[idx].copy()
                result["similarity"] = float(score)
                results.append(result)
        
        return results
    
    async def _search_chroma(
        self, 
        query_embedding: List[float], 
        top_k: int
    ) -> List[Dict]:
        """Search using Chroma with timeout"""
        try:
            results = await asyncio.wait_for(
                self.chroma_client.search_similar([query_embedding], top_k),
                timeout=1.0
            )
            
            formatted_results = []
            if results and "ids" in results:
                for i, doc_id in enumerate(results["ids"][0]):
                    formatted_results.append({
                        "id": doc_id,
                        "question": results.get("documents", [[]])[0][i] if results.get("documents") else "",
                        "answer": results.get("metadatas", [{}])[0][i].get("answer", "") if results.get("metadatas") else "",
                        "similarity": 1.0 - results.get("distances", [0])[0][i] if results.get("distances") else 0.0
                    })
            
            return formatted_results
        except asyncio.TimeoutError:
            logger.warning("Chroma search timeout")
            return []
        except Exception as e:
            logger.error(f"Chroma search error: {e}")
            return []
    
    async def _search_numpy_fallback(
        self, 
        query_embedding: List[float], 
        top_k: int
    ) -> List[Dict]:
        """Fallback numpy-based search"""
        if not self.qa_embeddings:
            return []
        
        try:
            query_vector = np.array(query_embedding).reshape(1, -1)
            
            # Parallel similarity computation
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                similarities = await loop.run_in_executor(
                    executor,
                    lambda: [
                        cosine_similarity(query_vector, emb.reshape(1, -1))[0][0]
                        for emb in self.qa_embeddings
                    ]
                )
            
            # Get top-k results
            indexed_similarities = list(enumerate(similarities))
            indexed_similarities.sort(key=lambda x: x[1], reverse=True)
            
            results = []
            for idx, similarity in indexed_similarities[:top_k]:
                if idx < len(self.qa_metadata):
                    result = self.qa_metadata[idx].copy()
                    result["similarity"] = float(similarity)
                    results.append(result)
            
            return results
        except Exception as e:
            logger.error(f"Numpy fallback search error: {e}")
            return []
    
    async def preload_popular_queries(self, queries: List[str]):
        """Predictive preloading for popular queries"""
        try:
            # This would use ML to predict and preload common query results
            logger.info(f"Preloading {len(queries)} popular queries")
            
            tasks = []
            for query in queries:
                # Simulate embedding generation and search
                task = self._preload_query(query)
                tasks.append(task)
            
            await asyncio.gather(*tasks, return_exceptions=True)
            logger.info("Preloading completed")
        except Exception as e:
            logger.error(f"Preloading error: {e}")
    
    async def _preload_query(self, query: str):
        """Preload individual query"""
        try:
            # This would generate embedding and cache results
            # For demo purposes, we'll just cache a placeholder
            cache_key = f"preload:{query}"
            await cache.set(cache_key, {"preloaded": True}, ttl=3600)
        except Exception as e:
            logger.warning(f"Query preload error for '{query}': {e}")

# Global service instance
vector_service = UltraFastVectorService()