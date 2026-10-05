const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'listing_inquiry', 'listing_viewed', 'listing_favorited',
      'exchange_proposal', 'exchange_accepted', 'exchange_rejected',
      'donation_request', 'donation_approved', 'donation_rejected',
      'new_message',
      'badge_earned', 'milestone',
      'account_login', 'profile_updated', 'verification_changed',
      'platform_update'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String },
  thumbnail: { type: String, default: '' },
  read: { type: Boolean, default: false },
  actionUrl: { type: String, default: '' }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
