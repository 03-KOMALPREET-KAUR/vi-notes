const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect } = require('../middleware/authMiddleware');

// 1. SAVE SESSION
router.post('/save', protect, async (req, res) => {
  const {
    wordCount, charCount, duration,
    keystrokeTimings, avgPause,
    pasteEvents, pasteCount,
    startTime, endTime,
  } = req.body;
  try {
    const session = await Session.create({
      userId: req.user._id,
      wordCount, charCount, duration,
      keystrokeTimings, avgPause,
      pasteEvents, pasteCount,
      startTime, endTime,
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL MY SESSIONS
router.get('/my', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DELETE ROUTES (Order is critical here) ---

// 3. DELETE ALL SESSIONS (Must be ABOVE /:id)
router.delete('/clear-all', protect, async (req, res) => {
  try {
    const result = await Session.deleteMany({ userId: req.user._id });
    res.json({ message: 'All forensic history cleared.', count: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE SINGLE SESSION
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });

    if (!session) {
      return res.status(404).json({ message: 'Forensic session not found or unauthorized.' });
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;