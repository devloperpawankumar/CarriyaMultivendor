# Carriya VPS Master Guide

**The one file you need** for running, updating, and fixing your live site on Hostinger VPS.

| Item | Your value |
|------|------------|
| **Domain** | `carryia.com` |
| **VPS** | `root@2.25.65.58` |
| **App folder on server** | `/var/www/carriya` |
| **GitHub repo** | `https://github.com/devloperpawankumar/CarriyaMultivendor.git` |
| **Branch** | `master` |
| **Backend process (PM2)** | `carriya-api` (port `4000`) |
| **Frontend** | React build in `frontend/build/` (served by Nginx) |

---

## How the live site works

```
Your PC (edit code)
    ↓  git push
GitHub (master branch)
    ↓  git pull on VPS
/var/www/carriya
    ├── frontend/build/   → Nginx serves pages (HTML, JS, CSS)
    └── backend/          → PM2 runs Node.js API on port 4000
            ↓
        Nginx proxies /api/* and /health to the backend
            ↓
        https://carryia.com
```

- **Frontend changes** = rebuild React (`npm run deploy:build`). Nginx picks up new files automatically.
- **Backend changes** = restart PM2 (`pm2 restart carriya-api`). No frontend rebuild needed unless you also changed the frontend.
- **Secrets** (`backend/.env`) live **only on the VPS** — never commit them to GitHub.

---

## 1. Connect to your VPS

From **PowerShell** or **Terminal** on your PC:

```bash
ssh root@2.25.65.58
```

Enter your VPS password. You are now inside the server.

Always go to the app folder first:

```bash
cd /var/www/carriya
```

---

## 2. Start the server (first time or after reboot)

### First-time setup (already done once)

If the server was set up using `deploy/GITHUB-DEPLOY-STEPS.md`, you only need the **daily start** commands below.

### Start / ensure everything is running

```bash
cd /var/www/carriya

# 1) Backend API
pm2 start deploy/ecosystem.config.cjs    # first time only
pm2 restart carriya-api                    # if already set up before
pm2 save

# 2) Nginx (serves website + proxies API)
sudo systemctl start nginx
sudo systemctl enable nginx

# 3) Check
pm2 status
curl http://127.0.0.1:4000/health
```

Expected health response: `{"ok":true}`

Open in browser:

- https://carryia.com
- https://carryia.com/health

### Stop the server

```bash
pm2 stop carriya-api          # stop API only
sudo systemctl stop nginx     # stop website (rarely needed)
```

### Restart after VPS reboot

PM2 usually auto-starts if you ran `pm2 save` and `pm2 startup` during setup:

```bash
pm2 status
sudo systemctl status nginx
```

If `carriya-api` is missing:

```bash
cd /var/www/carriya
pm2 start deploy/ecosystem.config.cjs
pm2 save
```

---

## 3. Most important VPS commands (cheat sheet)

Copy this block. Use it every day.

```bash
# --- Connect ---
ssh root@2.25.65.58
cd /var/www/carriya

# --- See if site is running ---
pm2 status
pm2 logs carriya-api --lines 50
curl http://127.0.0.1:4000/health
sudo systemctl status nginx

# --- Full update (frontend + backend) ---
git pull origin master
npm run install:all
npm run deploy:build
pm2 restart carriya-api

# --- Frontend only update ---
git pull origin master
npm run deploy:build

# --- Backend only update ---
git pull origin master
npm run install:all --prefix backend    # only if package.json changed
pm2 restart carriya-api

# --- One-command deploy script ---
chmod +x deploy/vps-deploy-from-github.sh
DOMAIN=carryia.com ./deploy/vps-deploy-from-github.sh

# --- Edit secrets on server (never in GitHub) ---
nano backend/.env
pm2 restart carriya-api

# --- Nginx ---
sudo nginx -t
sudo systemctl reload nginx

# --- Disk / memory ---
df -h
free -h
```

### PM2 commands

| Command | What it does |
|---------|----------------|
| `pm2 status` | List running apps |
| `pm2 logs carriya-api` | Live backend logs (Ctrl+C to exit) |
| `pm2 logs carriya-api --lines 100` | Last 100 log lines |
| `pm2 restart carriya-api` | Restart API after code or `.env` change |
| `pm2 stop carriya-api` | Stop API |
| `pm2 monit` | CPU / memory monitor |

### Nginx commands

| Command | What it does |
|---------|----------------|
| `sudo nginx -t` | Test config (run before reload) |
| `sudo systemctl reload nginx` | Apply config without downtime |
| `sudo systemctl restart nginx` | Full Nginx restart |
| `sudo tail -f /var/log/nginx/error.log` | Nginx error log |

### Git commands (on VPS)

