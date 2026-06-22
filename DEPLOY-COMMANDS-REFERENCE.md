# Carriya — Deploy Commands & VPS Structure Reference

Quick reference for **what lives where on your VPS**, **which commands to run**, and **when to deploy frontend, backend, or both**.

> For full setup, rollback, and troubleshooting see [`VPS-MASTER-GUIDE.md`](VPS-MASTER-GUIDE.md).

---

## Your live setup at a glance

| Item | Value |
|------|-------|
| **Domain** | `carryia.com` / `www.carryia.com` |
| **VPS IP** | `2.25.65.58` |
| **SSH login** | `ssh root@2.25.65.58` |
| **App root on VPS** | `/var/www/carriya` |
| **GitHub repo** | `https://github.com/devloperpawankumar/CarriyaMultivendor.git` |
| **Branch** | `master` |
| **Backend port** | `4000` (internal, not public) |
| **PM2 app name** | `carriya-api` |

---

## How traffic reaches your app

```
Internet (browser)
       │
       ▼
https://carryia.com  (port 443 — HTTPS, SSL by Certbot)
       │
       ▼
Nginx  (/etc/nginx/sites-enabled/carriya)
       │
       ├── /  /admin  /signup  etc.
       │        →  /var/www/carriya/frontend/build/   (static React files)
       │
       ├── /api/*
       │        →  Node.js backend on 127.0.0.1:4000  (PM2: carriya-api)
       │
       ├── /uploads/*
       │        →  Node.js backend on 127.0.0.1:4000
       │
       └── /health
                →  Node.js backend on 127.0.0.1:4000
```

**Important:** Users never connect to port `4000` directly. Nginx is the public door; PM2 runs the API behind it.

---

## VPS folder structure — what is stored where

Everything for Carriya lives under **`/var/www/carriya`**:

```
/var/www/carriya/                          ← Main app folder (APP_DIR)
│
├── .git/                                  ← Git history (clone from GitHub)
├── package.json                           ← Root scripts (install:all, deploy:build)
│
├── frontend/                              ← React source code
│   ├── src/                               ← Your UI components, pages, styles
│   ├── public/
│   │   └── index.html                     ← Page title, meta tags
│   ├── build/                             ← ★ LIVE frontend (Nginx serves this)
│   │   ├── index.html
│   │   ├── static/js/...
│   │   └── static/css/...
│   ├── .env.production                    ← Frontend build-time vars (on VPS only)
│   └── package.json
│
├── backend/                               ← Node.js API
│   ├── src/
│   │   └── index.js                       ← ★ Entry point PM2 runs
│   ├── .env                               ← ★ Secrets (NEVER on GitHub)
│   ├── uploads/                           ← Local file uploads (if used)
│   └── package.json
│
└── deploy/                                ← Deploy helpers on server
    ├── ecosystem.config.cjs               ← PM2 config (starts carriya-api)
    ├── nginx-carriya.conf                 ← Nginx template (domain = carryia.com)
    └── vps-deploy-from-github.sh          ← One-command deploy script
```

### Other important paths on the VPS (outside `/var/www/carriya`)

| Path | What it is |
|------|------------|
| `/etc/nginx/sites-available/carriya` | Nginx site config (generated from `deploy/nginx-carriya.conf`) |
| `/etc/nginx/sites-enabled/carriya` | Symlink — active Nginx config |
| `/var/log/nginx/access.log` | Nginx access log |
| `/var/log/nginx/error.log` | Nginx errors (502, etc.) |
| `~/.pm2/logs/carriya-api-out.log` | Backend stdout logs |
| `~/.pm2/logs/carriya-api-error.log` | Backend error logs |

### What Nginx uses from your app folder

| Nginx setting | Points to |
|---------------|-----------|
| `root` | `/var/www/carriya/frontend/build` |
| `proxy_pass /api/` | `http://127.0.0.1:4000` (PM2 backend) |
| `proxy_pass /health` | `http://127.0.0.1:4000` |

### What PM2 runs

| Setting | Value |
|---------|-------|
| App name | `carriya-api` |
| Working directory | `/var/www/carriya/backend` |
| Script | `src/index.js` |
| Port | `4000` |
| Config file | `/var/www/carriya/deploy/ecosystem.config.cjs` |

### Secret / env files (VPS only — not in GitHub)

