# Docker環境構築ガイド

## 概要
チャットボットプロジェクトのDocker・テスト環境構築が完了しました。

## システム構成
- **FastAPI Backend**: Python 3.11、SQLAlchemy、pytest
- **React Frontend**: Node.js 18、TypeScript、Tailwind CSS
- **PostgreSQL**: データストレージ
- **Chroma**: ベクトルデータベース

## 必要な準備
1. Docker & Docker Compose のインストール
2. OpenAI API キーの取得

## 環境設定

### 1. 開発環境の起動
```bash
# 開発環境起動
./scripts/start-dev.sh

# 手動起動の場合
cp .env.development .env
docker-compose up --build
```

### 2. テスト実行
```bash
# 全テスト実行
./scripts/run-tests.sh

# 手動テスト実行
docker-compose -f docker-compose.test.yml up --build
```

### 3. 本番環境設定
```bash
# 本番環境用設定ファイル使用
cp .env.production .env
# 環境変数設定後
docker-compose up -d
```

## アクセスポイント
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs
- PostgreSQL: localhost:5432
- Chroma: http://localhost:8000

## 環境変数設定
OpenAI API キーを環境変数に設定してください：
```bash
export OPENAI_API_KEY="your_api_key_here"
```

## ファイル構成
```
├── docker-compose.yml          # 開発環境設定
├── docker-compose.test.yml     # テスト環境設定
├── .env.development           # 開発環境変数
├── .env.production           # 本番環境変数
├── .env.test                 # テスト環境変数
├── backend/
│   ├── Dockerfile            # バックエンドコンテナ
│   ├── pytest.ini          # pytest設定
│   ├── conftest.py          # テストフィクスチャ
│   └── db/init.sql          # DB初期化スクリプト
├── frontend/
│   └── Dockerfile           # フロントエンドコンテナ
├── chroma-init/
│   └── init-chroma.py       # Chroma初期化スクリプト
└── scripts/
    ├── start-dev.sh         # 開発環境起動スクリプト
    └── run-tests.sh         # テスト実行スクリプト
```

## トラブルシューティング
```bash
# ログ確認
docker-compose logs -f [service_name]

# コンテナ状態確認
docker-compose ps

# 環境リセット
docker-compose down -v
docker system prune -f
```

## 次のステップ
1. APIエンドポイントの実装
2. フロントエンド機能開発  
3. OpenAI統合
4. テストケース追加