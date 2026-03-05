const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Tutoring',
        'Assignment Help',
        'Graphic Design',
        'Programming Help',
        'CV Writing',
        'Other',
      ],
    },
    listingType: {
      type: String,
      enum: ['buyer', 'seller'],
      default: 'seller',
      required: true,
    },
    price: { type: Number, required: true },
    contactInfo: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
