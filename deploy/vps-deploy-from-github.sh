#!/usr/bin/env bash
# Carriya — deploy from GitHub on Hostinger VPS (carryia.com)
# Run AFTER backend/.env exists on the server.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/carriya}"
DOMAIN="${DOMAIN:-carryia.com}"
REPO_URL="${REPO_URL:-https://github.com/devloperpawankumar/CarriyaMultivendor.git}"
BRANCH="${BRANCH:-master}"

echo "==> Carriya deploy from GitHub"
echo "    Directory: $APP_DIR"
echo "    Domain:    $DOMAIN"
echo "    Repo:      $REPO_URL ($BRANCH)"

if [[ ! -f "$APP_DIR/backend/.env" ]]; then
  echo ""
  echo "ERROR: $APP_DIR/backend/.env not found."
  echo "Create it first (copy from your local machine, then set production values):"
  echo "  FRONTEND_URL=https://$DOMAIN,https://www.$DOMAIN"
  echo "  NODE_ENV=production"
  echo "  COOKIE_SAME_SITE=lax"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2..."
  sudo npm install -g pm2
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "==> Installing Nginx..."
  sudo apt-get update
  sudo apt-get install -y nginx git
fi

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "==> Cloning repository..."
  sudo mkdir -p "$APP_DIR"
  sudo chown -R "$USER:$USER" "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  echo "==> Pulling latest code..."
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

cd "$APP_DIR"

if [[ ! -f frontend/.env.production ]]; then
  cp frontend/.env.production.example frontend/.env.production
  echo "Created frontend/.env.production — edit REACT_APP_GOOGLE_CLIENT_ID if needed."
fi

echo "==> Installing dependencies..."
npm run install:all

echo "==> Building frontend..."
npm run deploy:build

echo "==> Starting / restarting API..."
if pm2 describe carriya-api >/dev/null 2>&1; then
  pm2 restart carriya-api
else
  pm2 start deploy/ecosystem.config.cjs
fi
pm2 save
pm2 startup 2>/dev/null | tail -n 1 | bash || true

echo "==> Configuring Nginx..."
sudo sed "s/YOUR_DOMAIN/$DOMAIN/g" deploy/nginx-carriya.conf | sudo tee /etc/nginx/sites-available/carriya >/dev/null
sudo ln -sf /etc/nginx/sites-available/carriya /etc/nginx/sites-enabled/carriya
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "==> Health check (local)..."
sleep 2
curl -sf http://127.0.0.1:4000/health && echo "" || echo "WARNING: API not responding on port 4000 — run: pm2 logs carriya-api"

if ! command -v certbot >/dev/null 2>&1; then
  echo ""
  echo "==> Install SSL (run once DNS points to this server):"
  echo "    sudo apt install -y certbot python3-certbot-nginx"
  echo "    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
else
  echo ""
  echo "SSL: if not done yet, run:"
  echo "    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

echo ""
echo "Done. Open: http://$DOMAIN (or https after certbot)"
echo "Logs: pm2 logs carriya-api"
