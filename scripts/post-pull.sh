#!/bin/bash

# Script tự động rebuild container và chạy migration sau khi pull code
# Sử dụng: ./scripts/post-pull.sh hoặc npm run post-pull

set -e  # Exit on error

echo "🔄 Starting post-pull setup..."

# Kiểm tra xem có file .env không
if [ ! -f .env ]; then
  echo "⚠️  Warning: .env file not found. Please create it first."
fi

# Kiểm tra docker compose có đang chạy không
if ! docker compose ps | grep -q "phuphiem_backend"; then
  echo "🐳 Starting containers..."
  docker compose up -d postgres
  sleep 3
fi

# Rebuild và restart backend container
echo "🐳 Rebuilding backend container..."
docker compose up backend -d --build

# Đợi container backend sẵn sàng
echo "⏳ Waiting for backend container to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if docker compose exec -T backend sh -c "echo 'Container is ready'" > /dev/null 2>&1; then
    break
  fi
  attempt=$((attempt + 1))
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Backend container failed to start. Please check logs: docker compose logs backend"
  exit 1
fi

# Chạy migration trong container
echo "📦 Running database migrations..."
docker compose exec -T backend npm run typeorm:migrate:prod || {
  echo "⚠️  Migration may have failed or no new migrations. Check logs if needed."
}

echo "✅ Post-pull setup completed successfully!"
echo "🚀 Backend is running at http://localhost:8386"
echo "📘 View logs: docker compose logs -f backend"

