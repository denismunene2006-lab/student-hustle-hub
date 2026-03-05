const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const normalizeMarketMode = (value) => (value === 'buyer' ? 'buyer' : 'seller');

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
});

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, university, course } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      university,
      course,
    });

    res.status(201).json({
      ...mapUser(user),
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        ...mapUser(user),
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  res.json(mapUser(req.user));
};

const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextEmail = String(req.body?.email ?? user.email).trim().toLowerCase();
    if (!nextEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (nextEmail !== user.email) {
      const existing = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
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
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!user.university) {
      return res.status(400).json({ message: 'University is required' });
    }
    if (!user.course) {
      return res.status(400).json({ message: 'Course is required' });
    }

    const saved = await user.save();
    return res.json(mapUser(saved));
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, getMe, updateMe };
