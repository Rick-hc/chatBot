# フロントエンド用 Multi-stage Dockerfile
# Node.js 18 LTS ベース

# ビルドステージ
FROM node:18-alpine AS builder

# メタデータ
LABEL maintainer="empower-team"
LABEL description="Empower Frontend - 社内ナレッジチャットボット"

# システム依存関係のインストール
RUN apk add --no-cache curl git

# 作業ディレクトリの設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 開発依存関係も含めてインストール（ビルドに必要）
RUN npm ci --silent

# ソースコードをコピー
COPY . .

# TypeScript型チェックとビルド
RUN npm run build

# 本番用ステージ
FROM nginx:alpine AS production

# Nginxの設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルド済みファイルをコピー
COPY --from=builder /app/build /usr/share/nginx/html

# ヘルスチェック用のファイルを作成
RUN echo '{"status": "healthy", "timestamp": "'$(date -Iseconds)'"}' > /usr/share/nginx/html/health

# 権限設定
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# ポート80を公開
EXPOSE 80

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]

# 開発用ステージ
FROM node:18-alpine AS development

WORKDIR /app

# システム依存関係のインストール
RUN apk add --no-cache curl git

# パッケージファイルをコピー
COPY package*.json ./

# 全依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactuser -u 1001 && \
    chown -R reactuser:nodejs /app

USER reactuser

EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["npm", "start"]