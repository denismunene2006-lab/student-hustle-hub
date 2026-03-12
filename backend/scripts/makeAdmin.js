const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const emailArgIndex = process.argv.findIndex((arg) => arg === '--email');
const email = emailArgIndex >= 0 ? process.argv[emailArgIndex + 1] : null;

if (!email) {
  console.log('Usage: node scripts/makeAdmin.js --email you@example.com');
  process.exit(0);
}

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user) {
    throw new Error('User not found');
  }

  user.isAdmin = true;
  await user.save();

  console.log(`Admin enabled for ${user.email}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('makeAdmin failed:', error.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
