const DonationRequest = require('../models/DonationRequest');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { createNotification } = require('../utils/helpers');
const { calculateItemImpact } = require('../utils/sustainability');

exports.createRequest = async (req, res) => {
  try {
    const { listingId, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    if (listing.listingType !== 'Donate') {
      return res.status(400).json({ message: 'This item is not available for donation' });
    }
    if (listing.sellerId.toString() === req.userId.toString()) {
      return res.status(400).json({ message: 'You cannot request your own donation' });
    }

    // Check for existing pending request
    const existing = await DonationRequest.findOne({
      requesterId: req.userId,
      listingId,
      status: 'Pending'
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this item' });
    }

    const donation = new DonationRequest({
      requesterId: req.userId,
      donorId: listing.sellerId,
      listingId,
      message: message || ''
    });

    await donation.save();

    // Notify donor
    const requester = await User.findById(req.userId);
    await createNotification({
      userId: listing.sellerId,
      type: 'donation_request',
      title: 'New Donation Request',
      message: `${requester.firstName} has requested your donated item "${listing.title}"`,
      relatedId: donation._id,
      relatedModel: 'DonationRequest',
      actionUrl: '/dashboard?tab=donations'
    });

    await donation.populate([
      { path: 'requesterId', select: 'firstName lastName avatar' },
      { path: 'donorId', select: 'firstName lastName avatar' },
      { path: 'listingId', select: 'title primaryImage condition' }
    ]);

    res.status(201).json({ donation });
  } catch (error) {
    console.error('Create donation request error:', error);
    res.status(500).json({ message: 'Error creating donation request' });
  }
};

exports.getDonation = async (req, res) => {
  try {
    const donation = await DonationRequest.findById(req.params.donationId)
      .populate('requesterId', 'firstName lastName avatar location')
      .populate('donorId', 'firstName lastName avatar')
      .populate('listingId');

    if (!donation) {
      return res.status(404).json({ message: 'Donation request not found' });
    }

    res.json({ donation });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donation request' });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await DonationRequest.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ message: 'Donation request not found' });
    }

    if (donation.donorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only the donor can approve or reject' });
    }

    donation.status = status;
    if (status === 'Approved') {
      donation.approvedAt = new Date();

      // Update listing status
      await Listing.findByIdAndUpdate(donation.listingId, { status: 'Donated' });

      // Update sustainability metrics
      const listing = await Listing.findById(donation.listingId);
      const impact = calculateItemImpact(listing?.category || 'Other');

      await User.findByIdAndUpdate(donation.donorId, {
        $inc: {
          'sustainabilityMetrics.itemsReused': 1,
          'sustainabilityMetrics.wasteDiverted': impact.wasteKg,
          'sustainabilityMetrics.co2Avoided': impact.co2Kg,
          'sustainabilityMetrics.waterSaved': impact.waterL
        }
      });
    }

    await donation.save();

    // Notify requester
    await createNotification({
      userId: donation.requesterId,
      type: status === 'Approved' ? 'donation_approved' : 'donation_rejected',
      title: `Donation ${status}`,
      message: `Your donation request has been ${status.toLowerCase()}`,
      relatedId: donation._id,
      relatedModel: 'DonationRequest',
      actionUrl: '/dashboard?tab=donations'
    });

    await donation.populate([
      { path: 'requesterId', select: 'firstName lastName avatar' },
      { path: 'donorId', select: 'firstName lastName avatar' },
      { path: 'listingId', select: 'title primaryImage' }
    ]);

    res.json({ donation });
  } catch (error) {
    res.status(500).json({ message: 'Error updating donation request' });
  }
};

exports.getUserDonations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 20, status, role } = req.query;

    const filter = {};
    if (role === 'donor') {
      filter.donorId = userId;
    } else if (role === 'requester') {
      filter.requesterId = userId;
    } else {
      filter.$or = [{ donorId: userId }, { requesterId: userId }];
    }
    if (status) filter.status = status;

    const total = await DonationRequest.countDocuments(filter);
    const donations = await DonationRequest.find(filter)
      .populate('requesterId', 'firstName lastName avatar')
      .populate('donorId', 'firstName lastName avatar')
      .populate('listingId', 'title primaryImage condition category')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      donations,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donations' });
  }
};
