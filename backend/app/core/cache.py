import asyncio
import json
import hashlib
import time
from typing import Any, Optional, Dict, List
import logging
from functools import wraps
import redis.asyncio as redis
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

class UltraFastCache:
    def __init__(self):
        self.memory_cache: Dict[str, Dict] = {}
        self.redis_client: Optional[redis.Redis] = None
        self.cache_stats = {"hits": 0, "misses": 0, "total_requests": 0}
        
    async def initialize_redis(self, redis_url: str = "redis://localhost:6379"):
        try:
            self.redis_client = redis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=1,
                socket_timeout=1,
                retry_on_timeout=True,
                health_check_interval=30
            )
            await self.redis_client.ping()
            logger.info("Redis connection established successfully")
        except Exception as e:
            logger.warning(f"Redis unavailable, using memory cache only: {e}")
            self.redis_client = None
    
    def _generate_key(self, prefix: str, data: Any) -> str:
        key_data = json.dumps(data, sort_keys=True) if isinstance(data, (dict, list)) else str(data)
        hash_key = hashlib.md5(key_data.encode()).hexdigest()
        return f"{prefix}:{hash_key}"
    
    async def get(self, key: str) -> Optional[Any]:
        self.cache_stats["total_requests"] += 1
        
        # Level 1: Memory cache (instant)
        if key in self.memory_cache:
            cache_entry = self.memory_cache[key]
            if cache_entry["expires"] > time.time():
                self.cache_stats["hits"] += 1
                logger.debug(f"Memory cache HIT: {key}")
                return cache_entry["data"]
            else:
                del self.memory_cache[key]
        
        # Level 2: Redis cache (ultra-fast)
        if self.redis_client:
            try:
                cached_data = await asyncio.wait_for(
                    self.redis_client.get(key), timeout=0.1
                )
                if cached_data:
                    data = json.loads(cached_data)
                    # Store in memory for next access
                    self.memory_cache[key] = {
                        "data": data,
                        "expires": time.time() + 300  # 5 min memory cache
                    }
                    self.cache_stats["hits"] += 1
                    logger.debug(f"Redis cache HIT: {key}")
                    return data
            except asyncio.TimeoutError:
                logger.warning(f"Redis timeout for key: {key}")
            except Exception as e:
                logger.warning(f"Redis error: {e}")
        
        self.cache_stats["misses"] += 1
        return None
    
    async def set(self, key: str, data: Any, ttl: int = 3600):
        # Store in memory immediately
        self.memory_cache[key] = {
            "data": data,
            "expires": time.time() + min(ttl, 300)  # Max 5 min in memory
        }
        
        # Store in Redis asynchronously
        if self.redis_client:
            try:
                await asyncio.wait_for(
                    self.redis_client.setex(key, ttl, json.dumps(data)),
                    timeout=0.1
                )
                logger.debug(f"Cache SET: {key}")
            except Exception as e:
                logger.warning(f"Redis set error: {e}")
    
    async def invalidate_pattern(self, pattern: str):
        # Clear memory cache
        keys_to_delete = [k for k in self.memory_cache.keys() if pattern in k]
        for key in keys_to_delete:
            del self.memory_cache[key]
        
        # Clear Redis cache
        if self.redis_client:
            try:
                keys = await self.redis_client.keys(f"*{pattern}*")
                if keys:
                    await self.redis_client.delete(*keys)
            except Exception as e:
                logger.warning(f"Redis pattern delete error: {e}")
    
    def get_stats(self) -> Dict:
        hit_rate = (self.cache_stats["hits"] / max(self.cache_stats["total_requests"], 1)) * 100
        return {
            **self.cache_stats,
            "hit_rate_percent": round(hit_rate, 2),
            "memory_cache_size": len(self.memory_cache)
        }

# Global cache instance
cache = UltraFastCache()

def cache_result(prefix: str, ttl: int = 3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = cache._generate_key(prefix, {"args": args, "kwargs": kwargs})
            
            # Try to get from cache
            cached_result = await cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator