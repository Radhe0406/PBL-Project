const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics & Gadgets',
      'Books & Stationery',
      'Furniture & Home Decor',
      'Clothing & Accessories',
      'Sports & Outdoor',
      'Bicycles & Vehicles',
      'Household Appliances',
      'Toys & Gaming',
      'Beauty & Personal Care',
      'Musical Instruments',
      'Other'
    ]
  },
  subCategory: { type: String, default: '' },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Needs Repair']
  },
  listingType: {
    type: String,
    required: true,
    enum: ['Sell', 'Donate', 'Exchange']
  },
  price: { type: Number, default: null, min: 0 },
  currency: { type: String, default: 'INR' },
  exchangePreferences: { type: String, default: '' },
  brand: { type: String, default: '' },
  yearOfPurchase: { type: Number },
  originalPrice: { type: Number },
  images: [{ type: String }],
  primaryImage: { type: String, default: '' },
  tags: [{ type: String }],
  location: {
    city: { type: String, default: '' },
    area: { type: String, default: '' },
    pincode: { type: String, default: '' },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  pickupPreferences: [{
    type: String,
    enum: ['Buyer Collects', 'Seller Delivers', 'Both Available']
  }],
  status: {
    type: String,
    enum: ['Active', 'Sold', 'Donated', 'Exchanged', 'Paused', 'Archived', 'Flagged'],
    default: 'Active'
  },
  viewCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  sustainabilityMetrics: {
    wasteDivertedKg: { type: Number, default: 0 },
    co2AvoidedKg: { type: Number, default: 0 }
  },
  expiresAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for search
listingSchema.index({ title: 'text', description: 'text', tags: 'text' });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ sellerId: 1 });
listingSchema.index({ listingType: 1 });
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);
