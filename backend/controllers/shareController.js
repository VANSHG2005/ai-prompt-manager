const Prompt = require('../models/Prompt');
const SharedPrompt = require('../models/SharedPrompt');
const crypto = require('crypto');

// @route POST /api/prompts/:id/share
const createShareLink = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    const { expiresIn, allowCopy = true } = req.body;

    // Revoke any existing share
    await SharedPrompt.findOneAndDelete({ promptId: prompt._id });

    const token = crypto.randomBytes(12).toString('hex');
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : null;

    const share = await SharedPrompt.create({
      promptId: prompt._id,
      userId:   req.user._id,
      shareToken: token,
      expiresAt,
      allowCopy,
    });

    prompt.isShared   = true;
    prompt.shareToken = token;
    await prompt.save();

    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${token}`;
    res.json({ success: true, shareUrl, token, share });
  } catch (err) { next(err); }
};

// @route DELETE /api/prompts/:id/share
const revokeShareLink = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    await SharedPrompt.findOneAndDelete({ promptId: prompt._id });
    prompt.isShared   = false;
    prompt.shareToken = null;
    await prompt.save();

    res.json({ success: true, message: 'Share link revoked' });
  } catch (err) { next(err); }
};

// @route GET /api/share/:token  (PUBLIC — no auth required)
const viewSharedPrompt = async (req, res, next) => {
  try {
    const share = await SharedPrompt.findOne({ shareToken: req.params.token });
    if (!share) return res.status(404).json({ success: false, message: 'Link not found or expired' });

    // Check expiry
    if (share.expiresAt && share.expiresAt < new Date()) {
      await SharedPrompt.findByIdAndDelete(share._id);
      return res.status(410).json({ success: false, message: 'This share link has expired' });
    }

    const prompt = await Prompt.findById(share.promptId).select('-userId');
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    // Increment view count
    share.viewCount += 1;
    await share.save();

    res.json({
      success: true,
      prompt,
      share: {
        viewCount: share.viewCount,
        allowCopy: share.allowCopy,
        expiresAt: share.expiresAt,
        createdAt: share.createdAt,
      },
    });
  } catch (err) { next(err); }
};

// @route GET /api/prompts/:id/share  (get share status)
const getShareStatus = async (req, res, next) => {
  try {
    const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    const share = await SharedPrompt.findOne({ promptId: prompt._id });
    if (!share) return res.json({ success: true, isShared: false });

    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${share.shareToken}`;
    res.json({
      success: true,
      isShared: true,
      shareUrl,
      token: share.shareToken,
      viewCount: share.viewCount,
      expiresAt: share.expiresAt,
      allowCopy: share.allowCopy,
    });
  } catch (err) { next(err); }
};

module.exports = { createShareLink, revokeShareLink, viewSharedPrompt, getShareStatus };
