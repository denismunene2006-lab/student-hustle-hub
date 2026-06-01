const path = require('path');
const dotenv = require('dotenv');
// Load environment variables immediately, before other imports.
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

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

// ---------------- Middleware ----------------
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
// Increase the body-parser limit to allow for Base64 image uploads.
// The default is 100kb, which is too small for images.
app.use(express.json({ limit: '10mb' }));

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
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message || 'Server error',
  });
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
