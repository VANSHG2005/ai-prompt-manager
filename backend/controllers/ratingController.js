const Prompt = require('../models/Prompt');

// @route PUT /api/prompts/:id/rating
const ratePrompt = async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0 and 5' });
    }

    const prompt = await Prompt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { rating },
      { new: true }
    );
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    res.json({ success: true, message: 'Rating saved', rating: prompt.rating, prompt });
  } catch (err) { next(err); }
};

// @route POST /api/prompts/:id/use  (track copy/usage)
const recordUsage = async (req, res, next) => {
  try {
    await Prompt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $inc: { usageCount: 1 } }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { ratePrompt, recordUsage };
