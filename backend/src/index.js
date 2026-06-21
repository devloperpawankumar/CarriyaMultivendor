import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';

import productsRouter from './routes/products.js';
import adminRouter from './routes/admin.js';
import paymentsRouter from './routes/payments.js';
import authRouter from './routes/auth.js';
import onboardingRouter from './routes/onboarding.js';
import ordersRouter from './routes/orders.js';
import cartRouter from './routes/cart.js';
import buyerRouter from './routes/buyer.js';
import sellerSettingsRouter from './routes/sellerSettings.js';
import reviewsRouter from './routes/reviews.js';
import reportsRouter from './routes/reports.js';
import dashboardRouter from './routes/dashboard.js';
import notificationsRouter from './routes/notifications.js';
import { connectMongo } from './db/mongoose.js';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errors.js';
import { apiRateLimit, authRateLimit } from './middleware/rateLimit.js';
import { sanitizeQuery } from './middleware/sanitize.js';
import { requestId, requestTiming } from './middleware/requestId.js';
import { apiHeaders } from './middleware/apiHeaders.js';
import { bootstrapAdmin } from './startup/bootstrapAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

const FRONTEND_URLS = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || FRONTEND_URLS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeQuery()); // Sanitize all query parameters

// Professional middleware (order matters)
app.use(requestId); // Add request ID to all requests
app.use(requestTiming); // Track response time
app.use(apiHeaders); // Add professional API headers

app.use('/api', apiRateLimit); // Apply general API rate limiting

// Serve uploaded files
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API routes
// Register reviews router BEFORE products router to avoid route conflicts
// (more specific routes like /products/:id/reviews should come before /products/:id)
app.use('/api', reviewsRouter);
app.use('/api', productsRouter);
app.use('/api', adminRouter);
app.use('/api', paymentsRouter);
app.use('/api', authRouter);
app.use('/api', onboardingRouter);
app.use('/api', ordersRouter);
app.use('/api', cartRouter);
app.use('/api', buyerRouter);
app.use('/api', sellerSettingsRouter);
app.use('/api', notificationsRouter);
app.use('/api', reportsRouter);
app.use('/api', dashboardRouter);

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Optional: serve React build from Express (set SERVE_FRONTEND=true)
// Recommended Hostinger setup uses Nginx for static files instead.
if (process.env.SERVE_FRONTEND === 'true') {
  const frontendBuild = path.join(__dirname, '..', '..', 'frontend', 'build');
  app.use(express.static(frontendBuild));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path === '/health'
    ) {
      return next();
    }
    res.sendFile(path.join(frontendBuild, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI;

connectMongo(MONGODB_URI)
  .then(async () => {
    // Create initial admin from env if needed (safe no-op when not configured)
    try {
      const r = await bootstrapAdmin();
      if (r?.created) {
        console.log('[Bootstrap] Admin user created from env');
      }
    } catch (e) {
      console.warn('[Bootstrap] Admin creation skipped:', e?.message || e);
    }
    app.listen(PORT, async () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
      
      // Start settlement cron job
      try {
        const { startSettlementCronJob } = await import('./jobs/settlementJob.js');
        startSettlementCronJob();
      } catch (error) {
        console.warn('Could not start settlement job:', error.message);
      }
    });
  })
  .catch((err) => {
    console.error('Failed to connect MongoDB:', err.message);
    process.exit(1);
  });


