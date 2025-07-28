# Empower Frontend - 社内ナレッジチャットボット

社内ナレッジを活用した対話型チャットボットのフロントエンドアプリケーション

## 🚀 クイックスタート

### 必要条件
- Node.js 18.x 以上
- npm 9.x 以上

### インストールと起動
```bash
# リポジトリのクローン
git clone https://github.com/Rick2846/empower.git
cd empower/frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

アプリケーションは http://localhost:3000 で起動します。

## 📋 利用可能なスクリプト

### 開発用
```bash
npm start          # 開発サーバー起動
npm run dev        # 開発サーバー起動（エイリアス）
npm test           # テスト実行
npm run lint       # ESLintによるコード検査
npm run lint:fix   # ESLintによる自動修正
```

### ビルド用
```bash
npm run build      # 本番用ビルド
npm run build:prod # 本番環境用ビルド
npm run preview    # ビルド後のプレビュー
```

### その他
```bash
npm run test:coverage  # カバレッジ付きテスト
npm run clean         # キャッシュクリア
```

## 🏗️ プロジェクト構成

```
frontend/
├── public/                 # 静的ファイル
├── src/
│   ├── components/        # Reactコンポーネント
│   │   ├── SimpleChatMessage.tsx    # メッセージ表示
│   │   ├── SimpleChatInput.tsx      # 入力フィールド
│   │   ├── SimpleChatHistory.tsx    # 会話履歴
│   │   └── ...
│   ├── hooks/            # カスタムフック
│   │   ├── useTheme.tsx  # テーマ管理
│   │   └── useSpeech.tsx # 音声機能
│   ├── services/         # サービス層
│   ├── App.tsx          # メインアプリ
│   └── index.tsx        # エントリーポイント
├── Dockerfile           # Docker設定
├── nginx.conf          # Nginx設定
└── package.json        # 依存関係
```

## 🎨 主要機能

### ✅ 実装済み機能
- **シンプルなチャット UI**: ChatGPTライクなメッセージ表示
- **5個候補選択**: 関連質問の選択UI
- **フィードバック機能**: 「はい/いいえ」での回答評価
- **ダークモード**: ライト/ダークテーマ切り替え
- **レスポンシブ対応**: モバイル・タブレット対応
- **TypeScript**: 完全な型安全性

### 🔧 技術スタック
- **React 18**: UIライブラリ
- **TypeScript**: 型安全性
- **Tailwind CSS**: スタイリング
- **Axios**: HTTP通信
- **Web Speech API**: 音声機能（オプション）

## 🐳 Docker デプロイ

### 開発環境
```bash
docker build --target development -t empower-frontend:dev .
docker run -p 3000:3000 empower-frontend:dev
```

### 本番環境
```bash
docker build --target production -t empower-frontend:prod .
docker run -p 80:80 empower-frontend:prod
```

## 🌍 環境変数

`.env.example` をコピーして `.env` を作成:

```bash
cp .env.example .env
```

主要な環境変数:
- `REACT_APP_API_URL`: バックエンドAPIのURL
- `REACT_APP_ENV`: 環境設定（development/production）
- `REACT_APP_ENABLE_VOICE`: 音声機能の有効/無効

## 🔧 開発ガイド

### コードスタイル
- ESLint + Prettier使用
- TypeScript strict mode
- 関数型コンポーネント推奨

### コミット前の確認
```bash
npm run lint        # コード品質チェック
npm run test        # テスト実行
npm run build       # ビルド確認
```

## 📱 UI コンポーネント

### SimpleChatMessage
- メッセージバブル表示
- ユーザー/AI の区別
- タイムスタンプ表示
- 候補選択UI
- フィードバック機能

### SimpleChatInput
- メッセージ入力
- 送信ボタン
- 文字数カウンター
- ローディング状態

### SimpleChatHistory
- 会話履歴表示
- 自動スクロール
- 初期画面の案内

## 🚀 デプロイ手順

1. **ビルド確認**
   ```bash
   npm run build
   npm run preview
   ```

2. **Docker ビルド**
   ```bash
   docker build -t empower-frontend .
   ```

3. **デプロイ実行**
   ```bash
   docker run -p 80:80 empower-frontend
   ```

## 📞 サポート

問題やご質問がございましたら、Issueを作成してください。

## 📄 ライセンス

MIT License - 詳細は LICENSE ファイルをご覧ください。