| File | Used when |
|------|-----------|
| `/var/www/carriya/backend/.env` | Backend starts / restarts (MongoDB, JWT, SMTP, etc.) |
| `/var/www/carriya/frontend/.env.production` | Frontend **build** (`npm run deploy:build`) |

---

## When to deploy what — decision guide

```
Did you change anything?
│
├─ Only frontend/ files (UI, pages, CSS, index.html, React components)
│     → Deploy FRONTEND ONLY
│
├─ Only backend/ files (API routes, models, controllers, jobs)
│     → Deploy BACKEND ONLY
│
├─ Both frontend/ and backend/
│     → Deploy BOTH TOGETHER
│
├─ Only backend/.env (secrets, URLs, keys)
│     → Edit on VPS + pm2 restart (no git pull)
│
├─ Only frontend/.env.production (REACT_APP_*)
│     → Edit on VPS + npm run deploy:build (no pm2 restart)
│
└─ package.json changed (new npm package)
      → npm install in that folder, then build and/or restart
```

### Examples — frontend only

- Change button text, colors, layout
- Edit `frontend/src/components/Hero.tsx`
- Change page title in `frontend/public/index.html`
- Add a new React page

### Examples — backend only

- Fix API route in `backend/src/routes/`
- Change order logic in `backend/src/controllers/`
- Update email template in backend
- Fix MongoDB query in a model

### Examples — deploy both together

- New feature needs UI + API (e.g. new checkout step + new endpoint)
- Login flow change (frontend form + backend auth)
- You changed files in **both** `frontend/` and `backend/` in the same push
- New npm packages in **both** `package.json` files

### Examples — no git pull needed

- Rotate `JWT_SECRET` in `backend/.env` → `pm2 restart carriya-api`
- Change `REACT_APP_GOOGLE_CLIENT_ID` in `frontend/.env.production` → `npm run deploy:build`

---

## Deploy commands — copy & paste

### Always start here (connect to VPS)

```bash
ssh root@2.25.65.58
cd /var/www/carriya
```

---

### A) Frontend only deploy

**On your PC first:**

```powershell
cd "D:\New folder\Carriya project"
git add frontend/
git commit -m "Your frontend change description"
git push origin master
```

**On VPS:**

```bash
cd /var/www/carriya
git pull origin master
npm run deploy:build
```

No `pm2 restart` needed.

**Verify:** Open https://carryia.com → hard refresh `Ctrl+Shift+R` → check browser tab / UI.

---

### B) Backend only deploy

**On your PC first:**

```powershell
cd "D:\New folder\Carriya project"
git add backend/
git commit -m "Your backend change description"
git push origin master
```

**On VPS:**

```bash
cd /var/www/carriya
git pull origin master
```

If `backend/package.json` changed (new dependency):

```bash
npm install --prefix backend
```

Then restart API:

```bash
pm2 restart carriya-api
pm2 logs carriya-api --lines 30
```

No `npm run deploy:build` needed.

**Verify:** `curl http://127.0.0.1:4000/health` → `{"ok":true}`

---

### C) Frontend + backend together (full deploy)

**On your PC first:**

```powershell
cd "D:\New folder\Carriya project"
git add .
git commit -m "Your full change description"
git push origin master
```

**On VPS:**

```bash
cd /var/www/carriya
git pull origin master
npm run install:all
npm run deploy:build
pm2 restart carriya-api
```

**Verify:**

```bash
pm2 status
curl http://127.0.0.1:4000/health
```

Then open https://carryia.com and hard refresh.

---

### D) One-command full deploy (script)

After code is pushed to GitHub:

```bash
cd /var/www/carriya
chmod +x deploy/vps-deploy-from-github.sh
DOMAIN=carryia.com ./deploy/vps-deploy-from-github.sh
```

This script does: `git pull` → `npm run install:all` → `npm run deploy:build` → `pm2 restart` → Nginx reload.

Use when you want a **full deploy** without typing each step.

---

### E) Only `.env` changes (no code push)

**Backend `.env`:**

```bash
nano /var/www/carriya/backend/.env
pm2 restart carriya-api
```

**Frontend `.env.production`:**

```bash
nano /var/www/carriya/frontend/.env.production
cd /var/www/carriya
npm run deploy:build
```

---

## PC vs VPS — who does what

