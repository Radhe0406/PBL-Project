const ExchangeProposal = require('../models/ExchangeProposal');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { createNotification } = require('../utils/helpers');
const { calculateItemImpact } = require('../utils/sustainability');

exports.createProposal = async (req, res) => {
  try {
    const { initiatorListingId, responderListingId, message } = req.body;

    const initiatorListing = await Listing.findById(initiatorListingId);
    const responderListing = await Listing.findById(responderListingId);

    if (!initiatorListing || !responderListing) {
      return res.status(404).json({ message: 'One or both listings not found' });
    }

    if (initiatorListing.sellerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You can only propose exchanges with your own items' });
    }

    const proposal = new ExchangeProposal({
      initiatorId: req.userId,
      responderId: responderListing.sellerId,
      initiatorListingId,
      responderListingId,
      message: message || ''
    });

    await proposal.save();

    // Notify responder
    await createNotification({
      userId: responderListing.sellerId,
      type: 'exchange_proposal',
      title: 'New Exchange Proposal',
      message: `Someone wants to exchange "${initiatorListing.title}" for your "${responderListing.title}"`,
      relatedId: proposal._id,
      relatedModel: 'ExchangeProposal',
      actionUrl: '/dashboard?tab=exchanges'
    });

    await proposal.populate([
      { path: 'initiatorId', select: 'firstName lastName avatar' },
      { path: 'responderId', select: 'firstName lastName avatar' },
      { path: 'initiatorListingId', select: 'title primaryImage condition' },
      { path: 'responderListingId', select: 'title primaryImage condition' }
    ]);

    res.status(201).json({ proposal });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ message: 'Error creating exchange proposal' });
  }
};

exports.getProposal = async (req, res) => {
  try {
    const proposal = await ExchangeProposal.findById(req.params.proposalId)
      .populate('initiatorId', 'firstName lastName avatar')
      .populate('responderId', 'firstName lastName avatar')
      .populate('initiatorListingId')
      .populate('responderListingId');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    res.json({ proposal });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proposal' });
  }
};

exports.updateProposal = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await ExchangeProposal.findById(req.params.proposalId);

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Only responder can accept/reject, initiator can cancel
    const isResponder = proposal.responderId.toString() === req.userId.toString();
    const isInitiator = proposal.initiatorId.toString() === req.userId.toString();

    if (status === 'Cancelled' && !isInitiator) {
      return res.status(403).json({ message: 'Only the initiator can cancel' });
    }
    if ((status === 'Accepted' || status === 'Rejected') && !isResponder) {
      return res.status(403).json({ message: 'Only the responder can accept or reject' });
    }

    proposal.status = status;

    if (status === 'Accepted' || status === 'Completed') {
      proposal.completedAt = new Date();

      // Update listing statuses
      await Listing.findByIdAndUpdate(proposal.initiatorListingId, { status: 'Exchanged' });
      await Listing.findByIdAndUpdate(proposal.responderListingId, { status: 'Exchanged' });

      // Update sustainability metrics for both users
      const listing1 = await Listing.findById(proposal.initiatorListingId);
      const listing2 = await Listing.findById(proposal.responderListingId);
      const impact1 = calculateItemImpact(listing1?.category || 'Other');
      const impact2 = calculateItemImpact(listing2?.category || 'Other');

      await User.findByIdAndUpdate(proposal.initiatorId, {
        $inc: {
          'sustainabilityMetrics.itemsReused': 1,
          'sustainabilityMetrics.wasteDiverted': impact1.wasteKg,
          'sustainabilityMetrics.co2Avoided': impact1.co2Kg,
          'sustainabilityMetrics.waterSaved': impact1.waterL
        }
      });
      await User.findByIdAndUpdate(proposal.responderId, {
        $inc: {
          'sustainabilityMetrics.itemsReused': 1,
          'sustainabilityMetrics.wasteDiverted': impact2.wasteKg,
          'sustainabilityMetrics.co2Avoided': impact2.co2Kg,
          'sustainabilityMetrics.waterSaved': impact2.waterL
        }
      });
    }

    await proposal.save();

    // Notify the other party
    const notifyUserId = isResponder ? proposal.initiatorId : proposal.responderId;
    await createNotification({
      userId: notifyUserId,
      type: status === 'Accepted' ? 'exchange_accepted' : 'exchange_rejected',
      title: `Exchange ${status}`,
      message: `Your exchange proposal has been ${status.toLowerCase()}`,
      relatedId: proposal._id,
      relatedModel: 'ExchangeProposal',
      actionUrl: '/dashboard?tab=exchanges'
    });

    await proposal.populate([
      { path: 'initiatorId', select: 'firstName lastName avatar' },
      { path: 'responderId', select: 'firstName lastName avatar' },
      { path: 'initiatorListingId', select: 'title primaryImage' },
      { path: 'responderListingId', select: 'title primaryImage' }
    ]);

    res.json({ proposal });
  } catch (error) {
    res.status(500).json({ message: 'Error updating proposal' });
  }
};

exports.getUserExchanges = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 20, status } = req.query;

    const filter = {
      $or: [{ initiatorId: userId }, { responderId: userId }]
    };
    if (status) filter.status = status;

    const total = await ExchangeProposal.countDocuments(filter);
    const proposals = await ExchangeProposal.find(filter)
      .populate('initiatorId', 'firstName lastName avatar')
      .populate('responderId', 'firstName lastName avatar')
      .populate('initiatorListingId', 'title primaryImage condition price')
      .populate('responderListingId', 'title primaryImage condition price')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      proposals,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exchanges' });
  }
};
