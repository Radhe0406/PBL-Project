const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const { getAchievementBadges, getContributionPercentile } = require('../utils/sustainability');
const { getPaginationMeta } = require('../utils/helpers');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const listingCount = await Listing.countDocuments({ sellerId: user._id, status: 'Active' });

    res.json({
      user: user.toSafeObject(),
      listingCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'bio', 'location', 'preferences', 'accountType'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-passwordHash');

    res.json({ avatar: avatarUrl, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading avatar' });
  }
};

exports.getUserRatings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const total = await Review.countDocuments({ revieweeId: req.params.userId });
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'firstName lastName avatar')
      .populate('relatedListingId', 'title primaryImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      reviews,
      pagination: getPaginationMeta(total, page, limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ratings' });
  }
};

exports.getUserImpact = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('sustainabilityMetrics');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalUsers = await User.countDocuments({ status: 'Active' });
    const badges = getAchievementBadges({
      ...user.sustainabilityMetrics.toObject(),
      donationsMade: user.sustainabilityMetrics.itemsReused,
      exchangesMade: 0
    });
    const percentile = getContributionPercentile(user.sustainabilityMetrics, totalUsers);

    res.json({
      metrics: user.sustainabilityMetrics,
      badges,
      percentile,
      rank: `Top ${percentile}%`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching impact data' });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'favorites',
      populate: { path: 'sellerId', select: 'firstName lastName avatar rating' }
    });

    res.json({ favorites: user.favorites || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites' });
  }
};
