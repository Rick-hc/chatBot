#!/bin/bash
# ChatBot Backend Auto-Starter Script
# 使用方法: ./start_backend.sh

set -e  # エラー時に停止

# カラー出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: ディレクトリチェック
log_info "Step 1: ディレクトリ確認..."
TARGET_DIR="/mnt/c/Users/8961078/Desktop/Claude/empower"

if [ "$(pwd)" != "$TARGET_DIR" ]; then
    log_warning "正しいディレクトリに移動中..."
    cd "$TARGET_DIR" || {
        log_error "ディレクトリ $TARGET_DIR が見つかりません"
        exit 1
    }
fi
log_success "正しいディレクトリにいます: $(pwd)"

# Step 2: 必要ファイルの存在確認
log_info "Step 2: 必要ファイルの存在確認..."
required_files=("excel_backend.py" ".env" "requirements.txt")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "必要ファイル $file が見つかりません"
        exit 1
    fi
done
log_success "必要ファイルはすべて存在します"

# Step 3: 既存プロセスの停止
log_info "Step 3: 既存のバックエンドプロセスを停止中..."
if pgrep -f "excel_backend" > /dev/null; then
    log_warning "既存のプロセスを停止しています..."
    pkill -f "excel_backend" || true
    pkill -f "uvicorn.*8000" || true
    sleep 3
    log_success "既存プロセスを停止しました"
else
    log_info "停止すべきプロセスはありません"
fi

# Step 4: ポート確認
log_info "Step 4: ポート8000の確認..."
if ss -tulpn | grep -q ":8000"; then
    log_warning "ポート8000が使用中です。強制解放中..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi
log_success "ポート8000は利用可能です"

# Step 5: Python環境確認
log_info "Step 5: Python環境確認..."
if ! command -v python3 &> /dev/null; then
    log_error "python3 が見つかりません"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
log_success "Python環境: $PYTHON_VERSION"

# Step 6: 必要パッケージの確認
log_info "Step 6: 必要パッケージの確認..."
if ! python3 -c "import uvicorn, fastapi, pandas, openai" 2>/dev/null; then
    log_warning "一部パッケージが不足しています。インストールを試行..."
    pip3 install --user fastapi uvicorn openai pandas python-dotenv faiss-cpu numpy scikit-learn || {
        log_error "パッケージのインストールに失敗しました"
        exit 1
    }
fi
log_success "必要パッケージはすべて利用可能です"

# Step 7: データファイル確認
log_info "Step 7: データファイル確認..."
if [ ! -f "qa_embeddings.index" ] || [ ! -f "qa_metadata.pkl" ]; then
    log_warning "ベクトルインデックスが見つかりません。再構築中..."
    python3 -c "from vector_service import VectorService; vs = VectorService(); vs.build_index_from_excel()" || {
        log_error "ベクトルインデックスの構築に失敗しました"
        exit 1
    }
fi
log_success "データファイルの確認完了"

# Step 8: OpenAI APIキー確認
log_info "Step 8: OpenAI APIキー確認..."
if ! grep -q "OPENAI_API_KEY=" .env; then
    log_error "OpenAI APIキーが.envファイルに設定されていません"
    exit 1
fi
log_success "OpenAI APIキーが設定されています"

# Step 9: バックエンド起動
log_info "Step 9: バックエンドを起動中..."
echo "==================== バックエンド起動ログ ===================="

# バックグラウンドで起動し、ログをファイルに出力
nohup python3 -m uvicorn excel_backend:app --host 0.0.0.0 --port 8000 > backend_startup.log 2>&1 &
BACKEND_PID=$!

# 起動待機
log_info "起動を待機中... (PID: $BACKEND_PID)"
sleep 8

# Step 10: 動作確認
log_info "Step 10: 動作確認中..."
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
        if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
            log_success "バックエンドが正常に起動しました！"
            echo "==================== 起動情報 ===================="
            echo "🚀 Backend URL: http://localhost:8000"
            echo "📊 Health Check: http://localhost:8000/health"
            echo "📖 API Documentation: http://localhost:8000/docs"
            echo "🔍 Process ID: $BACKEND_PID"
            echo ""
            echo "✅ API テスト:"
            curl -s http://localhost:8000/health | head -3
            echo ""
            echo "==================== 操作方法 ===================="
            echo "停止: pkill -f excel_backend"
            echo "ログ確認: tail -f backend_startup.log"
            echo "プロセス確認: ps aux | grep excel_backend"
            exit 0
        fi
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    log_warning "再試行 $RETRY_COUNT/$MAX_RETRIES..."
    sleep 3
done

# 起動失敗時
log_error "バックエンドの起動に失敗しました"
echo "==================== エラー情報 ===================="
echo "起動ログ:"
tail -20 backend_startup.log 2>/dev/null || echo "ログファイルが見つかりません"
echo ""
echo "プロセス状況:"
ps aux | grep excel_backend | grep -v grep || echo "プロセスが見つかりません"
echo ""
echo "ポート使用状況:"
ss -tulpn | grep :8000 || echo "ポート8000は空いています"
exit 1