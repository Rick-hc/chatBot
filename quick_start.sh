#!/bin/bash
# 🚀 ChatBot クイックスタート（超簡単版）
# 使用方法: ./quick_start.sh

echo "🤖 ChatBot バックエンド起動中..."

# 現在のプロセスを停止
pkill -f excel_backend 2>/dev/null || true
sleep 2

# プロジェクトディレクトリに移動
cd /mnt/c/Users/8961078/Desktop/Claude/empower

# バックエンド起動
python3 -m uvicorn excel_backend:app --host 0.0.0.0 --port 8000 &

# 起動待機
echo "⏳ 起動待機中..."
sleep 6

# 動作確認
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ バックエンド起動成功！"
    echo "📊 URL: http://localhost:8000"
    echo "📖 API Doc: http://localhost:8000/docs"
    echo ""
    echo "🛑 停止方法: pkill -f excel_backend"
else
    echo "❌ バックエンド起動失敗"
    echo "詳細な起動方法は './start_backend.sh' を実行してください"
fi