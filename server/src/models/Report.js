const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: {
    type: String,
    enum: ['Listing', 'User', 'Message'],
    required: true
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: {
    type: String,
    enum: ['Inappropriate Content', 'Suspicious', 'Offensive', 'Misleading', 'Non-Responsive', 'Other'],
    required: true
  },
  details: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Resolved', 'Dismissed'],
    default: 'Pending'
  },
  adminNotes: { type: String, default: '' },
  actionTaken: {
    type: String,
    enum: ['None', 'Warning', 'Listing Removed', 'Account Suspended'],
    default: 'None'
  },
  resolvedAt: { type: Date }
}, {
  timestamps: true
});

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ targetId: 1 });

module.exports = mongoose.model('Report', reportSchema);
