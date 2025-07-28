import asyncio
import json
import logging
from typing import Dict, List, Optional
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter
import time

from app.services.vector_service import vector_service
from app.services.openai_service import openai_service

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_stats: Dict[str, Dict] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_stats[client_id] = {
            "connected_at": time.time(),
            "messages_sent": 0,
            "messages_received": 0
        }
        logger.info(f"Client {client_id} connected via WebSocket")
    
    def disconnect(self, websocket: WebSocket, client_id: str):
        self.active_connections.remove(websocket)
        if client_id in self.connection_stats:
            del self.connection_stats[client_id]
        logger.info(f"Client {client_id} disconnected")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def send_json(self, data: Dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(data))
    
    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

manager = ConnectionManager()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Update stats
            if client_id in manager.connection_stats:
                manager.connection_stats[client_id]["messages_received"] += 1
            
            # Process different message types
            response = await process_message(message_data, client_id)
            
            # Send response back to client
            await manager.send_json(response, websocket)
            
            # Update stats
            if client_id in manager.connection_stats:
                manager.connection_stats[client_id]["messages_sent"] += 1
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
        await manager.send_json({
            "type": "error",
            "message": f"Server error: {str(e)}"
        }, websocket)

async def process_message(message_data: Dict, client_id: str) -> Dict:
    """Process incoming WebSocket messages with ultra-fast response"""
    
    message_type = message_data.get("type")
    start_time = time.time()
    
    try:
        if message_type == "search":
            return await handle_search_message(message_data, start_time)
        
        elif message_type == "embed":
            return await handle_embed_message(message_data, start_time)
        
        elif message_type == "health":
            return await handle_health_message(start_time)
        
        elif message_type == "preload":
            return await handle_preload_message(message_data, start_time)
        
        else:
            return {
                "type": "error",
                "message": f"Unknown message type: {message_type}",
                "processing_time_ms": round((time.time() - start_time) * 1000, 2)
            }
    
    except Exception as e:
        logger.error(f"Message processing error: {e}")
        return {
            "type": "error",
            "message": str(e),
            "processing_time_ms": round((time.time() - start_time) * 1000, 2)
        }

async def handle_search_message(message_data: Dict, start_time: float) -> Dict:
    """Handle real-time vector search"""
    query_embedding = message_data.get("embedding")
    top_k = message_data.get("top_k", 20)
    
    if not query_embedding:
        return {
            "type": "error",
            "message": "Missing embedding data"
        }
    
    # Ultra-fast search
    results = await vector_service.ultra_fast_search(query_embedding, top_k)
    
    return {
        "type": "search_results",
        "results": results,
        "count": len(results),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2)
    }

async def handle_embed_message(message_data: Dict, start_time: float) -> Dict:
    """Handle real-time embedding generation"""
    text = message_data.get("text")
    
    if not text:
        return {
            "type": "error",
            "message": "Missing text data"
        }
    
    # Ultra-fast embedding
    embedding = await openai_service.create_embedding_ultra_fast(text)
    
    return {
        "type": "embedding_result",
        "embedding": embedding,
        "dimension": len(embedding),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2)
    }

async def handle_health_message(start_time: float) -> Dict:
    """Handle health check requests"""
    
    # Parallel health checks
    health_tasks = [
        vector_service.chroma_client.count_documents(),
        openai_service.health_check()
    ]
    
    try:
        results = await asyncio.gather(*health_tasks, return_exceptions=True)
        
        return {
            "type": "health_status",
            "status": "healthy",
            "services": {
                "vector_db_count": results[0] if not isinstance(results[0], Exception) else "error",
                "openai_service": results[1] if not isinstance(results[1], Exception) else "error"
            },
            "active_connections": len(manager.active_connections),
            "processing_time_ms": round((time.time() - start_time) * 1000, 2)
        }
    except Exception as e:
        return {
            "type": "health_status",
            "status": "degraded",
            "error": str(e),
            "processing_time_ms": round((time.time() - start_time) * 1000, 2)
        }

async def handle_preload_message(message_data: Dict, start_time: float) -> Dict:
    """Handle predictive preloading requests"""
    queries = message_data.get("queries", [])
    
    if not queries:
        return {
            "type": "error",
            "message": "No queries provided for preloading"
        }
    
    # Trigger preloading
    asyncio.create_task(vector_service.preload_popular_queries(queries))
    
    return {
        "type": "preload_started",
        "query_count": len(queries),
        "processing_time_ms": round((time.time() - start_time) * 1000, 2)
    }

@router.get("/ws/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    return {
        "active_connections": len(manager.active_connections),
        "connection_stats": manager.connection_stats,
        "total_connections": len(manager.connection_stats)
    }