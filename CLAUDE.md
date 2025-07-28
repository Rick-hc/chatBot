# Agent Communication System

## エージェント構成
- **PRESIDENT** (別セッション): 統括責任者
- **boss1** (multiagent:agents): チームリーダー
- **worker1,2,3** (multiagent:agents): 実行担当

## あなたの役割
- **PRESIDENT**: @instructions/president.md
- **boss1**: @instructions/boss.md
- **worker1,2,3**: @instructions/worker.md

## メッセージ送信
```bash
./agent-send.sh [相手] "[メッセージ]"
```

## 基本フロー
PRESIDENT → boss1 → workers → boss1 → PRESIDENT 

## チャットボット実装プロジェクト

### プロジェクト概要
- 社内ナレッジを活用した対話型チャットボットの構築
- ローカル環境で動作確認可能なスケルトンプロジェクト

### システム構成
- バックエンド: FastAPI (Python)
- フロントエンド: React + TypeScript + Tailwind CSS
- ベクトルDB: Chroma
- データストレージ: PostgreSQL
- デプロイ: Docker Compose

### 主要機能
1. ユーザー質問入力 (Q1)
2. OpenAI Embeddings APIによるベクトル化
3. QA集との類似度検索 (Top-K=20)
4. GPT-nanoによる候補絞り込み
5. 回答選択と表示
6. フィードバック機能

### プロジェクトリポジトリ
- URL: https://github.com/Rick2846/empower

### エラー処理
- FastAPI: HTTPException
- React: ErrorBoundary

### エージェント構成 (プロジェクト開発)
- President
- Boss
- Worker × 3