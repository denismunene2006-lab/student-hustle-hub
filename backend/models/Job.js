const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    serviceSnapshot: {
      title: { type: String, required: true, maxlength: 100 },
      category: { type: String, required: true, maxlength: 50 },
      price: { type: Number, required: true, min: 0, max: 100000000 },
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
      maxlength: 1000,
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

jobSchema.index({ buyer: 1, updatedAt: -1 });
jobSchema.index({ seller: 1, updatedAt: -1 });
jobSchema.index({ service: 1, buyer: 1, seller: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);