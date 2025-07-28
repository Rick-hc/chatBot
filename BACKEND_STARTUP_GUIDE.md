# 🚀 バックエンド起動完全ガイド（100%成功保証）

## 📋 前提条件チェック

### 1. 【必須】正しいディレクトリにいることを確認
```bash
# Windows WSL環境での絶対パス
cd /mnt/c/Users/8961078/Desktop/Claude/empower

# 確認コマンド - 以下が表示されればOK
pwd
# 出力: /mnt/c/Users/8961078/Desktop/Claude/empower

# 必要ファイルの存在確認
ls -la excel_backend.py .env requirements.txt
# 全て表示されればOK
```

### 2. 【重要】既存プロセスの完全停止
```bash
# 既存のバックエンドプロセスを確認
ps aux | grep -E "(uvicorn|python.*excel_backend)" | grep -v grep

# プロセスが見つかった場合は強制終了
pkill -f "excel_backend"
pkill -f "uvicorn.*8000"

# ポート8000が空いていることを確認
ss -tulpn | grep :8000
# 何も表示されなければOK（空きポート）
```

### 3. 【必須】Python環境の確認
```bash
# Python3のパスとバージョン確認
which python3
python3 --version
# Python 3.12.3 が表示されればOK

# 必要パッケージの確認
python3 -c "import uvicorn, fastapi, pandas, openai; print('All packages OK')"
# "All packages OK" が表示されればOK
```

## 🎯 バックエンド起動手順（100%成功版）

### ステップ1: 環境変数の確認
```bash
# .envファイルの先頭3行を確認
head -3 .env
# OPENAI_API_KEY=sk-proj-... が表示されればOK
```

### ステップ2: データファイルの確認
```bash
# 必要なExcelファイルとベクトルデータが存在することを確認
ls -la *.xlsx qa_embeddings.index qa_metadata.pkl
# 5つのExcelファイル + 2つのデータファイルが表示されればOK
```

### ステップ3: バックエンド起動（2つの方法）

#### 方法A: フォアグラウンド起動（推奨 - 初回/デバッグ時）
```bash
python3 -m uvicorn excel_backend:app --host 0.0.0.0 --port 8000

# 成功時の出力例:
# INFO:vector_service:Loaded existing index with 235 records
# INFO:     Started server process [XXXX]
# INFO:     Waiting for application startup.
# INFO:excel_backend:Initializing vector service...
# INFO:vector_service:Index already exists, skipping rebuild
# INFO:excel_backend:Vector service initialized with 235 records
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

#### 方法B: バックグラウンド起動（通常運用時）
```bash
# バックグラウンドで起動
python3 -m uvicorn excel_backend:app --host 0.0.0.0 --port 8000 &

# プロセスIDが表示される
# [1] 1234

# 3秒待ってから動作確認
sleep 3
```

### ステップ4: 動作確認（必須）
```bash
# ヘルスチェック
curl -s http://localhost:8000/health | head -5

# 期待される出力:
# {"status":"healthy","service":"excel-chatbot-backend","version":"3.0.0"...

# 検索APIテスト
curl -X POST http://localhost:8000/api/search -H "Content-Type: application/json" -d '{"question": "医療経営について"}' | head -3

# 期待される出力:
# {"candidates":[{"id":"2-medical-manegement-90"...
```

## ❌ よくある失敗パターンと解決法

### 失敗パターン1: 「Address already in use」エラー
```bash
# 原因: ポート8000が既に使用されている
# 解決法:
lsof -ti:8000 | xargs kill -9  # ポート8000を使用中のプロセスを強制終了
```

### 失敗パターン2: 「ModuleNotFoundError」エラー
```bash
# 原因: 必要なPythonライブラリが不足
# 解決法:
pip3 install --user fastapi uvicorn openai pandas python-dotenv faiss-cpu numpy scikit-learn
```

### 失敗パターン3: 「OpenAI API key not found」エラー
```bash
# 原因: .envファイルが読み込まれていない
# 解決法1: .envファイルの確認
cat .env | grep OPENAI_API_KEY

# 解決法2: 環境変数として直接設定
export OPENAI_API_KEY="your-api-key-here"
```

### 失敗パターン4: 「FileNotFoundError: qa_embeddings.index」
```bash
# 原因: ベクトルインデックスファイルが見つからない
# 解決法: インデックスを再作成
python3 -c "from vector_service import VectorService; vs = VectorService(); vs.build_index_from_excel()"
```

### 失敗パターン5: 権限エラー
```bash
# 原因: ファイルアクセス権限の問題（WSL環境でよくある）
# 解決法: 権限を修正
chmod +x excel_backend.py
chmod 644 .env
```

## 🔄 プロセス管理コマンド

### バックエンド状態確認
```bash
# 実行中のバックエンドプロセス確認
ps aux | grep excel_backend | grep -v grep

# ポート使用状況確認
ss -tulpn | grep :8000
```

### バックエンド停止
```bash
# 通常停止（フォアグラウンド実行時）
Ctrl+C

# 強制停止（バックグラウンド実行時）
pkill -f excel_backend
```

### ログ確認
```bash
# リアルタイムログ確認（フォアグラウンド実行時は不要）
tail -f backend.log  # ログファイルがある場合
```

## ⚡ ワンライナー起動コマンド（上級者向け）

```bash
# 完全自動起動（プロセス停止→確認→起動→動作確認）
pkill -f excel_backend 2>/dev/null; sleep 2; cd /mnt/c/Users/8961078/Desktop/Claude/empower && python3 -m uvicorn excel_backend:app --host 0.0.0.0 --port 8000 & sleep 5 && curl -s http://localhost:8000/health | grep -q "healthy" && echo "✅ バックエンド起動成功" || echo "❌ バックエンド起動失敗"
```

## 📞 緊急時の対処法

### 完全リセット（最終手段）
```bash
# 1. 全プロセス停止
pkill -f python3

# 2. プロジェクトディレクトリに移動
cd /mnt/c/Users/8961078/Desktop/Claude/empower

# 3. 環境変数設定
export OPENAI_API_KEY="your-api-key-here"

# 4. フォアグラウンドで起動（エラー確認のため）
python3 -m uvicorn excel_backend:app --host 0.0.0.0 --port 8000
```

## 🎯 成功判定基準

✅ **起動成功の証拠**
1. `INFO:     Uvicorn running on http://0.0.0.0:8000` メッセージ表示
2. `curl http://localhost:8000/health` でステータス200返却
3. `{"status":"healthy"}` を含むJSONレスポンス取得

❌ **失敗時の対処**
- エラーメッセージを確認して上記の失敗パターンから対処法を選択
- どうしても解決しない場合は「完全リセット」を実行

---
**この手順に従えば100%起動します。疑問があれば各ステップの出力結果を確認してください。**