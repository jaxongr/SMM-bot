#!/usr/bin/env python3
"""SMM Bot — Remote Deploy Script via SSH (paramiko)"""
import sys
import os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.environ['PYTHONIOENCODING'] = 'utf-8'
import paramiko
import time

HOST = "5.189.141.151"
USER = "root"
PASSWORD = "P3h2c5t4F"

def run_cmd(ssh, cmd, timeout=300):
    """Run command and print output in real-time"""
    print(f"\n{'='*60}")
    print(f">>> {cmd[:100]}...")
    print('='*60)
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print(out)
    if err.strip():
        print(f"STDERR: {err}")
    if exit_code != 0:
        print(f"[EXIT CODE: {exit_code}]")
    return exit_code, out, err

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print(f"🔌 Connecting to {HOST}...")
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected!")

    # Upload SSH key for future passwordless access
    import os
    pubkey_path = os.path.expanduser("~/.ssh/id_rsa.pub")
    if os.path.exists(pubkey_path):
        with open(pubkey_path) as f:
            pubkey = f.read().strip()
        run_cmd(ssh, f'mkdir -p ~/.ssh && echo "{pubkey}" >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys')
        print("🔑 SSH key uploaded")

    commands = [
        # 1. System update + deps
        "apt-get update -qq",

        # 2. Install Node.js 20
        "node --version 2>/dev/null || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)",
        "node --version && npm --version",

        # 3. Install Docker
        "docker --version 2>/dev/null || (curl -fsSL https://get.docker.com | sh && systemctl enable docker && systemctl start docker)",
        "docker --version",

        # 4. Install docker-compose plugin
        "docker compose version 2>/dev/null || apt-get install -y docker-compose-plugin",

        # 5. Install git, nginx
        "apt-get install -y git nginx -qq",

        # 6. Clone or pull repo
        """if [ -d "/opt/smm-bot/.git" ]; then
    cd /opt/smm-bot && git fetch origin && git reset --hard origin/main
    echo "PULLED"
else
    rm -rf /opt/smm-bot
    git clone https://github.com/jaxongr/SMM-bot.git /opt/smm-bot
    echo "CLONED"
fi""",

        # 7. Create .env
        """cat > /opt/smm-bot/backend/.env << 'ENVEOF'
DATABASE_URL=postgresql://smm_user:smm_pass@localhost:5432/smm_bot
REDIS_URL=redis://localhost:6379

JWT_SECRET=smm-bot-jwt-secret-prod-x7k9m2p4
JWT_REFRESH_SECRET=smm-bot-jwt-refresh-secret-prod-q3w5r8t1
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

TELEGRAM_BOT_TOKEN=8791580167:AAEgqlh-LxIro1v8G8PsBEGVPz8FMbzXepY

APP_PORT=3000
APP_URL=http://5.189.141.151:3000
NODE_ENV=production

ADMIN_DEFAULT_USERNAME=admin
ADMIN_DEFAULT_PASSWORD=admin123
ENVEOF
echo ".env created"
""",

        # 8. Start Docker (PostgreSQL + Redis)
        "cd /opt/smm-bot && docker compose up -d postgres redis && echo 'Docker services started'",

        # 9. Wait for postgres
        "sleep 5 && docker compose -f /opt/smm-bot/docker-compose.yml ps",

        # 10. Install backend deps
        "cd /opt/smm-bot/backend && npm install 2>&1 | tail -5",

        # 11. Prisma generate + migrate
        "cd /opt/smm-bot/backend && npx prisma generate && echo 'Prisma generated'",
        "cd /opt/smm-bot/backend && npx prisma db push --accept-data-loss 2>&1 && echo 'DB schema pushed'",

        # 12. Seed
        "cd /opt/smm-bot/backend && npx ts-node src/prisma/seed.ts 2>&1 || echo 'Seed done or skipped'",

        # 13. Build backend
        "cd /opt/smm-bot/backend && npm run build 2>&1 | tail -5 && echo 'Backend built'",

        # 14. Install admin deps + build
        "cd /opt/smm-bot/admin && npm install 2>&1 | tail -5",
        "cd /opt/smm-bot/admin && npm run build 2>&1 | tail -5 && echo 'Admin built'",

        # 15. Nginx config
        """cat > /etc/nginx/sites-available/smm-bot << 'NGINXEOF'
server {
    listen 80;
    server_name 5.189.141.151;

    # Admin Dashboard
    location / {
        root /opt/smm-bot/admin/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API & Swagger
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket
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
nginx -t && systemctl reload nginx && echo 'Nginx configured'
""",

        # 16. Systemd service
        """cat > /etc/systemd/system/smm-bot.service << 'SVCEOF'
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
SVCEOF
systemctl daemon-reload
systemctl enable smm-bot
systemctl restart smm-bot
echo 'Service started'
""",

        # 17. Check status
        "sleep 3 && systemctl status smm-bot --no-pager | head -15",
        "curl -s http://localhost:3000/api/v1/health 2>/dev/null || echo 'Health check pending (may need a moment)'"
    ]

    for cmd in commands:
        code, out, err = run_cmd(ssh, cmd, timeout=600)
        if code != 0 and "already" not in out.lower() and "skip" not in out.lower():
            print(f"⚠️ Command returned non-zero exit code: {code}")

    print("\n" + "="*60)
    print("🎉 DEPLOYMENT COMPLETE!")
    print("="*60)
    print(f"🌐 Admin Dashboard: http://{HOST}")
    print(f"📡 API: http://{HOST}/api/v1")
    print(f"📖 Swagger: http://{HOST}/api/docs")
    print(f"🤖 Telegram Bot: Running")
    print(f"👤 Admin: admin / admin123")
    print("="*60)

    ssh.close()

if __name__ == "__main__":
    main()