| Command | What it does |
|---------|----------------|
| `git status` | See local changes on server |
| `git log --oneline -10` | Last 10 commits |
| `git pull origin master` | Download latest code from GitHub |
| `git fetch origin` | Download without merging |

### File editing on VPS

```bash
nano backend/.env                    # backend secrets
nano frontend/.env.production        # frontend build-time vars
```

Save in nano: `Ctrl+O` → Enter → `Ctrl+X`

---

## 4. Normal workflow: change code locally → go live

### On your PC (every time you change code)

```bash
# 1) Edit files in frontend/ or backend/
# 2) Test locally if possible
# 3) Commit and push to GitHub

git add .
git commit -m "Describe your change"
git push origin master
```

### On the VPS (deploy what you pushed)

**Option A — recommended (one script):**

```bash
cd /var/www/carriya
DOMAIN=carryia.com ./deploy/vps-deploy-from-github.sh
```

**Option B — manual (same result):**

```bash
cd /var/www/carriya
git pull origin master
npm run install:all
npm run deploy:build
pm2 restart carriya-api
```

### Verify after deploy

```bash
pm2 status
curl http://127.0.0.1:4000/health
pm2 logs carriya-api --lines 30
```

In browser: hard refresh `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) so you do not see an old cached frontend.

---

## 5. Update frontend only (UI, pages, React components)

Use this when you changed **only** files under `frontend/` (no backend logic, no new npm packages in backend).

### Steps

**On PC:**

1. Edit files in `frontend/src/...`
2. Test: `cd frontend && npm start`
3. Push to GitHub:

```bash
git add frontend/
git commit -m "Update frontend: describe change"
git push origin master
```

**On VPS:**

```bash
cd /var/www/carriya
git pull origin master
npm run deploy:build
```

That is all. **No `pm2 restart` needed** for pure UI changes.

### If you changed `frontend/.env.production` (e.g. Google client ID)

Edit on VPS (or push the file, then on VPS):

```bash
nano frontend/.env.production
npm run deploy:build
```

`REACT_APP_*` values are baked in at **build time**. You must rebuild after changing them.

### Frontend env reminder

```env
REACT_APP_API_BASE_URL=          # leave empty — API is same domain
REACT_APP_API_VERSION=1.0.0
REACT_APP_CLIENT_VERSION=1.0.0
```

---

## 6. Update backend only (API, routes, models, jobs)

Use this when you changed **only** files under `backend/`.

### Steps

**On PC:**

1. Edit files in `backend/src/...`
2. Test locally if possible
3. Push:

```bash
git add backend/
git commit -m "Update backend: describe change"
git push origin master
```

**On VPS:**

```bash
cd /var/www/carriya
git pull origin master
```

If `backend/package.json` changed (new npm package):

```bash
npm install --prefix backend
```

Restart API:

```bash
pm2 restart carriya-api
pm2 logs carriya-api --lines 30
```

**No `npm run deploy:build` needed** for backend-only changes.

### If you changed `backend/.env` only (no code push)

```bash
nano /var/www/carriya/backend/.env
pm2 restart carriya-api
```

Production values that must stay correct:

```env
FRONTEND_URL=https://carryia.com,https://www.carryia.com
NODE_ENV=production
COOKIE_SAME_SITE=lax
PORT=4000
```

---

## 7. Update both frontend and backend

When you changed files in **both** folders:

**On PC:** push everything to `master`.

**On VPS:**

```bash
cd /var/www/carriya
git pull origin master
npm run install:all
npm run deploy:build
pm2 restart carriya-api
```

Or use the deploy script:

```bash
DOMAIN=carryia.com ./deploy/vps-deploy-from-github.sh
```

---

## 8. Deploy without Git (ZIP upload)

If Git is not available, use the ZIP method from your PC.

**On PC (PowerShell):**

```powershell
cd "D:\New folder\Carriya project"
.\deploy\pack-for-vps.ps1
```

Upload `carriya-deploy.zip` to the VPS, then:

```bash
cd /var/www/carriya
unzip -o carriya-deploy.zip
npm run install:all
pm2 restart carriya-api
sudo systemctl reload nginx
```

> ZIP already includes a built `frontend/build`. Re-run `npm run deploy:build` on VPS if you need a fresh build from source.

---

## 9. Revert wrong code (rollback)

If you pushed bad code and the live site broke, **fix it on the VPS first** (fastest), then fix GitHub.

### Step 1 — See recent commits on VPS

```bash
cd /var/www/carriya
git log --oneline -15
```

Example output:

```
a1b2c3d Bad change - broke checkout
f4e5f6g Good version - working site
9h8i7j6 Older commit
```

### Step 2 — Roll back to last good commit

Replace `f4e5f6g` with the **good** commit hash from `git log`:

```bash
git reset --hard f4e5f6g
```

Rebuild and restart:

```bash
npm run install:all
npm run deploy:build
pm2 restart carriya-api
```

Check:

```bash
curl http://127.0.0.1:4000/health
pm2 logs carriya-api --lines 20
```

### Roll back only one commit (undo last deploy)

```bash
git reset --hard HEAD~1
npm run deploy:build
pm2 restart carriya-api
```

### Roll back after `git pull` broke the site (quick undo)

Git keeps the previous HEAD before pull:

```bash
git reset --hard ORIG_HEAD
npm run deploy:build
pm2 restart carriya-api
```

### Frontend-only rollback

If only frontend broke:

```bash
git reset --hard f4e5f6g    # good commit
npm run deploy:build
```

### Backend-only rollback

If only backend broke:

```bash
git reset --hard f4e5f6g
pm2 restart carriya-api
```

### Fix GitHub after rollback (so next `git pull` does not re-break)

On your **PC**, revert the bad commit properly:

```bash
git log --oneline -5
git revert a1b2c3d          # creates a new commit that undoes the bad one
git push origin master
```

Or, if you are sure and no one else uses the repo:

```bash
git reset --hard f4e5f6g
git push origin master --force   # dangerous — only if you understand the risk
```

> **Warning:** `git push --force` overwrites remote history. Prefer `git revert` for safety.

### Before risky deploys — bookmark a good version

```bash
cd /var/www/carriya
git log -1 --oneline          # note this hash before pulling
# or
git tag stable-2025-06-22     # tag current good state
```

Rollback later:

```bash
git reset --hard stable-2025-06-22
npm run deploy:build
pm2 restart carriya-api
```

---

## 10. Troubleshooting

| Problem | What to do |
|---------|------------|
| **502 Bad Gateway** | `pm2 restart carriya-api` then `pm2 logs carriya-api` |
| **Site blank / white page** | `ls frontend/build/index.html` — if missing: `npm run deploy:build` |
| **Old UI still showing** | Hard refresh browser (`Ctrl+Shift+R`) |
| **API not responding** | `pm2 status` · `curl http://127.0.0.1:4000/health` |
| **MongoDB connection error** | MongoDB Atlas → Network Access → allow VPS IP `2.25.65.58` |
| **Login / cookies fail** | Must use HTTPS · check `FRONTEND_URL` in `backend/.env` |
| **404 on page refresh** | `sudo nginx -t` · reload Nginx · check `deploy/nginx-carriya.conf` |
| **`npm run build` fails** | `node -v` (need v20+) · read error · `npm run install:all` |
| **Out of disk space** | `df -h` · remove old logs: `pm2 flush` |
| **`git pull` conflicts** | `git stash` or `git reset --hard origin/master` (loses local VPS edits) |

