const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const shouldRun = process.argv.includes('--confirm');
if (!shouldRun) {
  console.log('Seed aborted. Re-run with: node scripts/seedDemo.js --confirm');
  process.exit(0);
}

const demoPassword = 'DemoPass123';

const demoUsers = [
  {
    name: 'Amina Otieno',
    email: 'amina.demo@campus.example',
    university: 'Campus University',
    course: 'Mathematics',
    whatsappNumber: '0712345678',
    bio: 'Patient math tutor focused on first-year courses.',
  },
  {
    name: 'Brian Kiplagat',
    email: 'brian.demo@campus.example',
    university: 'Campus University',
    course: 'Graphic Design',
    whatsappNumber: '0723456789',
    bio: 'Poster and social media design for student clubs.',
  },
  {
    name: 'Christine Wanjiru',
    email: 'christine.demo@campus.example',
    university: 'Campus University',
    course: 'Electrical Engineering',
    whatsappNumber: '0734567890',
    bio: 'Quick phone diagnostics and repair tips.',
  },
];

const demoServices = [
  {
    title: 'Calculus tutoring (1-hour session)',
    description: 'Step-by-step help with limits, derivatives, and integration.',
    category: 'Tutoring',
    price: 450,
    listingType: 'seller',
  },
  {
    title: 'Poster design for campus events',
    description: 'Clean, bold poster designs delivered in 48 hours.',
    category: 'Graphic Design',
    price: 800,
    listingType: 'seller',
  },
  {
    title: 'Phone repair assessment',
    description: 'Diagnostics and repair advice for common phone issues.',
    category: 'Phone Repair',
    price: 600,
    listingType: 'seller',
  },
];

const connect = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in backend/.env');
  }
  await mongoose.connect(process.env.MONGO_URI);
};

const seed = async () => {
  await connect();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(demoPassword, salt);

  for (let i = 0; i < demoUsers.length; i += 1) {
    const userData = demoUsers[i];
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create({
        ...userData,
        password: hashedPassword,
        marketMode: 'seller',
      });
    }

    const serviceData = demoServices[i];
    if (serviceData) {
      const exists = await Service.findOne({ title: serviceData.title, user: user._id });
      if (!exists) {
        await Service.create({
          ...serviceData,
          user: user._id,
          contactInfo: userData.whatsappNumber,
        });
      }
    }
  }

  console.log('Demo users/services seeded.');
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
