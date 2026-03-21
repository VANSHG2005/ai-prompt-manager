const Workflow = require('../models/Workflow');

// @route GET /api/workflows
const getWorkflows = async (req, res, next) => {
  try {
    const workflows = await Workflow.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, count: workflows.length, workflows });
  } catch (err) { next(err); }
};

// @route POST /api/workflows
const createWorkflow = async (req, res, next) => {
  try {
    const { title, description, steps, tags } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });
    if (!steps?.length) return res.status(400).json({ success: false, message: 'At least one step is required' });

    const workflow = await Workflow.create({
      userId: req.user._id,
      title, description,
      steps: steps.map((s, i) => ({ ...s, order: i + 1 })),
      tags: tags || [],
    });
    res.status(201).json({ success: true, message: 'Workflow created', workflow });
  } catch (err) { next(err); }
};

// @route GET /api/workflows/:id
const getWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });
    res.json({ success: true, workflow });
  } catch (err) { next(err); }
};

// @route PUT /api/workflows/:id
const updateWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

    const { title, description, steps, tags } = req.body;
    if (title)       workflow.title       = title;
    if (description !== undefined) workflow.description = description;
    if (steps)       workflow.steps       = steps.map((s, i) => ({ ...s, order: i + 1 }));
    if (tags)        workflow.tags        = tags;

    await workflow.save();
    res.json({ success: true, message: 'Workflow updated', workflow });
  } catch (err) { next(err); }
};

// @route DELETE /api/workflows/:id
const deleteWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (err) { next(err); }
};

// @route POST /api/workflows/:id/run  (increments run counter)
const recordRun = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $inc: { runCount: 1 } },
      { new: true }
    );
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });
    res.json({ success: true, runCount: workflow.runCount });
  } catch (err) { next(err); }
};

module.exports = { getWorkflows, createWorkflow, getWorkflow, updateWorkflow, deleteWorkflow, recordRun };
