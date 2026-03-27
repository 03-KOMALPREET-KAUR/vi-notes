const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    default: "" 
  },
  wordCount: { 
    type: Number, 
    default: 0 
  },
  charCount: { 
    type: Number, 
    default: 0 
  },
  duration: { 
    type: Number, 
    default: 0 
  },
  keystrokeTimings: [{ 
    type: Number 
  }],
  avgPause: { 
    type: Number, 
    default: 0 
  },
  pasteEvents: [{
    at: { type: Number },
    charsAdded: { type: Number },
  }],
  pasteCount: { 
    type: Number, 
    default: 0 
  },
  authenticityScore: { 
    type: Number, 
    default: 100 
  },
  startTime: { 
    type: Date 
  },
  endTime: { 
    type: Date 
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);