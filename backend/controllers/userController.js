const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user/profile
const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

// @desc    Update user profile
// @route   PUT /api/user/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, password, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (fullName) user.fullName = fullName;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }

    if (password && newPassword) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
