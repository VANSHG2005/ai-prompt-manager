const User = require('../models/User');
const Prompt = require('../models/Prompt');

// @desc  Get user profile
// @route GET /api/user/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      username: user.username,
      website: user.website,
      location: user.location,
      avatarColor: user.avatarColor,
      preferredAiTool: user.preferredAiTool,
      createdAt: user.createdAt,
    },
  });
};

// @desc  Update user profile
// @route PUT /api/user/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, password, newPassword, bio, username, website, location, avatarColor, preferredAiTool } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (fullName)        user.fullName = fullName;
    if (bio !== undefined)      user.bio = bio;
    if (username !== undefined) user.username = username;
    if (website !== undefined)  user.website = website;
    if (location !== undefined) user.location = location;
    if (avatarColor)     user.avatarColor = avatarColor;
    if (preferredAiTool) user.preferredAiTool = preferredAiTool;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already in use' });
      user.email = email;
    }

    if (password && newPassword) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      user.password = newPassword;
    }

    await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id, fullName: user.fullName, email: user.email,
        bio: user.bio, username: user.username, website: user.website,
        location: user.location, avatarColor: user.avatarColor,
        preferredAiTool: user.preferredAiTool,
      },
    });
  } catch (error) { next(error); }
};

// @desc  Get user activity stats
// @route GET /api/user/stats
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const total = await Prompt.countDocuments({ userId });
    const favorites = await Prompt.countDocuments({ userId, isFavorite: true });
    const categories = await Prompt.distinct('category', { userId });
    const aiTools = await Prompt.distinct('aiTool', { userId });

    // Prompts created per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const activity = await Prompt.aggregate([
      { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Most used tags
    const topTags = await Prompt.aggregate([
      { $match: { userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Category breakdown
    const categoryBreakdown = await Prompt.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: { total, favorites, categoryCount: categories.length, aiToolCount: aiTools.length, activity, topTags, categoryBreakdown },
    });
  } catch (error) { next(error); }
};

// @desc  Delete account
// @route DELETE /api/user/account
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password' });

    await Prompt.deleteMany({ userId: req.user._id });
    await User.findByIdAndDelete(req.user._id);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) { next(error); }
};

module.exports = { getProfile, updateProfile, getUserStats, deleteAccount };
