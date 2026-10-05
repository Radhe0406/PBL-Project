const mongoose = require('mongoose');

const exchangeProposalSchema = new mongoose.Schema({
  initiatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  initiatorListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  responderListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  counterproposal: {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    message: { type: String }
  },
  completedAt: { type: Date }
}, {
  timestamps: true
});

exchangeProposalSchema.index({ initiatorId: 1, status: 1 });
exchangeProposalSchema.index({ responderId: 1, status: 1 });

module.exports = mongoose.model('ExchangeProposal', exchangeProposalSchema);
