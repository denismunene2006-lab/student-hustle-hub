const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    serviceSnapshot: {
      title: { type: String, required: true },
      category: { type: String, required: true },
      price: { type: Number, required: true },
      listingType: { type: String, enum: ['seller', 'buyer'], default: 'seller' },
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'],
      default: 'requested',
    },
    lastActionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