### Read backend errors

```bash
pm2 logs carriya-api
pm2 logs carriya-api --err --lines 100
```

### Read Nginx errors

```bash
sudo tail -50 /var/log/nginx/error.log
```

### Restart everything (last resort)

```bash
cd /var/www/carriya
pm2 restart carriya-api
sudo systemctl restart nginx
```

---

## 11. Quick decision tree

```
Did you change code?
├── Only frontend/     → git pull → npm run deploy:build
├── Only backend/      → git pull → pm2 restart carriya-api
├── Both               → git pull → npm run install:all → npm run deploy:build → pm2 restart
└── Only backend/.env  → nano backend/.env → pm2 restart (no git pull)

Site broke after deploy?
└── git log → git reset --hard <good-commit> → rebuild/restart → fix GitHub with git revert

Server rebooted?
└── pm2 status → if down: pm2 start deploy/ecosystem.config.cjs → pm2 save
```

---

## 12. Security reminders

- Never commit `backend/.env` to GitHub.
- Never share VPS password or API keys in chat.
- Rotate secrets if they were ever exposed.
- Use HTTPS only in production (`https://carryia.com`).
- Change default `ADMIN_PASSWORD` before go-live.

---

## 13. Related docs

| File | Purpose |
|------|---------|
| `deploy/GITHUB-DEPLOY-STEPS.md` | First-time install from GitHub |
| `deploy/DEPLOY-CARRYIA.md` | Personalized first deploy checklist |
| `deploy/vps-deploy-from-github.sh` | Automated pull + build + restart |
| `HOSTINGER_DEPLOYMENT.md` | Full Hostinger reference |

---

## 14. Copy-paste: daily deploy (most used)

```bash
ssh root@2.25.65.58
cd /var/www/carriya
git pull origin master
npm run install:all
npm run deploy:build
pm2 restart carriya-api
pm2 logs carriya-api --lines 20
```

Done. Open https://carryia.com and hard-refresh.
