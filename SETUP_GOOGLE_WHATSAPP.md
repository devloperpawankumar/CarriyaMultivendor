# Google Authentication & WhatsApp Setup Guide

## 🔵 Google Authentication Setup

### What You Need:
1. **Google Cloud Account** (free tier is fine)
2. **Google Cloud Console access**
3. **Your domain/website URL** (for authorized domains)

### Step-by-Step:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
   
2. **Create a New Project**:
   - Click "Select a project" → "New Project"
   - Name it "Carriya" (or your app name)
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (unless you have G Suite)
   - Fill in app info:
     - App name: Carriya
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Add scopes:
     - `email`
     - `profile`
   - Add test users (your own email) for testing
   - Submit for review (or leave as testing if not production)

5. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Name: "Carriya Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Click "Create"

6. **Copy Your Credentials**:
   - You'll see a popup with your **Client ID**
   - Copy this Client ID

7. **Add to Environment Variables**:

   **Backend** (`backend/.env`):
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

   **Frontend** (`frontend/.env`):
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

8. **Restart Your Servers**:
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend
   cd frontend
   npm start
   ```

9. **Test It**:
   - Go to http://localhost:3000/login
   - Click "Sign in with Google"
   - You should see Google's sign-in popup
   - After signing in, you're logged in! ✅

---

## 🟢 WhatsApp Setup (Meta Business)

### What You Need:
1. **Meta Developer Account** (free)
2. **Meta Business Account** (free)
3. **A phone number** to receive WhatsApp Business messages
4. **Verification** (can take 1-2 days)

### Step-by-Step:

1. **Go to Meta for Developers**: https://developers.facebook.com/
   
2. **Create a Developer Account**:
   - Click "Get Started"
   - Log in with your Facebook account
   - Complete the account setup

3. **Create a Meta App**:
   - Go to "My Apps" → "Create App"
   - Select "Business" type
   - Name it "Carriya" (or your app name)
   - Enter contact email
   - Click "Create App"

4. **Add WhatsApp Product**:
   - In your app dashboard, find "WhatsApp" product
   - Click "Set up"
   - Select "Get started"
   - You'll see "API Setup" instructions

5. **Get Your Credentials**:
   - **Phone Number ID**: Found on the API Setup page
     - Look for "From" field → that's your Phone Number ID
   - **WhatsApp Business Account ID**: Also on same page
   - **Temporary Access Token**: 
     - Click "Generate access token" button
     - Copy this token (valid for 24-72 hours)
     - **For production**: You need a permanent token (see step 6)

6. **Create Permanent Token** (Important for Production):
   - Go to "WhatsApp" → "API Setup"
   - Scroll to "Create a system user token"
   - Or go to Business Settings → System Users → Add System User
   - Assign WhatsApp permissions to system user
   - Generate permanent token from system user

7. **Add to Environment Variables**:

   **Backend** (`backend/.env`):
   ```env
   WHATSAPP_TOKEN=EAAB... (your permanent access token)
   WHATSAPP_PHONE_ID=123456789012345 (your phone number ID)
   ```

8. **Restart Your Backend**:
   ```bash
   cd backend
   npm run dev
   ```

9. **Test It**:
   - Try the buyer signup flow
   - After email verification, phone verification will trigger
   - You should receive a WhatsApp message with the OTP
   - If not configured, check backend console for the OTP code

---

## 🆘 Troubleshooting

### Google Authentication Not Working?

**Error: "Google Sign-In not configured"**
- ✅ Check `frontend/.env` has `REACT_APP_GOOGLE_CLIENT_ID`
- ✅ Restart frontend server after adding `.env`
- ✅ Make sure `.env` file is in `frontend/` directory

**Error: "Invalid origin"**
- ✅ Check Google Cloud Console → Credentials
- ✅ Add your actual domain to "Authorized JavaScript origins"
- ✅ For localhost: use `http://localhost:3000` (with http://)

**Error: "OAuth consent screen issues"**
- ✅ Add yourself as a test user in Google Cloud Console
- ✅ Publish the app (or keep it in testing mode with test users)

### WhatsApp Not Sending Messages?

**OTP appears in console but not sent**
- ✅ Check `WHATSAPP_TOKEN` is set in backend `.env`
- ✅ Check `WHATSAPP_PHONE_ID` is set in backend `.env`
- ✅ Restart backend after adding credentials

**Error: "WhatsApp send failed: 401"**
- ✅ Your access token expired (get a new one)
- ✅ Token is invalid (regenerate)

**Error: "WhatsApp send failed: 403"**
- ✅ WhatsApp business account not approved
- ✅ Missing permissions on token
- ✅ Phone number not verified by Meta

**Rate Limits**:
- ✅ Meta has rate limits (1000 messages/day for free tier)
- ✅ After 1000 messages, you need to upgrade to paid plan
- ✅ ~$0.0014 per message on paid plan

---

## 📋 Quick Checklist

### Google Setup:
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 Client ID
- [ ] Added `GOOGLE_CLIENT_ID` to `backend/.env`
- [ ] Added `REACT_APP_GOOGLE_CLIENT_ID` to `frontend/.env`
- [ ] Restarted both servers
- [ ] Tested Google sign-in

### WhatsApp Setup:
- [ ] Created Meta developer account
- [ ] Created Meta app with WhatsApp product
- [ ] Got Phone Number ID
- [ ] Created permanent access token (system user)
- [ ] Added `WHATSAPP_TOKEN` to `backend/.env`
- [ ] Added `WHATSAPP_PHONE_ID` to `backend/.env`
- [ ] Restarted backend server
- [ ] Tested WhatsApp OTP delivery

---

## 💰 Cost Information

### Google Authentication:
- ✅ **FREE** - No cost for Google Sign-In
- ✅ Unlimited sign-ins
- ✅ No quotas

### WhatsApp Cloud API:
- ✅ **FREE** for first 1,000 conversations/month
- 💰 **~$0.0014 per message** after that
- 💰 Paid plan required after 1,000 conversations
- ✅ Development: Can use console logging (FREE)

---

## 🎯 Current Status

✅ **Code is ready** - All authentication flows are implemented
⏳ **Needs configuration** - You just need to add credentials
🚀 **Working in dev** - Console logging works without setup

---

## 📝 Example .env Files

### `backend/.env`:
```env
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/carriya
MONGODB_DB=carriya

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Auth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# WhatsApp (Optional - falls back to console if not set)
WHATSAPP_TOKEN=EAABsbCS1iHgBA123456789...
WHATSAPP_PHONE_ID=123456789012345
```

### `frontend/.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:4000
REACT_APP_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

---

Need help? Check the main README files:
- `backend/README.md`
- `frontend/README.md`
- `BUYER_PHONE_VERIFICATION_SETUP.md`

