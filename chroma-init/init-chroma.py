#!/usr/bin/env python3
"""
Initialize Chroma vector database with sample data
"""

import chromadb
import os
import time
from typing import List

def wait_for_chroma(host: str = "localhost", port: int = 8000, max_retries: int = 30):
    """Wait for Chroma service to be ready"""
    client = None
    for attempt in range(max_retries):
        try:
            client = chromadb.HttpClient(host=host, port=port)
            client.heartbeat()
            print(f"✅ Chroma is ready after {attempt + 1} attempts")
            return client
        except Exception as e:
            print(f"⏳ Waiting for Chroma... (attempt {attempt + 1}/{max_retries})")
            time.sleep(2)
    
    raise Exception("Failed to connect to Chroma after maximum retries")

def initialize_chroma_collections(client: chromadb.HttpClient):
    """Initialize Chroma collections with sample data"""
    
    # Create or get collection for QA pairs
    collection = client.get_or_create_collection(
        name="qa_knowledge_base",
        metadata={"description": "Knowledge base for chatbot QA pairs"}
    )
    
    # Sample QA data
    sample_questions = [
        "会社の営業時間は何時から何時までですか？",
        "有給休暇の申請方法を教えてください",
        "社内システムにログインできない場合の対処法は？",
        "会議室の予約方法を教えてください",
        "経費精算の締切日はいつですか？"
    ]
    
    sample_answers = [
        "営業時間は平日9:00-18:00です。土日祝日は休業日となります。",
        "有給休暇は人事システムから申請できます。申請は休暇予定日の2週間前までに行ってください。",
        "社内システムにログインできない場合は、パスワードリセットを行うか、IT部門（内線1234）にお問い合わせください。",
        "会議室は社内予約システムから予約できます。予約は最大2週間先まで可能です。",
        "経費精算の締切日は毎月末日です。翌月10日までに承認を完了してください。"
    ]
    
    sample_categories = [
        "general",
        "hr", 
        "it",
        "facility",
        "finance"
    ]
    
    # Add documents to collection
    collection.add(
        documents=sample_answers,
        metadatas=[{"question": q, "category": c} for q, c in zip(sample_questions, sample_categories)],
        ids=[f"qa_{i}" for i in range(len(sample_questions))]
    )
    
    print(f"✅ Initialized collection '{collection.name}' with {len(sample_questions)} QA pairs")
    
    # Verify the data
    results = collection.peek(limit=2)
    print(f"📊 Collection contains {collection.count()} documents")
    
    return collection

def main():
    """Main initialization function"""
    print("🚀 Starting Chroma initialization...")
    
    try:
        # Wait for Chroma to be ready
        client = wait_for_chroma()
        
        # Initialize collections
        collection = initialize_chroma_collections(client)
        
        print("✅ Chroma initialization completed successfully!")
        
    except Exception as e:
        print(f"❌ Failed to initialize Chroma: {e}")
        exit(1)

if __name__ == "__main__":
    main()