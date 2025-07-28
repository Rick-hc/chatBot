import asyncio
import openai
from typing import List, Optional, Dict
import logging
from concurrent.futures import ThreadPoolExecutor
import time
import hashlib

from app.core.cache import cache_result, cache
from app.core.circuit_breaker import circuit_breaker, CircuitBreakerConfig

logger = logging.getLogger(__name__)

class UltraFastOpenAIService:
    def __init__(self):
        self.client_pool = []
        self.pool_size = 5
        self.current_client = 0
        self.request_stats = {"total": 0, "cached": 0, "api_calls": 0}
        
    async def initialize(self):
        """Initialize connection pool for maximum throughput"""
        try:
            api_key = openai.api_key
            if not api_key:
                raise ValueError("OpenAI API key not configured")
            
            # Create multiple client instances for connection pooling
            for i in range(self.pool_size):
                client = openai.AsyncOpenAI(
                    api_key=api_key,
                    timeout=30.0,
                    max_retries=0  # We handle retries ourselves
                )
                self.client_pool.append(client)
            
            logger.info(f"OpenAI service initialized with {self.pool_size} clients")
        except Exception as e:
            logger.error(f"OpenAI service initialization failed: {e}")
            raise
    
    def _get_next_client(self) -> openai.AsyncOpenAI:
        """Round-robin client selection for load balancing"""
        client = self.client_pool[self.current_client]
        self.current_client = (self.current_client + 1) % len(self.client_pool)
        return client
    
    @circuit_breaker(CircuitBreakerConfig(
        failure_threshold=3,
        recovery_timeout=30,
        expected_exception=(openai.APIError, openai.RateLimitError, openai.APIConnectionError)
    ))
    @cache_result("embedding", ttl=7200)  # 2 hour cache for embeddings
    async def create_embedding_ultra_fast(
        self, 
        text: str, 
        model: str = "text-embedding-3-large"
    ) -> List[float]:
        """Ultra-fast embedding creation with multiple optimization strategies"""
        
        self.request_stats["total"] += 1
        
        if not text or len(text.strip()) == 0:
            raise ValueError("Text cannot be empty")
        
        # Strategy 1: Batch multiple requests if possible
        start_time = time.time()
        
        try:
            client = self._get_next_client()
            
            # Parallel execution with timeout
            response = await asyncio.wait_for(
                client.embeddings.create(
                    model=model,
                    input=text,
                    encoding_format="float"
                ),
                timeout=10.0
            )
            
            embedding = response.data[0].embedding
            self.request_stats["api_calls"] += 1
            
            elapsed = time.time() - start_time
            logger.debug(f"Embedding created in {elapsed:.3f}s")
            
            return embedding
            
        except asyncio.TimeoutError:
            logger.error("OpenAI embedding timeout")
            raise openai.APIConnectionError("Request timeout")
        except Exception as e:
            logger.error(f"Embedding creation failed: {e}")
            raise
    
    async def batch_create_embeddings(
        self, 
        texts: List[str], 
        model: str = "text-embedding-3-large"
    ) -> List[List[float]]:
        """Create multiple embeddings in parallel for maximum throughput"""
        
        if not texts:
            return []
        
        # Split into batches for OpenAI API limits
        batch_size = 100
        batches = [texts[i:i + batch_size] for i in range(0, len(texts), batch_size)]
        
        all_embeddings = []
        
        # Process batches in parallel
        tasks = []
        for batch in batches:
            task = self._process_embedding_batch(batch, model)
            tasks.append(task)
        
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in batch_results:
            if isinstance(result, Exception):
                logger.error(f"Batch embedding failed: {result}")
                # Add empty embeddings for failed batch
                all_embeddings.extend([[] for _ in range(len(batch))])
            else:
                all_embeddings.extend(result)
        
        return all_embeddings
    
    async def _process_embedding_batch(
        self, 
        texts: List[str], 
        model: str
    ) -> List[List[float]]:
        """Process a single batch of embeddings"""
        try:
            client = self._get_next_client()
            
            response = await asyncio.wait_for(
                client.embeddings.create(
                    model=model,
                    input=texts,
                    encoding_format="float"
                ),
                timeout=30.0
            )
            
            embeddings = [data.embedding for data in response.data]
            self.request_stats["api_calls"] += 1
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Batch embedding error: {e}")
            raise
    
    @circuit_breaker(CircuitBreakerConfig(
        failure_threshold=2,
        recovery_timeout=60,
        expected_exception=(openai.APIError, openai.RateLimitError)
    ))
    @cache_result("chat_completion", ttl=1800)  # 30 min cache for completions
    async def create_completion_ultra_fast(
        self,
        messages: List[Dict],
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.1,
        max_tokens: Optional[int] = None
    ) -> str:
        """Ultra-fast chat completion with caching and circuit breaker"""
        
        try:
            client = self._get_next_client()
            
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                ),
                timeout=20.0
            )
            
            content = response.choices[0].message.content
            self.request_stats["api_calls"] += 1
            
            return content or ""
            
        except asyncio.TimeoutError:
            logger.error("OpenAI completion timeout")
            raise openai.APIConnectionError("Request timeout")
        except Exception as e:
            logger.error(f"Completion failed: {e}")
            raise
    
    async def health_check(self) -> Dict:
        """Check service health and performance metrics"""
        try:
            # Quick embedding test
            start_time = time.time()
            await self.create_embedding_ultra_fast("health check")
            response_time = time.time() - start_time
            
            return {
                "status": "healthy",
                "response_time_ms": round(response_time * 1000, 2),
                "pool_size": len(self.client_pool),
                "stats": self.request_stats,
                "cache_stats": cache.get_stats()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "pool_size": len(self.client_pool)
            }
    
    def get_performance_stats(self) -> Dict:
        """Get detailed performance statistics"""
        cache_hit_rate = 0
        if self.request_stats["total"] > 0:
            cache_hit_rate = (self.request_stats["cached"] / self.request_stats["total"]) * 100
        
        return {
            "total_requests": self.request_stats["total"],
            "api_calls": self.request_stats["api_calls"],
            "cache_hit_rate": round(cache_hit_rate, 2),
            "connection_pool_size": len(self.client_pool)
        }

# Global service instance
openai_service = UltraFastOpenAIService()