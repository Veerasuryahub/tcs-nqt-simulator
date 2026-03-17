const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testName: { type: String, default: 'TCS NQT Full Mock Test' },
  currentSection: { type: String, default: 'verbal' },
  completedSections: [String],
  sections: [{
    name: String,
    score: { type: Number, default: 0 },
    totalQuestions: Number,
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    timeRemaining: Number,
    status: { type: String, enum: ['pending', 'ongoing', 'completed'], default: 'pending' },
    answers: { type: Map, of: String },
    questions: [{
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      userAnswer: String,
      isCorrect: Boolean,
      timeSpent: Number
    }]
  }],
  totalScore: { type: Number, default: 0 },
  totalAccuracy: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
