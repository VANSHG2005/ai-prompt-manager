const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  getJwtSecret,
} = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ fullName, email: normalizedEmail, password });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio || '',
        username: user.username || '',
        website: user.website || '',
        location: user.location || '',
        avatarColor: user.avatarColor || 'blue',
        preferredAiTool: user.preferredAiTool || 'ChatGPT',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio || '',
        username: user.username || '',
        website: user.website || '',
        location: user.location || '',
        avatarColor: user.avatarColor || 'blue',
        preferredAiTool: user.preferredAiTool || 'ChatGPT',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const providedRefreshToken = req.body?.refreshToken;
    let fallbackToken = req.body?.token;
    if (!fallbackToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      fallbackToken = req.headers.authorization.split(' ')[1];
    }

    let userId = null;

    if (providedRefreshToken) {
      try {
        const decoded = verifyRefreshToken(providedRefreshToken);
        userId = decoded.id;
      } catch (err) {
        // Refresh token failed verification
      }
    }

    // Grace period fallback: if no valid refreshToken, check expired token signature
    if (!userId && fallbackToken) {
      try {
        const decoded = jwt.verify(fallbackToken, getJwtSecret(), { ignoreExpiration: true });
        const exp = decoded.exp ? decoded.exp * 1000 : 0;
        const now = Date.now();
        // Allow refresh within 7 days of token expiration
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (now - exp < sevenDays) {
          userId = decoded.id;
        }
      } catch (err) {
        // Invalid token signature
      }
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        code: 'REFRESH_EXPIRED',
        message: 'Session expired. Please sign in again.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User no longer exists',
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio || '',
        username: user.username || '',
        website: user.website || '',
        location: user.location || '',
        avatarColor: user.avatarColor || 'blue',
        preferredAiTool: user.preferredAiTool || 'ChatGPT',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user & validate token
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      bio: req.user.bio || '',
      username: req.user.username || '',
      website: req.user.website || '',
      location: req.user.location || '',
      avatarColor: req.user.avatarColor || 'blue',
      preferredAiTool: req.user.preferredAiTool || 'ChatGPT',
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { register, login, refreshToken, getMe };
