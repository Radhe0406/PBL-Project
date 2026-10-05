const Listing = require('../models/Listing');
const User = require('../models/User');
const Report = require('../models/Report');
const { calculateItemImpact } = require('../utils/sustainability');
const { getPaginationMeta, createNotification } = require('../utils/helpers');

exports.getListings = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, category, condition, listingType,
      minPrice, maxPrice, city, sort = 'newest', status = 'Active',
      sellerId
    } = req.query;

    const filter = { status };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (listingType) filter.listingType = listingType;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (sellerId) filter.sellerId = sellerId;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let sortOption = {};
    switch (sort) {
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'price_low': sortOption = { price: 1 }; break;
      case 'price_high': sortOption = { price: -1 }; break;
      case 'popular': sortOption = { viewCount: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('sellerId', 'firstName lastName avatar rating location verifications')
      .sort(sortOption)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      listings,
      pagination: getPaginationMeta(total, page, limit)
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Error fetching listings' });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId)
      .populate('sellerId', 'firstName lastName avatar rating location verifications bio createdAt');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Increment view count
    listing.viewCount += 1;
    await listing.save();

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listing' });
  }
};

exports.createListing = async (req, res) => {
  try {
    const {
      title, description, category, condition, listingType,
      price, exchangePreferences, brand, yearOfPurchase, originalPrice,
      tags, city, area, pincode, pickupPreferences
    } = req.body;

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const impact = calculateItemImpact(category);

    const listing = new Listing({
      sellerId: req.userId,
      title,
      description,
      category,
      condition,
      listingType,
      price: listingType === 'Sell' ? parseFloat(price) : null,
      exchangePreferences: listingType === 'Exchange' ? exchangePreferences : '',
      brand: brand || '',
      yearOfPurchase: yearOfPurchase ? parseInt(yearOfPurchase) : undefined,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      images,
      primaryImage: images[0] || '',
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
      location: {
        city: city || '',
        area: area || '',
        pincode: pincode || ''
      },
      pickupPreferences: pickupPreferences ? (typeof pickupPreferences === 'string' ? [pickupPreferences] : pickupPreferences) : ['Buyer Collects'],
      sustainabilityMetrics: {
        wasteDivertedKg: impact.wasteKg,
        co2AvoidedKg: impact.co2Kg
      }
    });

    await listing.save();
    await listing.populate('sellerId', 'firstName lastName avatar rating');

    res.status(201).json({ listing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Error creating listing', error: error.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.sellerId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const allowedUpdates = [
      'title', 'description', 'category', 'condition', 'listingType',
      'price', 'exchangePreferences', 'brand', 'yearOfPurchase', 'originalPrice',
      'tags', 'location', 'pickupPreferences', 'status'
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        listing[key] = req.body[key];
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/${f.filename}`);
      listing.images = [...listing.images, ...newImages];
      if (!listing.primaryImage) {
        listing.primaryImage = newImages[0];
      }
    }

    await listing.save();
    await listing.populate('sellerId', 'firstName lastName avatar rating');

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.sellerId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.listingId);
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting listing' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const listingId = req.params.listingId;
    const user = await User.findById(req.userId);

    const isFavorited = user.favorites.includes(listingId);

    if (isFavorited) {
      user.favorites = user.favorites.filter(id => id.toString() !== listingId);
      await Listing.findByIdAndUpdate(listingId, { $inc: { favoriteCount: -1 } });
    } else {
      user.favorites.push(listingId);
      await Listing.findByIdAndUpdate(listingId, { $inc: { favoriteCount: 1 } });

      // Notify listing owner
      const listing = await Listing.findById(listingId);
      if (listing && listing.sellerId.toString() !== req.userId.toString()) {
        await createNotification({
          userId: listing.sellerId,
          type: 'listing_favorited',
          title: 'Item Favorited',
          message: `${user.firstName} saved your listing "${listing.title}"`,
          relatedId: listingId,
          relatedModel: 'Listing',
          actionUrl: `/listings/${listingId}`
        });
      }
    }

    await user.save();
    res.json({ favorited: !isFavorited });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling favorite' });
  }
};

exports.searchListings = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const filter = {
      status: 'Active',
      $text: { $search: q }
    };

    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter, { score: { $meta: 'textScore' } })
      .populate('sellerId', 'firstName lastName avatar rating location')
      .sort({ score: { $meta: 'textScore' } })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      listings,
      query: q,
      pagination: getPaginationMeta(total, page, limit)
    });
  } catch (error) {
    console.error('Search error:', error);
    // Fallback to regex search if text search fails
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const regex = new RegExp(q, 'i');
      const filter = {
        status: 'Active',
        $or: [{ title: regex }, { description: regex }, { tags: regex }]
      };
      const total = await Listing.countDocuments(filter);
      const listings = await Listing.find(filter)
        .populate('sellerId', 'firstName lastName avatar rating location')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      res.json({ listings, query: q, pagination: getPaginationMeta(total, page, limit) });
    } catch (fallbackError) {
      res.status(500).json({ message: 'Error searching listings' });
    }
  }
};

exports.reportListing = async (req, res) => {
  try {
    const { reason, details } = req.body;

    const report = new Report({
      reporterId: req.userId,
      reportType: 'Listing',
      targetId: req.params.listingId,
      reason,
      details: details || ''
    });

    await report.save();
    res.status(201).json({ reportId: report._id, message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting report' });
  }
};
