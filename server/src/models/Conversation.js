const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  lastMessage: {
    content: { type: String, default: '' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
