const User = require('../models/User');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const { normalizeKenyanPhone } = require('../utils/phone');

// Google Client ID must come from environment variables only.
// No hardcoded fallback - this prevents using a public client ID for auth.
const googleClientId = String(process.env.GOOGLE_CLIENT_ID ?? '').trim();
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();
const escapeRegExp = (value) => String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  googleId: user.googleId ?? '',
  university: user.university,
  course: user.course,
  image: user.image ?? '',
  whatsappNumber: normalizeKenyanPhone(user.whatsappNumber) || '',
  bio: user.bio ?? '',
  marketMode: normalizeMarketMode(user.marketMode),
  isAdmin: Boolean(user.isAdmin),
  isSuspended: Boolean(user.isSuspended),
  suspensionReason: user.suspensionReason ?? '',
});

const isEmailVerified = (value) => value === true || value === 'true';

const verifyGoogleCredential = async (credential) => {
  if (!googleClient) {
    throw new Error('Google sign-in is not configured on the server');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error('Google account email is missing');
  }

  if (!isEmailVerified(payload.email_verified)) {
    throw new Error('Google account email is not verified');
  }

  return payload;
};

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password, university, course } = req.body;
  const normalizedEmail = normalizeEmail(email);

  // Validate field lengths
  if (String(name ?? '').length > 100) {
    res.status(400);
    throw new Error('Name must be 100 characters or less');
  }
  if (String(university ?? '').length > 100) {
    res.status(400);
    throw new Error('University must be 100 characters or less');
  }
  if (String(course ?? '').length > 100) {
    res.status(400);
    throw new Error('Course must be 100 characters or less');
  }

  const userExists = await User.findOne({
    email: { $regex: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, 'i') },
  });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const shouldAdmin = isAdminEmail(normalizedEmail) || (await User.countDocuments()) === 0;

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    googleId: '',
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
  if (user && !String(user.password ?? '').trim()) {
    res.status(400);
    throw new Error('This account uses Google sign-in. Please continue with Google.');
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.isSuspended) {
      res.status(403);
      const reason = String(user.suspensionReason ?? '').trim();
      throw new Error(reason ? `Account suspended: ${reason}` : 'Account suspended. Contact support.');
    }
    clearAttempts(loginKey);
    if (!user.isAdmin && isAdminEmail(normalizedEmail)) {
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

const googleAuth = asyncHandler(async (req, res) => {
  const credential = String(req.body?.credential ?? '').trim();
  const allowCreate = Boolean(req.body?.allowCreate);
  const requestedName = String(req.body?.name ?? '').trim();
  const requestedUniversity = String(req.body?.university ?? '').trim();
  const requestedCourse = String(req.body?.course ?? '').trim();

  if (!credential) {
    res.status(400);
    throw new Error('Google credential is required');
  }

  const payload = await verifyGoogleCredential(credential);
  const normalizedEmail = normalizeEmail(payload.email);
  const googleId = String(payload.sub ?? '').trim();

  if (!normalizedEmail || !googleId) {
    res.status(400);
    throw new Error('Google sign-in payload is incomplete');
  }

  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.findOne({
      email: { $regex: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, 'i') },
    });
  }

  if (!user) {
    if (!allowCreate) {
      res.status(404);
      throw new Error('No account found for this Google login. Please register first.');
    }

    if (!requestedUniversity || !requestedCourse) {
      res.status(400);
      throw new Error('University and course are required to create a Google account');
    }

    const shouldAdmin = isAdminEmail(normalizedEmail) || (await User.countDocuments()) === 0;

    user = await User.create({
      name: requestedName || String(payload.name ?? 'Google User').trim() || 'Google User',
      email: normalizedEmail,
      password: '',
      googleId,
      university: requestedUniversity,
      course: requestedCourse,
      image: String(payload.picture ?? '').trim(),
      isAdmin: shouldAdmin,
    });
  } else {
    if (user.isSuspended) {
      res.status(403);
      const reason = String(user.suspensionReason ?? '').trim();
      throw new Error(reason ? `Account suspended: ${reason}` : 'Account suspended. Contact support.');
    }

    let changed = false;
    if (!user.googleId) {
      user.googleId = googleId;
      changed = true;
    }
    if (!String(user.image ?? '').trim() && String(payload.picture ?? '').trim()) {
      user.image = String(payload.picture).trim();
      changed = true;
    }
    if (!String(user.name ?? '').trim() && (requestedName || payload.name)) {
      user.name = requestedName || String(payload.name ?? '').trim();
      changed = true;
    }
    if (changed) {
      await user.save();
    }
  }

  if (!user.isAdmin && isAdminEmail(normalizedEmail)) {
    user.isAdmin = true;
    await user.save();
  }

  res.json({
    ...mapUser(user),
    token: generateToken(user.id),
  });
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

    // Validate field lengths
    if (String(req.body?.name ?? user.name).length > 100) {
      res.status(400);
      throw new Error('Name must be 100 characters or less');
    }
    if (String(req.body?.university ?? user.university).length > 100) {
      res.status(400);
      throw new Error('University must be 100 characters or less');
    }
    if (String(req.body?.course ?? user.course).length > 100) {
      res.status(400);
      throw new Error('Course must be 100 characters or less');
    }
    if (String(req.body?.bio ?? user.bio ?? '').length > 500) {
      res.status(400);
      throw new Error('Bio must be 500 characters or less');
    }
    // Only validate the image when it is actually being updated.
    // This prevents unrelated profile updates (e.g., changing marketMode, bio, course)
    // from failing because the existing stored image (possibly a Base64 data URL)
    // exceeds the URL length limit.
    const hasImageUpdate = Object.prototype.hasOwnProperty.call(req.body, 'image');
    // The frontend resizes and re-encodes profile images to max 512px Base64 data URLs,
    // which can be 50-200KB. The User model allows up to 500000 characters to accommodate this.
    if (hasImageUpdate && String(req.body.image ?? '').length > 500000) {
      res.status(400);
      throw new Error('Image URL is too long');
    }

    if (nextEmail !== user.email) {
      const existing = await User.findOne({
        email: { $regex: new RegExp(`^${escapeRegExp(nextEmail)}$`, 'i') },
        _id: { $ne: user._id },
      });
      if (existing) {
        res.status(400);
        throw new Error('Email already in use');
      }
      user.email = nextEmail;
    }

    user.name = String(req.body?.name ?? user.name).trim();
    user.university = String(req.body?.university ?? user.university).trim();
    user.course = String(req.body?.course ?? user.course).trim();
    if (hasImageUpdate) {
      user.image = String(req.body.image ?? '').trim();
    }
    const hasWhatsappNumber = Object.prototype.hasOwnProperty.call(req.body, 'whatsappNumber');
    const whatsappInput = hasWhatsappNumber ? req.body.whatsappNumber : user.whatsappNumber ?? '';
    const normalizedWhatsapp = normalizeKenyanPhone(whatsappInput);
    if (hasWhatsappNumber && String(whatsappInput).trim() && !normalizedWhatsapp) {
      res.status(400);
      throw new Error('Enter a Kenyan WhatsApp number like +254712345678');
    }
    user.whatsappNumber = normalizedWhatsapp;
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

  // Password complexity: require uppercase, lowercase, number, and special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(String(newPassword))) {
    res.status(400);
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const hasExistingPassword = Boolean(String(user.password ?? '').trim());
  if (hasExistingPassword) {
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }
  } else if (!currentPassword) {
  } else {
    res.status(400);
    throw new Error('This account does not have a current password yet. Leave current password empty to set one.');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ ok: true });
});

const checkEmailExists = asyncHandler(async (req, res) => {
  const email = String(req.query?.email ?? '').trim().toLowerCase();
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({
    email: { $regex: new RegExp(`^${escapeRegExp(email)}$`, 'i') },
  });

  res.json({ exists: Boolean(user) });
});

module.exports = { registerUser, loginUser, googleAuth, getMe, updateMe, updatePassword, checkEmailExists };