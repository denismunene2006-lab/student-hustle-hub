const User = require('../models/User');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();
const getAdminEmails = () =>
  String(process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
const isAdminEmail = (email) => getAdminEmails().includes(normalizeEmail(email));

const normalizeMarketMode = (value) => (value === 'buyer' ? 'buyer' : 'seller');

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

const getLoginKey = (email, ip) => `${normalizeEmail(email)}|${ip || 'unknown'}`;

const getAttempt = (key) => {
  const entry = loginAttempts.get(key);
  if (!entry) return null;
  if (!entry.lockedUntil && Date.now() - entry.firstFailedAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return null;
  }
  if (entry.lockedUntil && Date.now() > entry.lockedUntil) {
    loginAttempts.delete(key);
    return null;
  }
  return entry;
};

const registerFailedAttempt = (key) => {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now - entry.firstFailedAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstFailedAt: now, lockedUntil: null });
    return { locked: false };
  }
  entry.count += 1;
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOGIN_LOCK_MS;
  }
  loginAttempts.set(key, entry);
  return { locked: Boolean(entry.lockedUntil) };
};

const clearAttempts = (key) => loginAttempts.delete(key);

const mapUser = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  university: user.university,
  course: user.course,
  image: user.image ?? '',
  whatsappNumber: user.whatsappNumber ?? '',
  bio: user.bio ?? '',
  marketMode: normalizeMarketMode(user.marketMode),
  isAdmin: Boolean(user.isAdmin),
});

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password, university, course } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const shouldAdmin = isAdminEmail(email) || (await User.countDocuments()) === 0;

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    university,
    course,
    isAdmin: shouldAdmin,
  });

  res.status(201).json({
    ...mapUser(user),
    token: generateToken(user.id),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const loginKey = getLoginKey(normalizedEmail, req.ip);
  const attempt = getAttempt(loginKey);
  if (attempt?.lockedUntil) {
    const minutes = Math.max(1, Math.ceil((attempt.lockedUntil - Date.now()) / 60000));
    res.status(429);
    throw new Error(`Too many failed attempts. Try again in ${minutes} minute(s).`);
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (user && (await bcrypt.compare(password, user.password))) {
    clearAttempts(loginKey);
    if (!user.isAdmin && isAdminEmail(email)) {
      user.isAdmin = true;
      await user.save();
    }
    res.json({
      ...mapUser(user),
      token: generateToken(user.id),
    });
  } else {
    const { locked } = registerFailedAttempt(loginKey);
    res.status(locked ? 429 : 401);
    throw new Error(locked ? 'Too many failed attempts. Try again later.' : 'Invalid email or password');
  }
});

const getMe = asyncHandler(async (req, res) => {
  res.json(mapUser(req.user));
});

const updateMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const nextEmail = String(req.body?.email ?? user.email).trim().toLowerCase();
    if (!nextEmail) {
      res.status(400);
      throw new Error('Email is required');
    }

    if (nextEmail !== user.email) {
      const existing = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (existing) {
        res.status(400);
        throw new Error('Email already in use');
      }
      user.email = nextEmail;
    }

    user.name = String(req.body?.name ?? user.name).trim();
    user.university = String(req.body?.university ?? user.university).trim();
    user.course = String(req.body?.course ?? user.course).trim();
    user.image = String(req.body?.image ?? user.image ?? '').trim();
    user.whatsappNumber = String(req.body?.whatsappNumber ?? user.whatsappNumber ?? '').trim();
    user.bio = String(req.body?.bio ?? user.bio ?? '').trim();
    user.marketMode = normalizeMarketMode(req.body?.marketMode ?? user.marketMode);

    if (!user.name) {
      res.status(400);
      throw new Error('Name is required');
    }
    if (!user.university) {
      res.status(400);
      throw new Error('University is required');
    }
    if (!user.course) {
      res.status(400);
      throw new Error('Course is required');
    }

    const saved = await user.save();
    res.json(mapUser(saved));
});

// @desc    Update password for logged-in user
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current and new password are required');
  }

  if (String(newPassword).length < 8) {
    res.status(400);
    throw new Error('Password must be 8 or more characters');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ ok: true });
});

module.exports = { registerUser, loginUser, getMe, updateMe, updatePassword };
