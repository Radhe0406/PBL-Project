const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, minlength: 10, maxlength: 500 },
  relatedListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  relatedTransactionType: {
    type: String,
    enum: ['Sale', 'Donation', 'Exchange']
  },
  images: [{ type: String }]
}, {
  timestamps: true
});

reviewSchema.index({ revieweeId: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
