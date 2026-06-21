# Deploying Carriya Backend

1) Configure environment variables

Copy these values in your hosting dashboard or `.env`:

```
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-frontend-domain.com

MONGODB_URI=mongodb+srv://user:pass@cluster.example.mongodb.net/carriya
MONGODB_DB=carriya

JWT_SECRET=<a long random string>

# Optional WhatsApp Cloud API (fallback is console log if unset)
WHATSAPP_TOKEN=EAAG... # from Meta app
WHATSAPP_PHONE_ID=123456789012345
```

2) Build/run

- Node host (Render/Heroku/Vercel serverless functions): run `npm start`.
- Docker: see Dockerfile below.

3) Update frontend

Set the frontend API base (if using the provided services, your frontend calls relative `/api/...` when on same origin; otherwise configure proxy or replace `/api` with your deployed backend URL).

## Dockerfile

```
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
```

Notes
- Secure cookies require HTTPS and `app.set('trust proxy', 1)` is enabled. Set `FRONTEND_URL` to your deployed frontend origin.
- CORS is restricted to `FRONTEND_URL`. Update when your frontend URL changes.

