const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  approvedAt: { type: Date }
}, {
  timestamps: true
});

donationRequestSchema.index({ requesterId: 1, status: 1 });
donationRequestSchema.index({ donorId: 1, status: 1 });
donationRequestSchema.index({ listingId: 1 });

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
