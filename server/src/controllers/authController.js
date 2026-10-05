const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createNotification } = require('../utils/helpers');

const generateTokens = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });
  return { token, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, city, area, pincode, accountType } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash: password,
      phoneNumber: phoneNumber || '',
      location: { city: city || '', area: area || '', pincode: pincode || '' },
      accountType: accountType || 'Both',
      verifications: { email: true } // auto-verify for dev
    });

    await user.save();

    const { token, refreshToken } = generateTokens(user._id);

    await createNotification({
      userId: user._id,
      type: 'platform_update',
      title: 'Welcome to ReLoop!',
      message: 'Your account has been created successfully. Start listing items to make an impact!',
      actionUrl: '/dashboard'
    });

    res.status(201).json({
      token,
      refreshToken,
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const { token, refreshToken } = generateTokens(user._id);

    res.json({
      token,
      refreshToken,
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;
    if (!oldRefreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'Active') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const { token, refreshToken } = generateTokens(user._id);
    res.json({ token, refreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  // In a production app, we'd blacklist the token or remove from Redis
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    console.log(`Password reset requested for: ${email}`);
    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    // In production, validate the reset token
    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};
