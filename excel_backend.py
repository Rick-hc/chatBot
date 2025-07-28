#!/usr/bin/env python3
"""
Excel-based Chatbot Backend with Vector Search
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging
import os

from vector_service import VectorService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Excel Chatbot API", version="3.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize vector service
vector_service = VectorService()

# Data models
class SearchRequest(BaseModel):
    question: str

class Candidate(BaseModel):
    id: str
    question: str
    answer: str
    similarity: float

class SearchResponse(BaseModel):
    candidates: List[Candidate]
    total_found: int

class AnswerRequest(BaseModel):
    id: str

class AnswerResponse(BaseModel):
    answer: str
    id: str

class FeedbackRequest(BaseModel):
    message_id: str
    helpful: bool
    comment: Optional[str] = ""

class FAQItem(BaseModel):
    id: str
    question: str
    answer: str
    category: str

class FAQResponse(BaseModel):
    items: List[FAQItem]
    total_count: int

# Initialize vector index on startup
@app.on_event("startup")
async def startup_event():
    """Initialize vector index on startup"""
    logger.info("Initializing vector service...")
    success = vector_service.build_index_from_excel()
    if success:
        stats = vector_service.get_stats()
        logger.info(f"Vector service initialized with {stats['total_records']} records")
    else:
        logger.error("Failed to initialize vector service")

@app.post("/api/search", response_model=SearchResponse)
def search_similar_questions(request: SearchRequest):
    """Search for similar questions using vector embeddings"""
    try:
        logger.info(f"Searching for: {request.question}")
        
        # Use vector service to find similar questions
        results = vector_service.search_similar(request.question, top_k=5)
        
        if not results:
            logger.warning("No similar questions found")
            return SearchResponse(candidates=[], total_found=0)
        
        # Convert to candidates
        candidates = []
        for result in results:
            candidate = Candidate(
                id=result['id'],
                question=result['question'],
                answer=result['answer'],
                similarity=result['similarity_score']
            )
            candidates.append(candidate)
        
        logger.info(f"Found {len(candidates)} similar questions")
        return SearchResponse(
            candidates=candidates,
            total_found=len(candidates)
        )
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/api/answer")
def get_answer_by_id(id: str):
    """Get answer by record ID"""
    try:
        logger.info(f"Getting answer for ID: {id}")
        
        answer = vector_service.get_answer_by_id(id)
        if answer is None:
            raise HTTPException(status_code=404, detail="Answer not found")
        
        return AnswerResponse(answer=answer, id=id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Answer retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"Answer retrieval failed: {str(e)}")

@app.post("/api/feedback")
def submit_feedback(request: FeedbackRequest):
    """Submit user feedback"""
    try:
        logger.info(f"Received feedback for {request.message_id}: helpful={request.helpful}")
        
        # In a real system, you would save this to a database
        # For now, just log it
        if request.comment:
            logger.info(f"Feedback comment: {request.comment}")
        
        return {"status": "success", "message": "Feedback received"}
        
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback submission failed: {str(e)}")

@app.get("/api/faq", response_model=FAQResponse)
def get_faq_items():
    """Get FAQ items from Excel data"""
    try:
        logger.info("Fetching FAQ items from Excel data")
        
        # Get all records from vector service
        if not vector_service.metadata:
            logger.warning("No FAQ data available")
            return FAQResponse(items=[], total_count=0)
        
        # Convert to FAQ items (limit to first 20 for performance)
        faq_items = []
        for record in vector_service.metadata[:20]:
            faq_item = FAQItem(
                id=record['id'],
                question=record['question'],
                answer=record['answer'],
                category=record.get('source_file', 'その他')
            )
            faq_items.append(faq_item)
        
        logger.info(f"Returning {len(faq_items)} FAQ items")
        return FAQResponse(
            items=faq_items,
            total_count=len(faq_items)
        )
        
    except Exception as e:
        logger.error(f"FAQ error: {e}")
        raise HTTPException(status_code=500, detail=f"FAQ fetch failed: {str(e)}")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    stats = vector_service.get_stats()
    return {
        "status": "healthy", 
        "service": "excel-chatbot-backend",
        "version": "3.0.0",
        "vector_service": stats
    }

@app.get("/api/stats")
def get_service_stats():
    """Get service statistics"""
    return vector_service.get_stats()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)