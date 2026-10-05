const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  attachments: [{
    type: { type: String },
    url: { type: String },
    name: { type: String }
  }],
  readAt: { type: Date, default: null }
}, {
  timestamps: true
});

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ recipientId: 1 });

module.exports = mongoose.model('Message', messageSchema);
