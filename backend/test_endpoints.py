#!/usr/bin/env python3
"""
Simple test script to verify all endpoints work correctly
"""

import requests
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            logger.info("✅ Health endpoint: OK")
            return True
        else:
            logger.error(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Health endpoint error: {e}")
        return False

def test_embed():
    """Test embedding endpoint"""
    try:
        data = {"text": "What is machine learning?"}
        response = requests.post(f"{BASE_URL}/embed", json=data)
        
        if response.status_code == 200:
            result = response.json()
            if "embedding" in result and len(result["embedding"]) > 0:
                logger.info("✅ Embed endpoint: OK")
                return result["embedding"]
            else:
                logger.error("❌ Embed endpoint: Invalid response format")
                return None
        else:
            logger.error(f"❌ Embed endpoint failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"❌ Embed endpoint error: {e}")
        return None

def test_search(embedding):
    """Test search endpoint"""
    try:
        data = {"embedding": embedding, "top_k": 5}
        response = requests.post(f"{BASE_URL}/search", json=data)
        
        if response.status_code == 200:
            result = response.json()
            if "candidates" in result:
                logger.info(f"✅ Search endpoint: OK (found {len(result['candidates'])} candidates)")
                return result["candidates"]
            else:
                logger.error("❌ Search endpoint: Invalid response format")
                return None
        else:
            logger.error(f"❌ Search endpoint failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"❌ Search endpoint error: {e}")
        return None

def test_refine(candidates):
    """Test refine endpoint"""
    try:
        data = {
            "question": "What is machine learning?",
            "candidates": candidates,
            "top_k": 3
        }
        response = requests.post(f"{BASE_URL}/refine", json=data)
        
        if response.status_code == 200:
            result = response.json()
            if "refined_candidates" in result:
                logger.info(f"✅ Refine endpoint: OK (refined to {len(result['refined_candidates'])} candidates)")
                return result["refined_candidates"]
            else:
                logger.error("❌ Refine endpoint: Invalid response format")
                return None
        else:
            logger.error(f"❌ Refine endpoint failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"❌ Refine endpoint error: {e}")
        return None

def test_answer(qa_id):
    """Test answer endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/answer/{qa_id}")
        
        if response.status_code == 200:
            result = response.json()
            if "answer" in result and "question" in result:
                logger.info("✅ Answer endpoint: OK")
                return result
            else:
                logger.error("❌ Answer endpoint: Invalid response format")
                return None
        else:
            logger.error(f"❌ Answer endpoint failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"❌ Answer endpoint error: {e}")
        return None

def test_feedback(qa_id):
    """Test feedback endpoint"""
    try:
        data = {"qa_id": str(qa_id), "resolved": True}
        response = requests.post(f"{BASE_URL}/feedback", json=data)
        
        if response.status_code == 200:
            result = response.json()
            if "message" in result:
                logger.info("✅ Feedback endpoint: OK")
                return True
            else:
                logger.error("❌ Feedback endpoint: Invalid response format")
                return False
        else:
            logger.error(f"❌ Feedback endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Feedback endpoint error: {e}")
        return False

def test_test_data():
    """Test test data creation endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/test-data")
        if response.status_code == 200:
            result = response.json()
            if "qa_count" in result and result["qa_count"] > 0:
                logger.info(f"✅ Test data endpoint: OK (created {result['qa_count']} entries)")
                return True
            else:
                logger.error("❌ Test data endpoint: No QA data created")
                return False
        else:
            logger.error(f"❌ Test data endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Test data endpoint error: {e}")
        return False

def main():
    """Run all endpoint tests with 100% success guarantee"""
    logger.info("🚀 Starting comprehensive endpoint tests...")
    
    # Test 0: Create test data first
    logger.info("Step 0: Setting up test data...")
    if not test_test_data():
        logger.error("❌ Test data setup failed - stopping tests")
        return False
    
    # Test 1: Health check
    logger.info("Step 1: Health check...")
    if not test_health():
        logger.error("❌ Health check failed - stopping tests")
        return False
    
    # Test 2: Embedding
    logger.info("Step 2: Testing embedding generation...")
    embedding = test_embed()
    if not embedding:
        logger.error("❌ Embedding test failed - stopping tests")
        return False
    
    # Test 3: Search
    logger.info("Step 3: Testing vector search...")
    candidates = test_search(embedding)
    if not candidates:
        logger.error("❌ Search test failed - stopping tests")
        return False
    
    # Test 4: Refine
    logger.info("Step 4: Testing GPT refinement...")
    refined = test_refine(candidates)
    if not refined:
        logger.error("❌ Refine test failed - stopping tests")
        return False
    
    # Test 5: Answer (using first candidate ID)
    logger.info("Step 5: Testing answer retrieval...")
    if refined and len(refined) > 0:
        qa_id = refined[0].get("id", 1)
        answer = test_answer(qa_id)
        if not answer:
            logger.error("❌ Answer test failed - stopping tests")
            return False
        
        # Test 6: Feedback
        logger.info("Step 6: Testing feedback submission...")
        if not test_feedback(qa_id):
            logger.error("❌ Feedback test failed - stopping tests")
            return False
    
    logger.info("🎉 All endpoint tests passed! 100% success rate achieved!")
    logger.info("✅ Backend is ready for production use")
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)