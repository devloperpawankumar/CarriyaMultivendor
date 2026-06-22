# Deploy Carriya from GitHub → Hostinger VPS

**Repo:** https://github.com/devloperpawankumar/CarriyaMultivendor.git  
**Branch:** `master`  
**Domain:** `carryia.com`  
**VPS:** `root@2.25.65.58`

One repo contains both `frontend/` and `backend/`.

---

## Overview

```
GitHub  →  git clone on VPS  →  build frontend  →  PM2 runs backend  →  Nginx  →  carryia.com
```

---

## STEP 1 — DNS (Hostinger hPanel)

1. Log in to [hPanel](https://hpanel.hostinger.com)
2. **Domains** → **carryia.com** → **DNS / DNS Zone**
3. Add or edit:

| Type | Name | Points to | TTL |
|------|------|-----------|-----|
| A | `@` | `2.25.65.58` | 3600 |
| A | `www` | `2.25.65.58` | 3600 |

4. Save and wait **5–30 minutes**

Check from your PC:

```powershell
ping carryia.com
```

---

## STEP 2 — Connect to VPS

Open **PowerShell** or **Terminal** on your PC:

```bash
ssh root@2.25.65.58
```

Enter your VPS password when prompted (only on your machine — never share it in chat).

---

## STEP 3 — Install base software (first time only)

Run on the VPS:

```bash
apt-get update
apt-get install -y curl git nginx unzip

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

npm install -g pm2

node -v    # should show v20.x
npm -v
```

---

## STEP 4 — Clone from GitHub

```bash
mkdir -p /var/www/carriya
cd /var/www/carriya
```

### If repo is **public**:

```bash
git clone --branch master https://github.com/devloperpawankumar/CarriyaMultivendor.git .
```

### If repo is **private**:

**Option A — Personal Access Token**

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Create token with `repo` scope
3. Clone:

```bash
git clone --branch master https://YOUR_GITHUB_USERNAME:YOUR_TOKEN@github.com/devloperpawankumar/CarriyaMultivendor.git .
```

**Option B — SSH key on VPS**

```bash
ssh-keygen -t ed25519 -C "vps-carryia" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Add the printed key in GitHub → **Settings** → **SSH keys**, then:

```bash
git clone --branch master git@github.com:devloperpawankumar/CarriyaMultivendor.git .
```

Verify:

```bash
ls frontend backend deploy
```

---

## STEP 5 — Create `backend/.env` on the server

`.env` is **not** on GitHub (secrets). Create it on the VPS:

```bash
nano /var/www/carriya/backend/.env
```

Paste your local `backend/.env` content, then **change these lines**:

```env
FRONTEND_URL=https://carryia.com,https://www.carryia.com
NODE_ENV=production
COOKIE_SAME_SITE=lax
PORT=4000
```

Keep your existing: `MONGODB_URI`, `JWT_SECRET`, Cloudinary, SMTP, admin credentials.

Save: `Ctrl+O` → Enter → `Ctrl+X`

---

## STEP 6 — Frontend production env

```bash
cp /var/www/carriya/frontend/.env.production.example /var/www/carriya/frontend/.env.production
nano /var/www/carriya/frontend/.env.production
```

Set:

```env
REACT_APP_API_BASE_URL=
REACT_APP_API_VERSION=1.0.0
REACT_APP_CLIENT_VERSION=1.0.0
```

Leave `REACT_APP_API_BASE_URL` **empty** (API on same domain).

---

## STEP 7 — Install dependencies & build

```bash
cd /var/www/carriya
npm run install:all
npm run deploy:build
```

Wait 2–5 minutes. Confirm:

```bash
ls frontend/build/index.html
```

---

## STEP 8 — Start backend with PM2

```bash
cd /var/www/carriya
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

Run the **sudo command** that `pm2 startup` prints (copy and paste it).

Test API:

```bash
curl http://127.0.0.1:4000/health
```

Expected: `{"ok":true}`

If error:

```bash
pm2 logs carriya-api
```

---

## STEP 9 — Configure Nginx

```bash
cd /var/www/carriya
sed "s/YOUR_DOMAIN/carryia.com/g" deploy/nginx-carriya.conf > /etc/nginx/sites-available/carriya
ln -sf /etc/nginx/sites-available/carriya /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Open in browser: **http://carryia.com** (HTTP for now).

---

## STEP 10 — Enable HTTPS (SSL)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d carryia.com -d www.carryia.com
```

- Enter email
- Agree to terms
- Choose redirect HTTP → HTTPS when asked

Test:

- https://carryia.com
- https://carryia.com/health
- https://carryia.com/admin/login

---

## STEP 11 — MongoDB Atlas

1. [MongoDB Atlas](https://cloud.mongodb.com) → your cluster
2. **Network Access** → **Add IP Address**
3. Add VPS IP: `2.25.65.58` (or `0.0.0.0/0` for any IP)

If API fails with MongoDB errors → check this first.

---

## STEP 12 — Verify everything

| Test | URL |
|------|-----|
| Homepage | https://carryia.com |
| API health | https://carryia.com/health |
| Admin | https://carryia.com/admin/login |
| Sign up | https://carryia.com/signup |

---

## One-command redeploy (after first setup)

After `backend/.env` exists and repo is cloned:

```bash
cd /var/www/carriya
chmod +x deploy/vps-deploy-from-github.sh
DOMAIN=carryia.com ./deploy/vps-deploy-from-github.sh
```

Or manually:

```bash
cd /var/www/carriya
git pull origin master
npm run install:all
npm run deploy:build
pm2 restart carriya-api
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `git clone` asks for password | Use GitHub token or SSH key (Step 4) |
| `502 Bad Gateway` | `pm2 restart carriya-api` · `pm2 logs carriya-api` |
| MongoDB connection failed | Atlas → Network Access → allow `2.25.65.58` |
| Login fails after deploy | Use HTTPS · check `FRONTEND_URL` in `.env` |
| Page refresh 404 | Nginx `try_files` — re-run Step 9 |
| `npm run build` fails | `pm2 logs` / check Node version is 20+ |

---

## Security reminders

- Never commit `backend/.env` to GitHub
- Change weak `ADMIN_PASSWORD` before go-live
- Rotate secrets if they were ever shared in chat

---

## Quick reference

```bash
ssh root@2.25.65.58
cd /var/www/carriya
git pull origin master
npm run deploy:build
pm2 restart carriya-api
pm2 logs carriya-api
```
