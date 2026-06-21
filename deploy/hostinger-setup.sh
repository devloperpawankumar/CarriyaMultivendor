#!/usr/bin/env bash
# Carriya — first-time VPS setup on Hostinger (Ubuntu 22.04+)
# Run on the server as a user with sudo access.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/carriya}"
DOMAIN="${DOMAIN:-yourdomain.com}"
REPO_URL="${REPO_URL:-}"

echo "==> Carriya Hostinger VPS setup"
echo "    App directory: $APP_DIR"
echo "    Domain: $DOMAIN"

if [[ $EUID -eq 0 ]]; then
  echo "Run this script as a normal user with sudo, not as root."
  exit 1
fi

echo "==> Installing system packages..."
sudo apt-get update
sudo apt-get install -y curl git nginx certbot python3-certbot-nginx

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2..."
  sudo npm install -g pm2
fi

sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"

if [[ -n "$REPO_URL" && ! -d "$APP_DIR/.git" ]]; then
  echo "==> Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

echo "==> Installing dependencies..."
npm run install:all

if [[ ! -f backend/.env ]]; then
  echo "==> Copy backend/.env.example to backend/.env and fill in your values first!"
  cp backend/.env.example backend/.env
  echo "Edit: nano backend/.env"
  exit 1
fi

if [[ ! -f frontend/.env.production ]]; then
  cp frontend/.env.production.example frontend/.env.production
fi

echo "==> Building frontend..."
npm run deploy:build

echo "==> Starting API with PM2..."
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup | tail -n 1 | bash || true

echo "==> Configuring Nginx..."
sudo sed "s/YOUR_DOMAIN/$DOMAIN/g" deploy/nginx-carriya.conf | sudo tee /etc/nginx/sites-available/carriya >/dev/null
sudo ln -sf /etc/nginx/sites-available/carriya /etc/nginx/sites-enabled/carriya
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "==> Requesting SSL certificate..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || \
  echo "Certbot failed — run manually: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"

echo ""
echo "Done! Visit https://$DOMAIN"
echo "Health check: curl https://$DOMAIN/health"
echo "PM2 logs: pm2 logs carriya-api"
