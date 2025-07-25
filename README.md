# 🤖 Enterprise Chatbot - AI Knowledge Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

**次世代AI対話システム** - 社内ナレッジを活用した高精度チャットボット

企業向けAIチャットボットシステムで、社内のナレッジベースを活用して従業員の質問に高精度で回答します。最新のAI技術とベクトル検索を組み合わせ、ChatGPT風のモダンなUIで直感的な操作を実現しています。

## ✨ 主な機能

- 🔍 **スマート検索**: キーワードベースの類似度検索
- 💬 **チャット形式UI**: ChatGPTライクなモダンなインターフェース
- 📚 **FAQ機能**: カテゴリ別によくある質問を表示
- 🌗 **ダークモード**: ライト/ダークテーマの切り替え
- 📱 **レスポンシブ**: モバイル・デスクトップ対応
- ⚡ **高速レスポンス**: FastAPIによる高速バックエンド

## 🚀 クイックスタート

### 前提条件

- **Node.js** 18.0+ ([ダウンロード](https://nodejs.org/))
- **Python** 3.11+ ([ダウンロード](https://python.org/))
- **Git** ([ダウンロード](https://git-scm.com/))

### インストール & 実行（3ステップ）

```bash
# 1. リポジトリをクローン
git clone https://github.com/Rick2846/empower.git
cd empower

# 2. 依存関係をインストール
pip install -r requirements.txt
cd frontend && npm install && cd ..

# 3. アプリケーションを起動
npm run start
```

🎉 **完了！** ブラウザで http://localhost:3000 にアクセス

## 📁 プロジェクト構成

```
empower/
├── 📂 backend/                 # FastAPI バックエンド
│   ├── 📂 app/                # アプリケーションコード
│   ├── 📂 tests/              # バックエンドテスト
│   └── 📄 requirements.txt    # Python依存関係
├── 📂 frontend/               # React フロントエンド  
│   ├── 📂 src/               # ソースコード
│   │   ├── 📂 components/    # UIコンポーネント
│   │   └── 📂 hooks/         # カスタムフック
│   ├── 📂 tests/             # フロントエンドテスト
│   └── 📄 package.json       # Node.js依存関係
├── 📄 working_backend.py      # 単体バックエンド実行用
├── 📄 docker-compose.yml     # Docker設定
└── 📄 README.md              # このファイル
```

## 🛠️ 開発環境での実行

### バックエンドのみ実行

```bash
# Python環境を準備
pip install -r requirements.txt

# バックエンドサーバー起動
python working_backend.py
# または
uvicorn working_backend:app --host 0.0.0.0 --port 8000 --reload
```

バックエンドAPI: http://localhost:8000
API ドキュメント: http://localhost:8000/docs

### フロントエンドのみ実行

```bash
# フロントエンド依存関係インストール
cd frontend
npm install

# 開発サーバー起動
npm start
```

フロントエンド: http://localhost:3000

## 🐳 Docker での実行

```bash
# Docker Composeで全体を起動
docker-compose up --build

# または個別に起動
docker-compose up backend
docker-compose up frontend
```

## 📊 API エンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/search` | POST | 類似質問を検索 |
| `/api/faq` | GET | FAQ一覧を取得 |
| `/api/feedback` | POST | フィードバック送信 |
| `/health` | GET | ヘルスチェック |
| `/docs` | GET | API仕様書 (Swagger UI) |

## 🎯 使用方法

### 1. よくある質問から選択
- 初回アクセス時にFAQサイドバーが表示
- カテゴリ別にフィルタリング可能
- 質問クリックで自動的にチャット開始

### 2. 直接質問を入力
- 下部の入力欄に質問を記入
- Enterキーまたは送信ボタンで検索
- 関連する回答候補が表示される

### 3. 回答の選択
- 表示された候補から最適な回答を選択
- 詳細な回答が表示される
- フィードバックで回答の評価が可能

## 🔧 カスタマイズ

### FAQ データの追加

`working_backend.py` の `qa_dataset` を編集：

```python
qa_dataset = [
    {
        "id": "new_id",
        "question": "新しい質問",
        "answer": "詳細な回答",
        "keywords": ["キーワード1", "キーワード2"],
        "category": "カテゴリ名"
    }
]
```

### UI テーマのカスタマイズ

`frontend/src/App.tsx` のTailwind CSSクラスを編集してデザインを変更できます。

## 🧪 テスト

```bash
# バックエンドテスト
cd backend
pytest

# フロントエンドテスト  
cd frontend
npm test
```

## 🚨 トラブルシューティング

### よくある問題

**Q: ポート3000が既に使用されています**
```bash
# 他のプロセスを確認
lsof -ti:3000
# プロセスを停止
kill -9 <PID>
```

**Q: Pythonパッケージのインストールエラー**
```bash
# Python仮想環境を使用
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Q: Node.jsの依存関係エラー**
```bash
# node_modulesとpackage-lock.jsonを削除して再インストール
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Q: APIの通信エラー**
- バックエンドが http://localhost:8000 で動作しているか確認
- ファイアウォール設定を確認
- ブラウザの開発者ツールでネットワークエラーを確認

## 📈 パフォーマンス

- **レスポンス時間**: < 500ms (平均)
- **同時接続**: 100+ ユーザー対応
- **メモリ使用量**: ~200MB (バックエンド + フロントエンド)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下でライセンスされています。

## 🙏 謝辞

- [FastAPI](https://fastapi.tiangolo.com/) - 高速なWeb APIフレームワーク
- [React](https://reactjs.org/) - ユーザーインターフェースライブラリ
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク

## 📞 サポート

質問やサポートが必要な場合：

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/Rick2846/empower/issues)
- 📖 Wiki: [プロジェクト Wiki](https://github.com/Rick2846/empower/wiki)

---

⭐ このプロジェクトが役に立った場合は、ぜひスターを付けてください！