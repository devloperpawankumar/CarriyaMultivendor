# Deploy Carriya → carryia.com (Hostinger VPS)

Personalized checklist for your setup. Your secrets stay in `backend/.env` on the server — do not commit that file.

---

## Before you start

| Item | Your value |
|------|------------|
| Domain | `carryia.com` |
| VPS | Hostinger (Ubuntu) |
| Database | MongoDB Atlas (already in `.env`) |
| Images | Cloudinary (already in `.env`) |
| Email | Gmail SMTP (already in `.env`) |

**Security:** You shared `.env` in chat. After go-live, rotate: MongoDB password, `JWT_SECRET`, Cloudinary secret, and Gmail app password.

---

## Step 1 — DNS (Hostinger hPanel)

**Domains → carryia.com → DNS**

| Type | Name | Points to |
|------|------|-----------|
| A | `@` | Your VPS IP |
| A | `www` | Your VPS IP |

Wait 5–30 minutes, then check:

```bash
ping carryia.com
```

---

## Step 2 — Upload project to VPS

### Option A — Git

```bash
ssh root@YOUR_VPS_IP
sudo mkdir -p /var/www/carriya
sudo chown -R $USER:$USER /var/www/carriya
cd /var/www/carriya
git clone YOUR_REPO_URL .
```

### Option B — ZIP from your PC

On Windows (PowerShell), in project root:

```powershell
.\deploy\pack-for-vps.ps1
```

Upload `carriya-deploy.zip` via Hostinger File Manager or SFTP to `/var/www/carriya`, then on VPS:

```bash
sudo mkdir -p /var/www/carriya
cd /var/www/carriya
unzip carriya-deploy.zip
```

---

## Step 3 — Production `.env` on the server

Copy your local `backend/.env` to the VPS, then **edit these lines only**:

```env
FRONTEND_URL=https://carryia.com,https://www.carryia.com
NODE_ENV=production
COOKIE_SAME_SITE=lax
PORT=4000
```

Keep your existing `MONGODB_URI`, `JWT_SECRET`, Cloudinary, SMTP, and admin vars as-is.

Optional — if you use Google Sign-In, add (same ID in frontend):

```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

On VPS:

```bash
nano /var/www/carriya/backend/.env
```

---

## Step 4 — Frontend production env

File: `frontend/.env.production` (already in repo):

```env
REACT_APP_API_BASE_URL=
REACT_APP_API_VERSION=1.0.0
REACT_APP_CLIENT_VERSION=1.0.0
REACT_APP_GOOGLE_CLIENT_ID=   # only if you use Google login
```

Empty `REACT_APP_API_BASE_URL` = API calls go to `https://carryia.com/api/...`

---

## Step 5 — Install & build on VPS

```bash
cd /var/www/carriya

# Node.js 20 + tools (first time only)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git unzip
sudo npm install -g pm2

# Dependencies + build
npm run install:all
npm run deploy:build

# Verify
ls frontend/build/index.html
curl -s http://127.0.0.1:4000/health   # after PM2 start below
```

---

## Step 6 — Start backend (PM2)

```bash
cd /var/www/carriya
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
# Run the sudo command PM2 prints
pm2 logs carriya-api
```

Expected log: `Backend listening on http://localhost:4000`

Test:

```bash
curl http://127.0.0.1:4000/health
# {"ok":true}
```

---

## Step 7 — Nginx

```bash
cd /var/www/carriya
sudo sed "s/YOUR_DOMAIN/carryia.com/g" deploy/nginx-carriya.conf | sudo tee /etc/nginx/sites-available/carriya
sudo ln -sf /etc/nginx/sites-available/carriya /etc/nginx/sites-enabled/carriya
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Open: `http://carryia.com` — you should see the site (HTTP only until SSL).

---

## Step 8 — Free SSL (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d carryia.com -d www.carryia.com
```

Follow prompts (email, agree to terms). Certbot enables HTTPS automatically.

Test:

- https://carryia.com
- https://carryia.com/health → `{"ok":true}`
- https://carryia.com/admin/login

---

## Step 9 — MongoDB Atlas network access

In MongoDB Atlas → **Network Access** → ensure your VPS IP is allowed (or `0.0.0.0/0` for any IP).

If the API fails with MongoDB errors: `pm2 logs carriya-api`

---

## Step 10 — Google OAuth (if used)

[Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth client:

**Authorized JavaScript origins:**

- `https://carryia.com`
- `https://www.carryia.com`

Add `GOOGLE_CLIENT_ID` to `backend/.env` and `REACT_APP_GOOGLE_CLIENT_ID` to `frontend/.env.production`, then:

```bash
npm run deploy:build
pm2 restart carriya-api
```

---

## Go-live checklist

- [ ] DNS A records → VPS IP
- [ ] `backend/.env` → `NODE_ENV=production`, `FRONTEND_URL=https://carryia.com,https://www.carryia.com`
- [ ] `npm run deploy:build` completed
- [ ] `pm2 status` → `carriya-api` online
- [ ] Nginx + SSL active
- [ ] https://carryia.com/health OK
- [ ] Admin login: https://carryia.com/admin/login (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`)
- [ ] Buyer signup + seller flow tested

---

## Update after code changes

```bash
cd /var/www/carriya
git pull
npm run install:all
npm run deploy:build
pm2 restart carriya-api
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 502 Bad Gateway | `pm2 restart carriya-api` · check `pm2 logs carriya-api` |
| Login fails | HTTPS required · check `FRONTEND_URL` matches exact origin |
| MongoDB error | Atlas IP whitelist · verify `MONGODB_URI` on server |
| Blank page / 404 on routes | Nginx `try_files` → see `deploy/nginx-carriya.conf` |
| CORS error | `FRONTEND_URL=https://carryia.com,https://www.carryia.com` |

Full reference: [HOSTINGER_DEPLOYMENT.md](../HOSTINGER_DEPLOYMENT.md)
