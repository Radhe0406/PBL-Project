const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phoneNumber: { type: String, trim: true },
  passwordHash: { type: String },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 200, default: '' },
  location: {
    city: { type: String, default: '' },
    area: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  accountType: { type: String, enum: ['Seller', 'Buyer', 'Both'], default: 'Both' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  authMethod: { type: String, enum: ['EmailPassword', 'Digilocker'], default: 'EmailPassword' },
  digilockerData: {
    digilockerUID: { type: String },
    verifiedName: { type: String },
    verifiedPhone: { type: String },
    verifiedAddress: { type: String },
    verificationDate: { type: Date }
  },
  verifications: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    digilocker: { type: Boolean, default: false },
    idProof: { type: Boolean, default: false }
  },
  rating: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  sustainabilityMetrics: {
    itemsReused: { type: Number, default: 0 },
    wasteDiverted: { type: Number, default: 0 },
    co2Avoided: { type: Number, default: 0 },
    waterSaved: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 }
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    profileVisibility: { type: String, enum: ['Public', 'Private'], default: 'Public' }
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  lastLogin: { type: Date },
  status: { type: String, enum: ['Active', 'Suspended', 'Deleted'], default: 'Active' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

userSchema.index({ email: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);
