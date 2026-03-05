const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const allowedOrigins = String(process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = allowedOrigins.length
  ? {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      },
    }
  : { origin: true };

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'up', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
