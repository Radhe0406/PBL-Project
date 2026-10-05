const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read } = req.query;

    const filter = { userId: req.userId };
    if (read !== undefined) filter.read = read === 'true';

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      notifications,
      unreadCount,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, userId: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all as read' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.notificationId, userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
};
