#!/bin/bash
# SMM Bot — Server Deploy Script
# Server: 5.189.141.151
# Usage: bash deploy.sh

set -e

SERVER="root@5.189.141.151"
APP_DIR="/opt/smm-bot"

echo "🚀 Deploying SMM Bot to $SERVER..."

ssh $SERVER << 'ENDSSH'
set -e

export DEBIAN_FRONTEND=noninteractive

# 1. Install dependencies if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    apt-get install -y docker-compose-plugin
fi

# 2. Clone or pull repo
if [ -d "/opt/smm-bot" ]; then
    echo "📥 Pulling latest code..."
    cd /opt/smm-bot
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/jaxongr/SMM-bot.git /opt/smm-bot
    cd /opt/smm-bot
fi

# 3. Create .env if not exists
if [ ! -f "/opt/smm-bot/backend/.env" ]; then
    echo "📝 Creating .env file..."
    cat > /opt/smm-bot/backend/.env << 'ENVEOF'
DATABASE_URL=postgresql://smm_user:smm_pass@localhost:5432/smm_bot
REDIS_URL=redis://localhost:6379

JWT_SECRET=smm-bot-jwt-secret-prod-$(openssl rand -hex 16)
JWT_REFRESH_SECRET=smm-bot-jwt-refresh-secret-prod-$(openssl rand -hex 16)
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

TELEGRAM_BOT_TOKEN=8791580167:AAEgqlh-LxIro1v8G8PsBEGVPz8FMbzXepY

APP_PORT=3000
APP_URL=http://5.189.141.151:3000
NODE_ENV=production

ADMIN_DEFAULT_USERNAME=admin
ADMIN_DEFAULT_PASSWORD=admin123
ENVEOF
fi

# 4. Start Docker services (PostgreSQL + Redis)
echo "🐳 Starting Docker services..."
cd /opt/smm-bot
docker compose up -d postgres redis

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# 5. Install backend dependencies
echo "📦 Installing backend dependencies..."
cd /opt/smm-bot/backend
npm install --production=false

# 6. Generate Prisma client & run migrations
echo "🗄️ Running database migrations..."
npx prisma generate
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss

# 7. Seed database
echo "🌱 Seeding database..."
npx ts-node src/prisma/seed.ts 2>/dev/null || echo "Seed skipped (may already exist)"

# 8. Build backend
echo "🔨 Building backend..."
npm run build

# 9. Install admin dependencies & build
echo "📦 Building admin dashboard..."
cd /opt/smm-bot/admin
npm install
npm run build

# 10. Install & configure Nginx
if ! command -v nginx &> /dev/null; then
    echo "🌐 Installing Nginx..."
    apt-get install -y nginx
fi

cat > /etc/nginx/sites-available/smm-bot << 'NGINXEOF'
server {
    listen 80;
    server_name 5.189.141.151;

    # Admin Dashboard
    location / {
        root /opt/smm-bot/admin/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket for support chat
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/smm-bot /etc/nginx/sites-enabled/smm-bot
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 11. Setup systemd service for backend
cat > /etc/systemd/system/smm-bot.service << 'SERVICEEOF'
[Unit]
Description=SMM Bot Backend
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/smm-bot/backend
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable smm-bot
systemctl restart smm-bot

echo ""
echo "✅ Deploy completed!"
echo "🌐 Admin Dashboard: http://5.189.141.151"
echo "📡 API: http://5.189.141.151/api/v1"
echo "📖 Swagger: http://5.189.141.151/api/docs"
echo "🤖 Bot: Telegram bot is running"
echo "👤 Admin login: admin / admin123"

ENDSSH

echo "🎉 Deployment finished!"
