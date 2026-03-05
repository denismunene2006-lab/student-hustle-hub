const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    university: { type: String, required: true },
    course: { type: String, required: true },
    image: { type: String },
    whatsappNumber: { type: String, default: '' },
    bio: { type: String, default: '' },
    marketMode: {
      type: String,
      enum: ['buyer', 'seller'],
      default: 'seller',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
