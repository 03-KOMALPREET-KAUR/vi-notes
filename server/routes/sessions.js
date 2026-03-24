const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect } = require('../middleware/authMiddleware');

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

router.get('/my', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;