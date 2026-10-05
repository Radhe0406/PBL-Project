const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { createNotification } = require('../utils/helpers');

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, listingId } = req.body;

    if (recipientId === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot send a message to yourself' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.userId, recipientId],
        listingId: listingId || undefined
      });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      senderId: req.userId,
      recipientId,
      content
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = {
      content,
      senderId: req.userId,
      createdAt: new Date()
    };

    // Increment unread count for recipient
    const currentUnread = conversation.unreadCount.get(recipientId) || 0;
    conversation.unreadCount.set(recipientId, currentUnread + 1);
    await conversation.save();

    // Notify recipient
    await createNotification({
      userId: recipientId,
      type: 'new_message',
      title: 'New Message',
      message: `You have a new message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
      relatedId: conversation._id,
      relatedModel: 'Conversation',
      actionUrl: `/messages/${conversation._id}`
    });

    await message.populate('senderId', 'firstName lastName avatar');

    res.status(201).json({ message, conversationId: conversation._id });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await Conversation.countDocuments({
      participants: req.userId
    });

    const conversations = await Conversation.find({
      participants: req.userId
    })
      .populate('participants', 'firstName lastName avatar')
      .populate('listingId', 'title primaryImage')
      .sort({ updatedAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Add unread count for current user
    const formattedConversations = conversations.map(conv => {
      const obj = conv.toObject();
      obj.unreadForMe = conv.unreadCount.get(req.userId.toString()) || 0;
      obj.otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.userId.toString()
      );
      return obj;
    });

    res.json({
      conversations: formattedConversations,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const conversationId = req.params.conversationId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Not a participant of this conversation' });
    }

    const total = await Message.countDocuments({ conversationId });
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'firstName lastName avatar')
      .sort({ createdAt: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { conversationId, recipientId: req.userId, readAt: null },
      { readAt: new Date() }
    );

    // Reset unread count
    conversation.unreadCount.set(req.userId.toString(), 0);
    await conversation.save();

    await conversation.populate('participants', 'firstName lastName avatar');
    await conversation.populate('listingId', 'title primaryImage');

    res.json({
      messages,
      conversation,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.messageId, { readAt: new Date() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read' });
  }
};
