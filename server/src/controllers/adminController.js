const User = require('../models/User');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const ExchangeProposal = require('../models/ExchangeProposal');
const DonationRequest = require('../models/DonationRequest');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    const suspendedUsers = await User.countDocuments({ status: 'Suspended' });
    const activeListings = await Listing.countDocuments({ status: 'Active' });
    const totalListings = await Listing.countDocuments();
    const completedExchanges = await ExchangeProposal.countDocuments({ status: 'Completed' });
    const completedDonations = await DonationRequest.countDocuments({ status: { $in: ['Approved', 'Completed'] } });
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const soldListings = await Listing.countDocuments({ status: 'Sold' });

    // Category breakdown
    const categoryStats = await Listing.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Listing type breakdown
    const typeStats = await Listing.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$listingType', count: { $sum: 1 } } }
    ]);

    // Platform sustainability
    const sustainabilityAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalItemsReused: { $sum: '$sustainabilityMetrics.itemsReused' },
          totalWasteDiverted: { $sum: '$sustainabilityMetrics.wasteDiverted' },
          totalCo2Avoided: { $sum: '$sustainabilityMetrics.co2Avoided' },
          totalWaterSaved: { $sum: '$sustainabilityMetrics.waterSaved' }
        }
      }
    ]);

    const sustainability = sustainabilityAgg[0] || {
      totalItemsReused: 0, totalWasteDiverted: 0, totalCo2Avoided: 0, totalWaterSaved: 0
    };

    // Recent activity
    const recentUsers = await User.find()
      .select('firstName lastName email createdAt status')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentListings = await Listing.find()
      .populate('sellerId', 'firstName lastName')
      .select('title category listingType status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        activeListings,
        totalListings,
        completedExchanges,
        completedDonations,
        completedTransactions: completedExchanges + completedDonations + soldListings,
        pendingReports
      },
      categoryStats,
      typeStats,
      sustainability,
      recentUsers,
      recentListings
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, verified } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (verified === 'true') filter['verifications.email'] = true;
    if (verified === 'false') filter['verifications.email'] = false;
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { action } = req.body;
    const userId = req.params.userId;
    let update = {};

    switch (action) {
      case 'verify':
        update = { 'verifications.email': true };
        break;
      case 'suspend':
        update = { status: 'Suspended' };
        break;
      case 'activate':
        update = { status: 'Active' };
        break;
      case 'make_admin':
        update = { role: 'admin' };
        break;
      case 'remove_admin':
        update = { role: 'user' };
        break;
      case 'delete':
        update = { status: 'Deleted' };
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user, message: `User ${action} successful` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.getAdminListings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, flagged, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (flagged === 'true') filter.status = 'Flagged';
    if (category) filter.category = category;

    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('sellerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      listings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings' });
  }
};

exports.updateAdminListing = async (req, res) => {
  try {
    const { action } = req.body;
    let update = {};

    switch (action) {
      case 'approve': update = { status: 'Active' }; break;
      case 'reject': case 'remove': update = { status: 'Archived' }; break;
      case 'flag': update = { status: 'Flagged' }; break;
      default: return res.status(400).json({ message: 'Invalid action' });
    }

    const listing = await Listing.findByIdAndUpdate(req.params.listingId, update, { new: true });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    res.json({ listing, message: `Listing ${action} successful` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.reportType = type;

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .populate('reporterId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      reports,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { action, adminNotes } = req.body;
    const update = { adminNotes: adminNotes || '' };

    switch (action) {
      case 'resolve':
        update.status = 'Resolved';
        update.resolvedAt = new Date();
        break;
      case 'dismiss':
        update.status = 'Dismissed';
        update.resolvedAt = new Date();
        break;
      case 'review':
        update.status = 'Under Review';
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const report = await Report.findByIdAndUpdate(req.params.reportId, update, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.json({ report, message: `Report ${action} successful` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating report' });
  }
};
