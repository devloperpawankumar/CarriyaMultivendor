# Deploy Carriya on Hostinger

Complete guide to deploy the **Carriya** marketplace (React frontend + Node.js/Express backend + MongoDB) on [Hostinger](https://www.hostinger.com).

---

## What you need before starting

| Requirement | Why |
|-------------|-----|
| **Hostinger VPS** (recommended: KVM 1 or higher) | Shared hosting cannot run Node.js + MongoDB reliably |
| **Domain on Hostinger** | e.g. `yourdomain.com` |
| **MongoDB Atlas** (free tier works) | Hostinger does not provide MongoDB |
| **Cloudinary account** | Product & seller image uploads |
| **Google Cloud OAuth client** | “Sign in with Google” |
| **Hostinger email or SMTP** | OTP / verification emails |

> **Important:** This app is a full-stack Node.js application. You need a **VPS** plan, not basic shared web hosting alone. If you only have shared hosting, see [Alternative: frontend-only on shared hosting](#alternative-frontend-only-on-shared-hosting) at the bottom.

---

## Architecture (recommended)

```
Browser  →  https://yourdomain.com
                │
                ▼
            Nginx (SSL, port 443/80)
                ├── /           → React build (static files)
                ├── /api/*      → Node.js backend (port 4000)
                ├── /uploads/*  → Node.js backend
                └── /health     → Node.js health check

Node.js (PM2)  →  MongoDB Atlas (cloud)
                →  Cloudinary (images)
                →  SMTP (email)
```

Everything runs on one VPS under one domain. Auth cookies use `SameSite=Lax` (same domain).

---

## Step 1 — MongoDB Atlas (database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free cluster.
2. **Database Access** → create a user with read/write password.
3. **Network Access** → add `0.0.0.0/0` (allow from anywhere) so your VPS can connect.
4. Copy the connection string:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/carriya?retryWrites=true&w=majority
   ```

---

## Step 2 — Hostinger VPS setup

### 2.1 Create VPS in hPanel

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. **VPS** → create or open your VPS (Ubuntu 22.04 recommended).
3. Note the **IP address** and set an **SSH password** or add your SSH key.

### 2.2 Point your domain to the VPS

In hPanel → **Domains** → your domain → **DNS**:

| Type | Name | Value |
|------|------|-------|
| A | `@` | Your VPS IP |
| A | `www` | Your VPS IP |

Wait 5–30 minutes for DNS to propagate.

### 2.3 Connect via SSH

```bash
ssh root@YOUR_VPS_IP
# or
ssh your_user@YOUR_VPS_IP
```

---

## Step 3 — Upload the project

### Option A — Git (recommended)

On the VPS:

```bash
sudo mkdir -p /var/www/carriya
sudo chown -R $USER:$USER /var/www/carriya
cd /var/www/carriya
git clone YOUR_GITHUB_REPO_URL .
```

### Option B — Upload ZIP via File Manager / SFTP

1. Zip the project on your PC (exclude `node_modules`).
2. Upload to `/var/www/carriya` via Hostinger File Manager or FileZilla.
3. Unzip on the server.

---

## Step 4 — Environment variables

### Backend (`backend/.env`)

```bash
cd /var/www/carriya
cp backend/.env.example backend/.env
nano backend/.env
```

Fill in at minimum:

```env
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
MONGODB_DB=carriya
JWT_SECRET=your_long_random_secret_min_32_chars
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
COOKIE_SAME_SITE=lax

ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourStrongAdminPassword123!

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=hello@yourdomain.com
SMTP_PASS=your_email_password
SMTP_FROM_NAME=Carriya
SMTP_FROM_ADDRESS=hello@yourdomain.com
```

### Frontend (`frontend/.env.production`)

```bash
cp frontend/.env.production.example frontend/.env.production
nano frontend/.env.production
```

For same-domain deployment (recommended):

```env
REACT_APP_API_BASE_URL=
REACT_APP_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

Leave `REACT_APP_API_BASE_URL` **empty** so the browser calls `/api` on the same domain.

---

## Step 5 — Install & build on the server

```bash
cd /var/www/carriya

# Install Node.js 20 (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git

# Install PM2 globally
sudo npm install -g pm2

# Install dependencies
npm run install:all

# Build React for production
npm run deploy:build
```

Verify build output exists:

```bash
ls frontend/build/index.html
```

---

## Step 6 — Start the backend with PM2

```bash
cd /var/www/carriya
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
# Run the command PM2 prints (sudo env PATH=...)
```

Check API locally:

```bash
curl http://127.0.0.1:4000/health
# Expected: {"ok":true}
```

View logs:

```bash
pm2 logs carriya-api
```

---

## Step 7 — Configure Nginx

```bash
cd /var/www/carriya
sudo sed "s/YOUR_DOMAIN/yourdomain.com/g" deploy/nginx-carriya.conf | sudo tee /etc/nginx/sites-available/carriya
sudo ln -sf /etc/nginx/sites-available/carriya /etc/nginx/sites-enabled/carriya
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Test in browser: `http://yourdomain.com` (HTTP only for now).

---

## Step 8 — Enable HTTPS (free SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will:
- Issue a Let’s Encrypt certificate
- Update Nginx for HTTPS
- Set up auto-renewal

Test: `https://yourdomain.com/health` → `{"ok":true}`

---

## Step 9 — Google OAuth (production)

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Edit your OAuth 2.0 Client ID.
2. **Authorized JavaScript origins:**
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
3. Use the same Client ID in both `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env.production` (`REACT_APP_GOOGLE_CLIENT_ID`).

After changing frontend env, rebuild:

```bash
npm run deploy:build
```

---

## Step 10 — Verify the live site

| Check | URL / action |
|-------|----------------|
| Health | `https://yourdomain.com/health` |
| Homepage | `https://yourdomain.com` |
| Admin login | `https://yourdomain.com/admin/login` |
| Sign up / login | Test buyer & seller flows |
| Image upload | Add a product as seller |

First boot creates the admin user if `ADMIN_EMAIL` + `ADMIN_PASSWORD` are set and no admin exists.

---

## Updating after code changes

```bash
cd /var/www/carriya
git pull origin main          # or upload new files
npm run install:all             # if dependencies changed
npm run deploy:build            # if frontend changed
pm2 restart carriya-api         # if backend changed
```

---

## Automated first-time setup (optional)

If the repo is already cloned on the VPS:

```bash
chmod +x deploy/hostinger-setup.sh
DOMAIN=yourdomain.com REPO_URL= REPO_URL= ./deploy/hostinger-setup.sh
```

Edit `backend/.env` before running if you use this script.

---

## Troubleshooting

### Site shows “502 Bad Gateway”

- Backend not running: `pm2 status` → start with `pm2 start deploy/ecosystem.config.cjs`
- Check logs: `pm2 logs carriya-api`
- MongoDB connection failed → verify `MONGODB_URI` and Atlas IP whitelist

### Login works locally but not on production

- Ensure `FRONTEND_URL` includes your exact HTTPS origin(s).
- For same domain: `COOKIE_SAME_SITE=lax` and `REACT_APP_API_BASE_URL=` (empty).
- Site must be **HTTPS** in production (Secure cookies).

### React routes 404 (e.g. `/admin/login`)

- Nginx must have `try_files $uri $uri/ /index.html;` in the `/` location block.

### CORS errors

- Add your full origin to `FRONTEND_URL` (comma-separated, no trailing slash):
  `https://yourdomain.com,https://www.yourdomain.com`

### Images not uploading

- Verify Cloudinary env vars in `backend/.env`.
- Check `client_max_body_size 20M` in Nginx config.

### Email OTP not sending

- Use Hostinger SMTP: `smtp.hostinger.com`, port `465`, full email as user.
- Or use Gmail with an [App Password](https://support.google.com/accounts/answer/185833).

---

## Environment variable reference

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Default `4000` |
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Long random string |
| `FRONTEND_URL` | Yes | Comma-separated allowed origins |
| `COOKIE_SAME_SITE` | No | `lax` (same domain) or `none` (cross-subdomain) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Recommended | Bootstrap admin account |
| `GOOGLE_CLIENT_ID` | If using Google login | |
| `CLOUDINARY_*` | Yes | Image uploads |
| `SMTP_*` | Recommended | Email verification |

### Frontend (`.env.production`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_BASE_URL` | No | Empty for same domain; or `https://api.yourdomain.com` |
| `REACT_APP_GOOGLE_CLIENT_ID` | If using Google login | |

---

## Alternative: frontend-only on shared hosting

If you only have **Hostinger shared web hosting** (no VPS):

1. Deploy the **backend + MongoDB Atlas** on a Node-friendly host (Render, Railway, Fly.io, or a VPS).
2. Build the frontend locally:
   ```bash
   cd frontend
   cp .env.production.example .env.production
   # Set REACT_APP_API_BASE_URL=https://api.yourdomain.com
   npm run build
   ```
3. Upload contents of `frontend/build/` to `public_html/` in hPanel.
4. Upload `deploy/public_html.htaccess` as `public_html/.htaccess` (SPA routing).
5. Set backend `FRONTEND_URL=https://yourdomain.com` and `COOKIE_SAME_SITE=none`.

This split setup is more complex for cookies/auth; **VPS + single domain is strongly recommended**.

---

## Project structure (deployment-related)

```
Carriya project/
├── frontend/              # React app (CRA)
│   ├── .env.production    # Production frontend env (create from example)
│   └── build/             # Output after npm run build
├── backend/               # Express API
│   ├── .env               # Production secrets (never commit)
│   └── src/index.js       # API server
├── deploy/
│   ├── nginx-carriya.conf # Nginx reverse proxy
│   ├── ecosystem.config.cjs # PM2 process config
│   ├── hostinger-setup.sh # Automated VPS setup
│   └── public_html.htaccess # Shared hosting SPA fallback
└── HOSTINGER_DEPLOYMENT.md  # This file
```

---

## Quick command cheat sheet

```bash
# Build frontend
npm run deploy:build

# Restart API
pm2 restart carriya-api

# View API logs
pm2 logs carriya-api

# Test health
curl https://yourdomain.com/health

# Reload Nginx after config change
sudo nginx -t && sudo systemctl reload nginx

# Renew SSL (usually automatic)
sudo certbot renew --dry-run
```

---

## Support checklist for go-live

- [ ] VPS running Ubuntu with Node 20+
- [ ] Domain A records point to VPS IP
- [ ] MongoDB Atlas cluster + user + network access
- [ ] `backend/.env` configured
- [ ] `frontend/.env.production` configured
- [ ] `npm run deploy:build` completed
- [ ] PM2 running `carriya-api`
- [ ] Nginx configured and SSL active
- [ ] Google OAuth origins updated
- [ ] Admin login tested
- [ ] Buyer signup / seller onboarding tested

---

**Note:** Deployment requires SSH access to your Hostinger VPS and your production secrets (MongoDB, JWT, Cloudinary, SMTP). Keep `backend/.env` private and never commit it to Git.
