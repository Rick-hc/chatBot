# 🤝 コントリビューションガイド

Empower プロジェクトへのコントリビューションをお考えいただき、ありがとうございます！

## 📋 開発環境セットアップ

### 必要な要件
- **Docker** & **Docker Compose**
- **Node.js 18+**
- **Python 3.11+**
- **Git**

### ローカル開発環境構築

```bash
# 1. リポジトリをフォーク & クローン
git clone https://github.com/YOUR_USERNAME/empower.git
cd empower

# 2. 環境変数設定
cp .env.example .env
# .envファイルを編集してOPENAI_API_KEYを設定

# 3. 開発環境起動
docker-compose up -d
```

## 🔄 開発ワークフロー

### 1. 新機能・バグ修正の開始

```bash
# メインブランチから最新を取得
git checkout main
git pull origin main

# 機能ブランチを作成
git checkout -b feature/your-feature-name
# または
git checkout -b bugfix/issue-number
```

### 2. ブランチ命名規則

- **機能追加**: `feature/feature-name`
- **バグ修正**: `bugfix/issue-number`
- **ドキュメント**: `docs/update-description`
- **リファクタリング**: `refactor/component-name`
- **テスト**: `test/test-description`

### 3. コミットメッセージ規則

```bash
# 形式: type(scope): description
feat(backend): Add OpenAI embeddings API integration
fix(frontend): Resolve chat input validation issue
docs(readme): Update installation instructions
test(api): Add comprehensive integration tests
refactor(components): Simplify chat message component
```

**コミットタイプ**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `test`: テスト追加・修正
- `refactor`: リファクタリング
- `style`: コードスタイル修正
- `chore`: 雑務（依存関係更新など）

## 🧪 テスト

### バックエンドテスト

```bash
cd backend
pytest tests/ -v --cov=app
```

### フロントエンドテスト

```bash
cd frontend
npm test
npm run test:coverage
```

### 統合テスト

```bash
python tests/comprehensive_integration_test.py
```

## 📝 コードスタイル

### Python (Backend)
- **Black** でフォーマット
- **flake8** でLint
- **isort** でimport整理

```bash
cd backend
black .
flake8 .
isort .
```

### TypeScript/React (Frontend)
- **Prettier** でフォーマット
- **ESLint** でLint

```bash
cd frontend
npm run format
npm run lint
```

## 🔍 プルリクエスト作成

### PR作成前チェックリスト

- [ ] 全テストが通過する
- [ ] コードスタイルチェックが通過する
- [ ] 新機能にはテストを追加済み
- [ ] ドキュメントを更新済み（必要に応じて）
- [ ] CHANGELOG.mdを更新済み（破壊的変更の場合）

### PRテンプレート

```markdown
## 📝 変更概要
簡潔に変更内容を説明

## 🎯 変更理由
なぜこの変更が必要か

## 🧪 テスト
どのようにテストしたか

## 📷 スクリーンショット（UI変更の場合）
変更前後の画像

## ✅ チェックリスト
- [ ] テスト追加済み
- [ ] ドキュメント更新済み
- [ ] 動作確認済み
```

## 🐛 バグ報告

### Issue テンプレート

```markdown
## 🐛 バグの説明
何が起こったか明確に説明

## 🔄 再現手順
1. '...'に移動
2. '...'をクリック
3. エラーが発生

## 💭 期待される動作
何が起こるべきだったか

## 📷 スクリーンショット
可能であれば添付

## 🖥️ 環境
- OS: [e.g. macOS]
- ブラウザ: [e.g. Chrome 119]
- バージョン: [e.g. v1.0.0]
```

## 💡 新機能提案

### Feature Request テンプレート

```markdown
## 🚀 機能の説明
提案する機能の詳細

## 💭 動機
なぜこの機能が必要か

## 📋 実装案
実装方法のアイデア

## 🎯 成功基準
機能が完成したと判断する基準
```

## 📚 コーディング規約

### 全体的な原則
- **可読性を重視**
- **DRY原則** (Don't Repeat Yourself)
- **SOLID原則**に従う
- **明確な命名**を使用

### ファイル構成規則

```
backend/
├── app/
│   ├── api/          # APIエンドポイント
│   ├── core/         # 設定・ユーティリティ
│   ├── db/           # データベース関連
│   ├── models/       # データモデル
│   └── services/     # ビジネスロジック

frontend/
├── src/
│   ├── components/   # UIコンポーネント
│   ├── hooks/        # カスタムフック
│   ├── services/     # API・サービス
│   └── utils/        # ユーティリティ
```

## 🏷️ ラベル使用規則

### Priority (優先度)
- `priority/high`: 緊急対応
- `priority/medium`: 通常対応
- `priority/low`: 時間があるときに

### Type (種類)
- `type/bug`: バグ修正
- `type/feature`: 新機能
- `type/enhancement`: 改善
- `type/documentation`: ドキュメント

### Status (状態)
- `status/needs-review`: レビュー待ち
- `status/in-progress`: 作業中
- `status/blocked`: ブロック中

## 🎉 認識・謝辞

コントリビューターの皆様：
- 最初のPRをマージされた方は[CONTRIBUTORS.md](./CONTRIBUTORS.md)に追加
- 継続的な貢献者は年次レポートで特別認識

## 📞 質問・サポート

- 📧 Email: dev-support@example.com
- 💬 Discord: [開発者コミュニティ](https://discord.gg/example)
- 📖 Wiki: [開発ドキュメント](https://github.com/Rick2846/empower/wiki)

---

**最後に**: コントリビューションは大小を問わず大歓迎です！typo修正からでも気軽にPRを送ってください 🚀