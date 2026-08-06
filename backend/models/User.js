const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: false,
      default: '',
      maxlength: 200,
    },
    googleId: {
      type: String,
      default: '',
      trim: true,
      index: true,
      maxlength: 100,
    },
    university: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    course: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      default: '',
      // Allow Base64 data URLs for profile images (frontend resizes to max 512px
      // and re-encodes to JPEG/PNG, which can produce strings of 50-200KB).
      maxlength: 500000,
    },
    whatsappNumber: {
      type: String,
      default: '',
      maxlength: 20,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    marketMode: {
      type: String,
      enum: ['seller', 'buyer'],
      default: 'seller',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ updatedAt: -1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);