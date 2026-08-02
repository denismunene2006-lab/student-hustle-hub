const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
      maxlength: 50,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0,
      max: 100000000,
    },
    listingType: {
      type: String,
      required: true,
      enum: ['seller', 'buyer'],
      default: 'seller',
    },
    contactInfo: {
      type: String,
      required: [true, 'Please add contact information'],
      maxlength: 20,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ user: 1, createdAt: -1 });
serviceSchema.index({ category: 1, listingType: 1, createdAt: -1 });

module.exports = mongoose.model('Service', serviceSchema);