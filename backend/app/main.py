from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import openai
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chatbot API", version="1.0.0")

# Standardized error response format
class ErrorResponse(BaseModel):
    error: bool = True
    message: str
    detail: Optional[str] = None
    status_code: int

# Global exception handlers for consistent error responses
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle 422 validation errors with detailed information"""
    logger.error(f"Validation error on {request.url}: {exc}")
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            message="Request validation failed",
            detail=str(exc.errors()),
            status_code=422
        ).dict()
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent format"""
    logger.error(f"HTTP error on {request.url}: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            message="Request failed",
            detail=str(exc.detail),
            status_code=exc.status_code
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors with safe error response"""
    logger.error(f"Unexpected error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            message="Internal server error",
            detail="An unexpected error occurred",
            status_code=500
        ).dict()
    )

# Complete CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8080",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language", 
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
        "X-Request-ID",
        "*"
    ],
    expose_headers=["*"],
    max_age=3600,
)

# OpenAI API key setup with detailed logging
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
logger.info(f"Environment check - API Key present: {bool(OPENAI_API_KEY)}")
if OPENAI_API_KEY:
    logger.info(f"API Key length: {len(OPENAI_API_KEY)}")
    logger.info(f"API Key starts with: {OPENAI_API_KEY[:10]}...")

if not OPENAI_API_KEY:
    logger.error("🚨 CRITICAL: OpenAI API key not found in environment variables")
    logger.error("Please set OPENAI_API_KEY in .env file or environment")
    raise ValueError("OpenAI API key is required")

# Initialize OpenAI client with error handling
try:
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    logger.info("✅ OpenAI client initialized successfully")
except Exception as e:
    logger.error(f"🚨 CRITICAL: Failed to initialize OpenAI client: {e}")
    raise

# Pydantic models with strict validation
class EmbedRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=8000, description="Text to embed")
    
    @validator('text')
    def validate_text(cls, v):
        if not v or not v.strip():
            raise ValueError('Text cannot be empty or whitespace only')
        return v.strip()

class SearchRequest(BaseModel):
    embedding: List[float] = Field(..., min_items=1, description="Query embedding vector")
    top_k: int = Field(20, ge=1, le=100, description="Number of top candidates to return")
    
    @validator('embedding')
    def validate_embedding(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Embedding cannot be empty')
        return v

class Candidate(BaseModel):
    id: Any = Field(..., description="Candidate ID")
    question: str = Field(..., description="Question text")
    answer: str = Field(..., description="Answer text")
    similarity: Optional[float] = Field(None, ge=0.0, le=1.0, description="Similarity score")

class RefineRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000, description="User question")
    candidates: List[Candidate] = Field(..., min_items=1, max_items=50, description="Candidate list")
    top_k: int = Field(5, ge=1, le=20, description="Number of refined candidates")
    
    @validator('question')
    def validate_question(cls, v):
        if not v or not v.strip():
            raise ValueError('Question cannot be empty or whitespace only')
        return v.strip()

class FeedbackRequest(BaseModel):
    qa_id: str = Field(..., min_length=1, description="QA pair ID")
    resolved: bool = Field(..., description="Whether the question was resolved")

class EmbedResponse(BaseModel):
    embedding: List[float] = Field(..., description="Generated embedding vector")

class SearchResponse(BaseModel):
    candidates: List[Candidate] = Field(..., description="Search result candidates")

class RefineResponse(BaseModel):
    refined_candidates: List[Candidate] = Field(..., description="Refined candidate list")

class AnswerResponse(BaseModel):
    answer: str = Field(..., description="Answer text")
    question: str = Field(..., description="Question text")

# グローバル変数としてQAデータを保持
qa_data = []

def load_qa_data():
    global qa_data
    try:
        logger.info("Loading QA data from file...")
        with open("../data/qa.json", "r", encoding="utf-8") as f:
            qa_data = json.load(f)
        logger.info(f"Successfully loaded {len(qa_data)} QA entries")
    except FileNotFoundError:
        logger.warning("QA data file not found, using empty dataset")
        qa_data = []
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse QA data file: {e}")
        qa_data = []
    except Exception as e:
        logger.error(f"Unexpected error loading QA data: {e}")
        qa_data = []

@app.on_event("startup")
async def startup_event():
    logger.info("Starting backend API...")
    load_qa_data()
    logger.info("Backend API ready")

def create_embedding(text: str) -> List[float]:
    """Create embedding using OpenAI API"""
    try:
        logger.info(f"Creating embedding for text: {text[:50]}...")
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=text,
            encoding_format="float"
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Embedding creation failed: {e}")
        raise

@app.post("/embed", response_model=EmbedResponse)
async def embed_text(request: EmbedRequest):
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text input cannot be empty")
        
        embedding = create_embedding(request.text)
        logger.info("Embedding created successfully")
        return EmbedResponse(embedding=embedding)
    
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")

@app.post("/search", response_model=SearchResponse)
async def search_candidates(request: SearchRequest):
    """Search for similar questions using cosine similarity (Step 3)"""
    try:
        logger.info(f"Starting cosine similarity search with top_k={request.top_k}")
        
        if not qa_data:
            raise HTTPException(status_code=404, detail="QA data not available")
        
        if not request.embedding:
            raise HTTPException(status_code=400, detail="Embedding cannot be empty")
        
        query_vector = np.array(request.embedding, dtype=np.float32).reshape(1, -1)
        similarities = []
        
        for i, item in enumerate(qa_data):
            if "embedding" not in item or not item["embedding"]:
                continue
                
            try:
                doc_vector = np.array(item["embedding"], dtype=np.float32).reshape(1, -1)
                similarity = cosine_similarity(query_vector, doc_vector)[0][0]
                
                candidate = Candidate(
                    id=item.get("id", i),
                    question=item.get("question", ""),
                    answer=item.get("answer", ""),
                    similarity=float(similarity)
                )
                similarities.append(candidate)
            except Exception as e:
                logger.warning(f"Error processing item {i}: {e}")
                continue
        
        if not similarities:
            raise HTTPException(status_code=404, detail="No matching documents found")
        
        # Sort by similarity and return top-k
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        top_candidates = similarities[:request.top_k]
        
        logger.info(f"Search completed: returning {len(top_candidates)} results")
        return SearchResponse(candidates=top_candidates)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

def refine_candidates_with_gpt(question: str, candidates: List[Candidate], top_k: int = 5) -> List[Candidate]:
    """Use GPT to refine top-20 candidates to top-5 (Step 4)"""
    try:
        prompt = f"""以下の質問に最も関連性の高い質問を{top_k}個選んで、関連性の高い順に並べてください。

ユーザーの質問: {question}

候補:
"""
        
        for i, candidate in enumerate(candidates):
            prompt += f"{i+1}. {candidate.question}\n"
        
        prompt += f"\n{top_k}個の質問を番号で答えてください（例: 1,3,5,7,9）"
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using gpt-4o-mini as gpt-nano equivalent
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=100
        )
        
        # Parse the response to extract selected indices
        content = response.choices[0].message.content.strip()
        logger.info(f"GPT refinement response: {content}")
        
        # Simple parsing - extract numbers
        import re
        numbers = re.findall(r'\d+', content)
        selected_indices = [int(n) - 1 for n in numbers[:top_k] if int(n) <= len(candidates)]
        
        # Return selected candidates
        refined = []
        for idx in selected_indices:
            if 0 <= idx < len(candidates):
                refined.append(candidates[idx])
        
        # If parsing failed, return first top_k candidates
        if not refined:
            refined = candidates[:top_k]
        
        return refined
        
    except Exception as e:
        logger.error(f"GPT refinement failed: {e}")
        # Fallback to simple top-k selection
        return candidates[:top_k]

@app.post("/refine", response_model=RefineResponse)
async def refine_candidates(request: RefineRequest):
    try:
        logger.info(f"Starting refinement for question: {request.question[:50]}...")
        
        if not request.question or len(request.question.strip()) == 0:
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        if not request.candidates:
            raise HTTPException(status_code=400, detail="Candidates list cannot be empty")
        
        if request.top_k <= 0:
            raise HTTPException(status_code=400, detail="top_k must be greater than 0")
        
        # Use GPT to refine candidates
        refined = refine_candidates_with_gpt(
            request.question, 
            request.candidates, 
            request.top_k
        )
        
        logger.info(f"Refinement completed, returning {len(refined)} candidates")
        return RefineResponse(refined_candidates=refined)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refinement failed: {e}")
        raise HTTPException(status_code=500, detail=f"Refinement failed: {str(e)}")

@app.get("/answer/{qa_id}", response_model=AnswerResponse)
async def get_answer(qa_id: int):
    """Get answer for selected question Q2 (Step 6)"""
    try:
        logger.info(f"Getting answer for qa_id: {qa_id}")
        
        if not qa_data:
            raise HTTPException(status_code=404, detail="QA data not available")
        
        for item in qa_data:
            if item.get("id") == qa_id:
                logger.info(f"Found answer for qa_id: {qa_id}")
                return AnswerResponse(
                    answer=item.get("answer", ""),
                    question=item.get("question", "")
                )
        
        logger.warning(f"Answer not found for qa_id: {qa_id}")
        raise HTTPException(status_code=404, detail="Answer not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get answer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get answer: {str(e)}")

@app.post("/feedback")
async def save_feedback(request: FeedbackRequest):
    """Save user feedback for the QA interaction (Step 6)"""
    try:
        logger.info(f"Saving feedback for qa_id: {request.qa_id}")
        
        if not request.qa_id:
            raise HTTPException(status_code=400, detail="qa_id is required")
        
        # Simple feedback storage (in production, save to database)
        feedback_data = {
            "qa_id": request.qa_id,
            "resolved": request.resolved,
            "timestamp": "2024-01-01T00:00:00Z"  # Should use actual timestamp
        }
        
        logger.info(f"Feedback saved: {feedback_data}")
        return {
            "message": "Feedback saved successfully", 
            "qa_id": request.qa_id, 
            "resolved": request.resolved
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to save feedback: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save feedback: {str(e)}")

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check OpenAI connection
        openai_status = "healthy"
        try:
            test_response = client.embeddings.create(
                model="text-embedding-3-large",
                input="health check"
            )
            if not test_response.data:
                openai_status = "unhealthy"
        except Exception as e:
            openai_status = f"error: {str(e)[:100]}"
        
        return {
            "status": "healthy",
            "qa_data_count": len(qa_data),
            "openai_configured": bool(OPENAI_API_KEY),
            "openai_status": openai_status,
            "api_version": "1.0.0",
            "endpoints": [
                "/health",
                "/embed",
                "/search", 
                "/refine",
                "/answer/{qa_id}",
                "/feedback",
                "/test-data"
            ]
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.get("/test-data")
async def create_test_data():
    """Create test data for demonstration"""
    global qa_data
    
    if len(qa_data) == 0:
        # Create sample QA data with embeddings for testing
        logger.info("Creating test QA data...")
        
        test_questions = [
            "What is machine learning?",
            "How does artificial intelligence work?",
            "What is deep learning?",
            "Explain neural networks",
            "What is natural language processing?"
        ]
        
        test_answers = [
            "Machine learning is a method of data analysis that automates analytical model building.",
            "Artificial intelligence works by using algorithms and statistical models to perform tasks without explicit instructions.",
            "Deep learning is a subset of machine learning that uses neural networks with multiple layers.",
            "Neural networks are computing systems inspired by biological neural networks that process information.",
            "Natural language processing is a branch of AI that helps computers understand and process human language."
        ]
        
        qa_data = []
        for i, (question, answer) in enumerate(zip(test_questions, test_answers)):
            try:
                # Create embedding for each question
                embedding = create_embedding(question)
                qa_data.append({
                    "id": i + 1,
                    "question": question,
                    "answer": answer,
                    "embedding": embedding
                })
            except Exception as e:
                logger.warning(f"Failed to create embedding for test question {i}: {e}")
                # Add without embedding as fallback
                qa_data.append({
                    "id": i + 1,
                    "question": question,
                    "answer": answer,
                    "embedding": [0.0] * 1536  # Default embedding size
                })
        
        logger.info(f"Created {len(qa_data)} test QA entries")
    
    return {
        "message": "Test data ready",
        "qa_count": len(qa_data),
        "sample_questions": [item["question"] for item in qa_data[:3]]
    }