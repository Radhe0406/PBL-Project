const Review = require('../models/Review');
const User = require('../models/User');
const { createNotification } = require('../utils/helpers');

exports.createReview = async (req, res) => {
  try {
    const { revieweeId, rating, comment, listingId, transactionType } = req.body;

    if (revieweeId === req.userId.toString()) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    const review = new Review({
      reviewerId: req.userId,
      revieweeId,
      rating: parseInt(rating),
      comment,
      relatedListingId: listingId,
      relatedTransactionType: transactionType
    });

    await review.save();

    // Update reviewee's rating
    const reviews = await Review.find({ revieweeId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { breakdown[r.rating]++; });

    await User.findByIdAndUpdate(revieweeId, {
      'rating.averageRating': Math.round(avgRating * 10) / 10,
      'rating.totalReviews': reviews.length,
      'rating.ratingBreakdown': breakdown
    });

    // Notify the reviewee
    const reviewer = await User.findById(req.userId);
    await createNotification({
      userId: revieweeId,
      type: 'platform_update',
      title: 'New Review',
      message: `${reviewer.firstName} left you a ${rating}-star review`,
      relatedId: review._id,
      relatedModel: 'Review'
    });

    await review.populate('reviewerId', 'firstName lastName avatar');

    res.status(201).json({ review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Review.countDocuments({ revieweeId: req.params.userId });
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'firstName lastName avatar')
      .populate('relatedListingId', 'title primaryImage')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const user = await User.findById(req.params.userId).select('rating');

    res.json({
      reviews,
      ratingStats: user?.rating,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};
