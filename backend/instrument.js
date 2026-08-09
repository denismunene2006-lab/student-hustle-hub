// Sentry Node.js instrumentation — REQUIRED to be first require in the app.
// This enables automatic instrumentation of all modules loaded after it.
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || (process.env.NODE_ENV === 'production' ? 0.1 : 0)),
  sendDefaultPII: false,
  release: 'student-hustle-hub@1.0.0',
});