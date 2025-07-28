#!/usr/bin/env python3
"""
Working Chatbot Backend - Simplified but Functional
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import random
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chatbot API", version="2.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# QA Dataset
qa_dataset = [
    {
        "id": "1",
        "question": "FastAPIとは何ですか？",
        "answer": "FastAPIは、Pythonで高速なWeb APIを構築するためのモダンなWebフレームワークです。型ヒントをサポートし、自動的にAPIドキュメントを生成します。非同期処理に対応しており、高いパフォーマンスを実現できます。",
        "keywords": ["fastapi", "python", "web", "api", "フレームワーク", "高速", "非同期"],
        "category": "技術"
    },
    {
        "id": "2", 
        "question": "Reactの基本概念を教えてください",
        "answer": "Reactは、ユーザーインターフェースを構築するためのJavaScriptライブラリです。コンポーネントベースの設計が特徴で、再利用可能なUIパーツを作成できます。仮想DOMを使用して効率的な更新を行い、一方向データフローによってアプリケーションの状態管理を簡潔にします。",
        "keywords": ["react", "javascript", "ui", "コンポーネント", "仮想dom", "フロントエンド"],
        "category": "フロントエンド"
    },
    {
        "id": "3",
        "question": "Dockerの使い方を教えてください",
        "answer": "Dockerは、アプリケーションをコンテナ化してデプロイするためのプラットフォームです。Dockerfileでアプリケーション環境を定義し、docker buildでイメージを作成、docker runでコンテナを実行します。環境の一貫性を保ち、デプロイメントを簡素化できます。",
        "keywords": ["docker", "コンテナ", "デプロイ", "dockerfile", "インフラ", "仮想化"],
        "category": "インフラ"
    },
    {
        "id": "4",
        "question": "TypeScriptのメリットは？",
        "answer": "TypeScriptは、JavaScriptに型安全性を追加し、大規模な開発における保守性を向上させます。コンパイル時にエラーを検出でき、IDEでのコード補完やリファクタリングサポートが充実しています。現代的なJavaScript機能も使用できます。",
        "keywords": ["typescript", "javascript", "型安全", "開発", "保守性", "コンパイル"],
        "category": "技術"
    },
    {
        "id": "5",
        "question": "PostgreSQLとは何ですか？",
        "answer": "PostgreSQLは、高性能でオープンソースのリレーショナルデータベース管理システムです。ACID特性を満たし、複雑なクエリ、外部キー、トリガー、ビュー、JSONサポートなど豊富な機能を提供します。",
        "keywords": ["postgresql", "データベース", "sql", "acid", "オープンソース", "リレーショナル"],
        "category": "データベース"
    },
    {
        "id": "6",
        "question": "機械学習とは何ですか？",
        "answer": "機械学習は、データから自動的にパターンを学習し、予測や分類を行うAI技術です。教師あり学習、教師なし学習、強化学習などの手法があり、画像認識、自然言語処理、推薦システムなど様々な分野で活用されています。",
        "keywords": ["機械学習", "ai", "データ", "パターン", "予測", "分類", "深層学習"],
        "category": "AI・機械学習"
    },
    {
        "id": "7",
        "question": "REST APIとは何ですか？",
        "answer": "REST APIは、REpresentational State Transferの原則に従うWeb APIの設計手法です。HTTPメソッド（GET、POST、PUT、DELETE）を使用してリソースを操作し、ステートレスな通信を行います。シンプルで拡張性が高いAPI設計が可能です。",
        "keywords": ["rest", "api", "http", "web", "ステートレス", "リソース"],
        "category": "技術"
    },
    {
        "id": "8",
        "question": "GitとGitHubの違いは？",
        "answer": "Gitは分散型バージョン管理システムのソフトウェアで、ローカルでコードの履歴を管理します。GitHubはGitリポジトリをクラウドでホスティングするサービスで、コラボレーション機能、Issue管理、Pull Request、CI/CDなど開発チーム向けの機能を提供します。",
        "keywords": ["git", "github", "バージョン管理", "コラボレーション", "プルリクエスト"],
        "category": "開発ツール"
    }
]

def simple_similarity_search(query: str, dataset: List[dict], top_k: int = 5) -> List[dict]:
    """Simple keyword-based similarity search"""
    query_lower = query.lower()
    query_words = set(query_lower.split())
    
    scored_items = []
    for item in dataset:
        score = 0
        
        # Check question text
        if any(word in item["question"].lower() for word in query_words):
            score += 3
            
        # Check keywords
        for keyword in item["keywords"]:
            if keyword.lower() in query_lower:
                score += 2
            elif any(word in keyword.lower() for word in query_words):
                score += 1
                
        # Add some randomness for variety
        score += random.uniform(0, 0.5)
        
        if score > 0:
            scored_items.append((item, score))
    
    # Sort by score and return top items
    scored_items.sort(key=lambda x: x[1], reverse=True)
    return [item[0] for item in scored_items[:top_k]]

@app.get("/")
def read_root():
    return {
        "message": "Chatbot API is running!", 
        "version": "2.0.0", 
        "status": "ready",
        "endpoints": ["/api/search", "/api/feedback", "/health"]
    }

@app.post("/api/search", response_model=SearchResponse)
def search_similar_questions(request: SearchRequest):
    """Search for similar questions"""
    try:
        logger.info(f"Searching for: {request.question}")
        
        # Find similar questions
        similar_items = simple_similarity_search(request.question, qa_dataset, top_k=5)
        
        # Convert to candidates
        candidates = []
        for i, item in enumerate(similar_items):
            candidates.append(Candidate(
                id=item["id"],
                question=item["question"],
                answer=item["answer"],
                similarity=round(0.9 - (i * 0.1), 2)  # Mock similarity scores
            ))
        
        logger.info(f"Found {len(candidates)} candidates")
        
        return SearchResponse(
            candidates=candidates,
            total_found=len(candidates)
        )
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/api/feedback")
def submit_feedback(request: FeedbackRequest):
    """Submit user feedback"""
    try:
        logger.info(f"Feedback received - Message: {request.message_id}, Helpful: {request.helpful}")
        
        return {
            "message": "フィードバックを受信しました。ありがとうございます！",
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback submission failed: {str(e)}")

@app.get("/api/faq", response_model=FAQResponse)
def get_faq_items():
    """Get all FAQ items"""
    try:
        logger.info("Fetching FAQ items")
        
        # Convert QA dataset to FAQ items
        faq_items = []
        for item in qa_dataset:
            faq_items.append(FAQItem(
                id=item["id"],
                question=item["question"],
                answer=item["answer"],
                category=item.get("category", "その他")
            ))
        
        logger.info(f"Returning {len(faq_items)} FAQ items")
        
        return FAQResponse(
            items=faq_items,
            total_count=len(faq_items)
        )
        
    except Exception as e:
        logger.error(f"FAQ error: {e}")
        raise HTTPException(status_code=500, detail=f"FAQ fetch failed: {str(e)}")

@app.get("/api/faq/categories")
def get_faq_categories():
    """Get all FAQ categories"""
    try:
        logger.info("Fetching FAQ categories")
        
        # Extract unique categories from QA dataset
        categories = set()
        for item in qa_dataset:
            category = item.get("category", "その他")
            categories.add(category)
        
        categories_list = ["すべて"] + sorted(list(categories))
        
        logger.info(f"Returning {len(categories_list)} categories")
        
        return {
            "categories": categories_list
        }
        
    except Exception as e:
        logger.error(f"Categories error: {e}")
        raise HTTPException(status_code=500, detail=f"Categories fetch failed: {str(e)}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "service": "chatbot-backend",
        "version": "2.0.0",
        "qa_items": len(qa_dataset)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)