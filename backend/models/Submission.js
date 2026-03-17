const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testName: { type: String, default: 'TCS NQT Full Mock Test' },
  sections: [{
    name: String,
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    wrongAnswers: Number,
    accuracy: Number,
    questions: [{
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      userAnswer: String,
      isCorrect: Boolean,
      timeSpent: Number // in seconds
    }]
  }],
  totalScore: Number,
  totalAccuracy: Number,
  timeTaken: Number, // total time in seconds
  status: { type: String, enum: ['ongoing', 'completed'], default: 'completed' },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
