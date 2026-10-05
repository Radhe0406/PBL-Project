const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, relatedId, relatedModel, thumbnail, actionUrl }) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      thumbnail,
      actionUrl
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const paginateQuery = (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

const getPaginationMeta = (total, page, limit) => {
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
    hasMore: page * limit < total
  };
};

module.exports = {
  createNotification,
  paginateQuery,
  getPaginationMeta
};