| Step | Where | Command |
|------|--------|---------|
| Edit code | Your PC | Cursor / VS Code |
| Test locally | Your PC | `npm start` in `frontend/` or `backend/` |
| Save to GitHub | Your PC | `git add` → `git commit` → `git push origin master` |
| Download code | VPS | `git pull origin master` |
| Build frontend | VPS | `npm run deploy:build` |
| Run backend | VPS | PM2 (`carriya-api`) — auto via `pm2 restart` |
| Serve website | VPS | Nginx reads `frontend/build/` |

---

## npm scripts reference (run from `/var/www/carriya`)

| Command | What it does |
|---------|----------------|
| `npm run install:all` | Install backend + frontend `node_modules` |
| `npm run deploy:build` | Build React → output to `frontend/build/` |
| `npm install --prefix backend` | Backend deps only |
| `npm install --prefix frontend` | Frontend deps only |

---

## PM2 commands (backend)

```bash
pm2 status                      # Is carriya-api running?
pm2 restart carriya-api         # After backend code or .env change
pm2 logs carriya-api            # Live logs
pm2 logs carriya-api --lines 50 # Last 50 lines
pm2 stop carriya-api            # Stop API
pm2 start deploy/ecosystem.config.cjs   # First start
pm2 save                        # Save process list for reboot
```

---

## Nginx commands (website)

```bash
sudo nginx -t                   # Test config before reload
sudo systemctl reload nginx     # Apply changes
sudo systemctl status nginx     # Is Nginx running?
sudo tail -50 /var/log/nginx/error.log
```

---

## Quick comparison table

| Scenario | `git pull` | `npm install` | `deploy:build` | `pm2 restart` |
|----------|:----------:|:-------------:|:--------------:|:-------------:|
| Frontend only | ✅ | ❌ (unless frontend package.json changed) | ✅ | ❌ |
| Backend only | ✅ | ❌ (unless backend package.json changed) | ❌ | ✅ |
| Both | ✅ | ✅ `install:all` | ✅ | ✅ |
| `backend/.env` only | ❌ | ❌ | ❌ | ✅ |
| `frontend/.env.production` only | ❌ | ❌ | ✅ | ❌ |

---

## Production env files — what must stay correct

**`/var/www/carriya/backend/.env`** (key lines):

```env
FRONTEND_URL=https://carryia.com,https://www.carryia.com
NODE_ENV=production
COOKIE_SAME_SITE=lax
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
```

**`/var/www/carriya/frontend/.env.production`:**

```env
REACT_APP_API_BASE_URL=
REACT_APP_API_VERSION=1.0.0
REACT_APP_CLIENT_VERSION=1.0.0
```

Leave `REACT_APP_API_BASE_URL` **empty** so the API uses the same domain (`https://carryia.com/api/...`).

---

## First time on a new VPS? Folder setup

If `/var/www/carriya` does not exist yet:

```bash
sudo mkdir -p /var/www/carriya
sudo chown -R $USER:$USER /var/www/carriya
cd /var/www/carriya
git clone --branch master https://github.com/devloperpawankumar/CarriyaMultivendor.git .
```

Then create `backend/.env`, build, PM2, Nginx — see [`deploy/GITHUB-DEPLOY-STEPS.md`](deploy/GITHUB-DEPLOY-STEPS.md).

---

## Most used daily commands (summary)

```bash
# 1) Connect
ssh root@2.25.65.58
cd /var/www/carriya

# 2) Frontend only
git pull origin master && npm run deploy:build

# 3) Backend only
git pull origin master && pm2 restart carriya-api

# 4) Full deploy
git pull origin master && npm run install:all && npm run deploy:build && pm2 restart carriya-api

# 5) Check health
pm2 status && curl http://127.0.0.1:4000/health
```

---

## Related docs

| File | Use for |
|------|---------|
| [`VPS-MASTER-GUIDE.md`](VPS-MASTER-GUIDE.md) | Start/stop server, rollback, troubleshooting |
| [`deploy/GITHUB-DEPLOY-STEPS.md`](deploy/GITHUB-DEPLOY-STEPS.md) | First-time VPS install from GitHub |
| [`deploy/DEPLOY-CARRYIA.md`](deploy/DEPLOY-CARRYIA.md) | Go-live checklist |
| [`deploy/vps-deploy-from-github.sh`](deploy/vps-deploy-from-github.sh) | Automated deploy script |
