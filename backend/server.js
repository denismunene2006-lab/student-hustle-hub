// Sentry instrumentation must be the very first require so it can
// instrument all subsequently loaded modules (Express, routes, models).
require('./instrument');

const path = require('path');
const dotenv = require('dotenv');
// Load environment variables immediately, before other imports.
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const {
  sanitizeInput,
  generalLimiter,
} = require('./middleware/securityMiddleware');

// ============ Environment Validation ============
// Fail fast if critical environment variables are missing or weak.
const validateEnv = () => {
  const errors = [];

  if (!process.env.MONGO_URI && !process.env.MONGO_URL) {
    errors.push('MONGO_URI or MONGO_URL is required');
  }

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Google Sign-In requires a valid OAuth 2.0 Client ID. Without it the
  // /api/auth/google endpoint throws a 500 at runtime. Fail fast in
  // production so the misconfiguration is caught at deploy time instead.
  if (process.env.NODE_ENV === 'production' && !String(process.env.GOOGLE_CLIENT_ID ?? '').trim()) {
    errors.push('GOOGLE_CLIENT_ID is required for Google Sign-In');
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }
};

// Skip validation in test environments
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

const app = express();

// Render's load balancer terminates TLS and forwards requests with an
// X-Forwarded-For header. express-rate-limit v7 throws
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR when it sees that header unless
// Express is told to trust the proxy. Render sits behind exactly one
// proxy hop, so 'trust proxy' is set to 1. This is the standard, secure
// configuration for Render and does NOT weaken rate limiting — it simply
// lets the rate limiter read the real client IP from X-Forwarded-For.
app.set('trust proxy', 1);

const normalizeOrigin = (value) => String(value ?? '').trim().replace(/\/+$/, '');
const buildAllowedOrigins = () => {
  const raw = String(process.env.ALLOWED_ORIGINS ?? '').trim();
  const values = raw
    .split(',')
    .map((value) => normalizeOrigin(value))
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    values.push('http://localhost:5502', 'http://127.0.0.1:5502');
  }

  return Array.from(new Set(values));
};

const allowedOrigins = buildAllowedOrigins();

// ---------------- Security Middleware ----------------
// Helmet sets secure HTTP headers (CSP, X-Frame-Options, HSTS, etc.)
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP is handled at the frontend/CDN level
    crossOriginEmbedderPolicy: false, // Allow cross-origin resources (CDNs)
  })
);

// HTTP request logging (morgan)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// CORS - fail closed in production when no origins are configured
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) {
        // Fail closed: if no origins are configured, deny all cross-origin requests
        return callback(new Error('Not allowed by CORS'));
      }
      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight responses for 24 hours
  })
);

// Increase the body-parser limit to allow for Base64 image uploads.
// The default is 100kb, which is too small for images.
app.use(express.json({ limit: '10mb' }));
// Limit URL-encoded request bodies to prevent abuse
app.use(express.urlencoded({ limit: '1mb', extended: false }));

// Prevent MongoDB operator injection ($gt, $ne, etc.)
app.use(mongoSanitize());

// Sanitize all user input to prevent stored XSS
app.use(sanitizeInput);

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// ---------------- Basic Routes ----------------

// Home route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Health check route
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    ok: dbConnected,
    status: 'up',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database test route
app.get('/test-db', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return res.status(503).json({ error: 'Database is not connected yet.' });
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({
      message: 'Database connected successfully',
      collections
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TEMPORARY SENTRY TEST ROUTE ============
// TODO: REMOVE THIS ROUTE AFTER VERIFYING SENTRY CAPTURES PRODUCTION ERRORS.
// Deliberately throws so the existing Sentry error handler captures it.
app.get('/api/sentry-test', (req, res) => {
  throw new Error('Student Hustle Hub BACKEND SENTRY TEST');
});

// ---------------- API Routes ----------------
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// ---------------- Error Handling ----------------
// Sentry request + error handlers (current v10 SDK API). Must be registered
// after routes and before the app's final error handler.
const Sentry = require('@sentry/node');
Sentry.setupExpressErrorHandler(app);

app.use((req, res) => {
  res.status(404).json({ message: 'The requested resource was not found.' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = statusCode === 500
    ? 'A server error occurred. Our team has been notified.'
    : (err.message || 'Something went wrong. Please try again.');
  // Log detailed error for developers
  console.error(`[Server Error] ${statusCode}:`, err.message || err);
  if (statusCode === 500 && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(statusCode);
  res.json({ message });
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();