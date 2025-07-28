# 🤖 Medical Knowledge Chatbot - Excel-Based AI Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings-green.svg)](https://openai.com/)

**医療系社内ナレッジチャットボット** - Excelファイルベースの高精度AI対話システム

医療機関向けの専門チャットボットシステムです。医療経営管理、コンプライアンス、医療広告ガイドラインなどの社内ナレッジをExcelファイルから読み込み、OpenAI Embeddings APIを活用したベクトル検索で高精度な回答を提供します。

## ✨ 主な機能

- 🔍 **Excel-based Vector Search**: ExcelファイルからQ&Aデータを自動読み込み
- 🧠 **OpenAI Embeddings**: text-embedding-3-largeを使用した高精度類似度検索
- 💬 **医療特化チャット**: 医療経営・コンプライアンス専門の対話システム
- 📚 **カテゴリ別FAQ**: 医療経営管理、クリニックコンプライアンス、医療広告ガイドライン等
- 📱 **レスポンシブUI**: モバイル・デスクトップ対応
- 💾 **FAISS Vector DB**: 高速ベクトル検索インデックス
- 🔄 **リアルタイムフィードバック**: はい/いいえ形式の改善された回答評価システム

## 🚀 システム起動方法

### 前提条件
- **Python 3.11+** 
- **Node.js 18+** & **npm**
- **OpenAI API Key** ([取得方法](https://platform.openai.com/api-keys))

### 🎯 簡単セットアップ（2ステップ）

#### 1. 環境準備
```bash
# リポジトリをクローン
git clone https://github.com/Rick2846/empower.git
cd empower

# OpenAI API Keyを設定（.envファイルに既に設定済み）
# OPENAI_API_KEY=your-api-key-here
```

#### 2. システム起動

**バックエンド起動 (ポート8000)**
```bash
# Excelベースのベクトル検索バックエンドを起動
uvicorn excel_backend:app --host 0.0.0.0 --port 8000 &
```

**フロントエンド起動 (ポート3000)**
```bash
# Reactフロントエンドを起動
cd frontend
npm start
```

🎉 **完了！** 以下にアクセス:
- **フロントエンド**: http://10.110.9.22:3000 または http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **ヘルスチェック**: http://localhost:8000/health
- **API仕様書**: http://localhost:8000/docs

## 📊 データ構成

### Excelファイル（235件のQ&Aデータ）
```
empower/
├── 2-medical-manegement.xlsx          # 医療経営管理 (114件)
├── 3-Compliance of the clinic.xlsx    # クリニックコンプライアンス (16件)
├── 3-medical-ad-guideline_FAQ.xlsx    # 医療広告ガイドライン (58件)
├── 5-Terms of Use-Important Handling Instruction.xlsx  # 重要事項説明 (28件)
└── 8-specific-medical-ad-guideline.xlsx  # 医療広告特定ガイドライン (19件)
```

### システム構成
```
empower/
├── 📂 excel_backend.py        # FastAPI + OpenAI Embeddings ベクトル検索サーバー
├── 📂 excel_loader.py         # Excelファイル読み込みモジュール
├── 📂 vector_service.py       # FAISS ベクトル検索サービス
├── 📂 frontend/               # React TypeScript フロントエンド
│   ├── 📂 src/components/     # UIコンポーネント
│   └── 📂 src/hooks/          # カスタムフック
└── 📂 qa_embeddings.index     # FAISS ベクトルインデックス（自動生成）
```

## 🔧 技術仕様

### バックエンド
- **FastAPI** - 高速Web APIフレームワーク
- **OpenAI Embeddings API** - text-embedding-3-large (3072次元)
- **FAISS** - 高速類似度検索ライブラリ
- **pandas** - Excel読み込み・データ処理

### フロントエンド
- **React 18** - モダンUIフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - ユーティリティCSS
- **Axios** - HTTP通信

## 📋 API エンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/search` | POST | ベクトル類似度検索 |
| `/api/faq` | GET | FAQ一覧取得 |
| `/api/faq/categories` | GET | カテゴリ一覧取得 |
| `/api/feedback` | POST | フィードバック送信 |
| `/health` | GET | システムヘルスチェック |
| `/api/stats` | GET | ベクトルサービス統計 |

## 🎯 使用方法

### 1. FAQ参照
- 初回アクセス時に医療分野別のFAQが表示
- カテゴリフィルタリングで絞り込み可能
- 質問クリックで詳細回答を表示

### 2. 質問検索
- 入力欄に自然言語で質問を記入
- OpenAI Embeddingsで類似度検索を実行
- 関連度の高い回答候補を5件表示

### 3. フィードバック
- 回答後に「この回答で解決しましたか？」を表示
- 「はい」: そのまま継続
- 「いいえ」: コメント入力フォームを表示

## 🔄 データ更新方法

### Excelファイル更新
1. 対象のExcelファイルを編集（B列: 質問、A列: 回答）
2. バックエンドサーバーを再起動
3. 自動的にベクトルインデックスが再構築

### ベクトルインデックス再構築
```bash
# 手動でインデックス再構築
python -c "from vector_service import VectorService; vs = VectorService(); vs.build_index_from_excel()"
```

## 🚨 トラブルシューティング

### よくある問題

**Q: フロントエンドに接続できない**
```bash
# ポート確認
ss -tulpn | grep :3000
# 別ポートで起動
PORT=3001 npm start
```

**Q: バックエンドが起動しない**
```bash
# 依存関係を確認
pip install fastapi uvicorn openai pandas faiss-cpu python-dotenv
```

**Q: OpenAI APIエラー**
- `.env`ファイルのOPENAI_API_KEYが正しく設定されているか確認
- APIキーの有効性と残高を確認

**Q: Excelファイルが読み込まれない**
- ファイルパスが正しいか確認
- B列（質問）、A列（回答）の形式になっているか確認

## 📈 パフォーマンス

- **データ件数**: 235件のQ&Aペア
- **ベクトル次元**: 3072次元 (text-embedding-3-large)
- **検索時間**: < 100ms (平均)
- **メモリ使用量**: ~300MB (ベクトルインデックス含む)

## 🤝 開発・改善

### 新機能追加
1. `excel_backend.py` - API エンドポイント追加
2. `frontend/src/components/` - UIコンポーネント追加
3. データ追加は対応するExcelファイルを編集

### カスタマイズ
- カテゴリマッピング: `excel_backend.py` の `category_mapping` を編集
- UI テーマ: `frontend/src/App.css` を編集
- 検索パラメータ: `vector_service.py` を調整

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下でライセンスされています。

## 🙏 謝辞

- [OpenAI](https://openai.com/) - Embeddings API
- [FastAPI](https://fastapi.tiangolo.com/) - 高速Web APIフレームワーク
- [React](https://reactjs.org/) - UIライブラリ
- [FAISS](https://github.com/facebookresearch/faiss) - 高速類似度検索

---

⭐ このプロジェクトが役に立った場合は、ぜひスターを付けてください！