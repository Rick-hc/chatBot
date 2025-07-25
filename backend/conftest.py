"""
Pytest configuration and fixtures for the chatbot backend
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, AsyncMock

from app.main import app
from app.db.database import get_db, Base
from app.core.config import get_settings

# Test database URL
TEST_DATABASE_URL = "postgresql://chatbot_test_user:chatbot_test_pass@localhost:5433/chatbot_test_db"

# Create test engine
test_engine = create_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh test database session for each test."""
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Drop tables after each test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with dependency overrides."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
        
    app.dependency_overrides.clear()


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing."""
    mock_client = Mock()
    
    # Mock embeddings
    mock_embedding_response = Mock()
    mock_embedding_response.data = [Mock(embedding=[0.1] * 1536)]
    mock_client.embeddings.create.return_value = mock_embedding_response
    
    # Mock chat completions
    mock_chat_response = Mock()
    mock_chat_response.choices = [Mock(message=Mock(content="Test response"))]
    mock_client.chat.completions.create.return_value = mock_chat_response
    
    return mock_client


@pytest.fixture
def mock_chroma_client():
    """Mock Chroma client for testing."""
    mock_client = Mock()
    mock_collection = Mock()
    
    # Mock collection methods
    mock_collection.query.return_value = {
        "ids": [["qa_1", "qa_2"]],
        "documents": [["Answer 1", "Answer 2"]],
        "metadatas": [[{"question": "Question 1"}, {"question": "Question 2"}]],
        "distances": [[0.1, 0.2]]
    }
    
    mock_client.get_collection.return_value = mock_collection
    mock_client.get_or_create_collection.return_value = mock_collection
    
    return mock_client


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "username": "testuser",
        "email": "test@example.com"
    }


@pytest.fixture
def sample_question_data():
    """Sample question data for testing."""
    return {
        "question_text": "What is the company policy on remote work?"
    }


@pytest.fixture
def sample_qa_pair_data():
    """Sample QA pair data for testing."""
    return {
        "question": "What are the office hours?",
        "answer": "Office hours are 9 AM to 5 PM, Monday to Friday.",
        "category": "general",
        "tags": ["office", "hours", "schedule"]
    }


# Async fixtures for async testing
@pytest.fixture
async def async_client(db_session):
    """Create an async test client."""
    from httpx import AsyncClient
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
        
    app.dependency_overrides.clear()


# Markers for different test types
pytest.mark.unit = pytest.mark.unit
pytest.mark.integration = pytest.mark.integration
pytest.mark.slow = pytest.mark.slow
pytest.mark.external = pytest.mark.external