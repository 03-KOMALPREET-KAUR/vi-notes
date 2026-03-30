const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, async (req, res) => {
  const {
    text, wordCount, charCount, duration,
    keystrokeTimings, avgPause,
    pasteEvents, pasteCount,
    startTime, endTime,
  } = req.body;

  try {
    const session = await Session.create({
      userId: req.user._id,
      text,
      wordCount, 
      charCount, 
      duration,
      keystrokeTimings, 
      avgPause,
      pasteEvents, 
      pasteCount,
      startTime, 
      endTime,
    });
    res.status(201).json(session);
  } catch (err) {
    console.error("Session Save Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});


router.get('/my', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/clear-all', protect, async (req, res) => {
  try {
    const result = await Session.deleteMany({ userId: req.user._id });
    res.json({ message: 'All history cleared.', count: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});


router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    await session.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;