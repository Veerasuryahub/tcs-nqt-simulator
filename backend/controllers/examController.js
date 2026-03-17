const Submission = require('../models/Submission');
const User = require('../models/User');
const { executeCode } = require('../services/judge0Service');
const { getQuestionsForUser } = require('../utils/questionHelper');

const runCode = async (req, res) => {
  const { source_code, language_id, stdin } = req.body;
  try {
    const result = await executeCode(source_code, language_id, stdin);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Code execution failed' });
  }
};

const getActiveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({ 
      userId: req.user.id, 
      status: 'ongoing' 
    }).populate('sections.questions.questionId');
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const startExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const questions = await getQuestionsForUser(userId);

    const sectionsData = Object.keys(questions).map(sectionName => ({
      name: sectionName,
      totalQuestions: questions[sectionName].length,
      status: sectionName === 'verbal' ? 'ongoing' : 'pending',
      questions: questions[sectionName].map(q => ({
        questionId: q._id,
        userAnswer: null,
        isCorrect: false
      }))
    }));

    const submission = new Submission({
      userId,
      sections: sectionsData,
      currentSection: 'verbal',
      status: 'ongoing'
    });

    await submission.save();
    const populatedSubmission = await Submission.findById(submission._id).populate('sections.questions.questionId');
    res.status(201).json(populatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveProgress = async (req, res) => {
  try {
    const { submissionId, sectionName, answers, timeRemaining, nextSection, timeTaken } = req.body;
    const submission = await Submission.findById(submissionId);

    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    
    // Verify ownership
    if (submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this submission' });
    }

    const section = submission.sections.find(s => s.name === sectionName);
    if (section) {
      section.answers = answers;
      section.timeRemaining = timeRemaining;
      
      // Update each question record
      section.questions.forEach(q => {
        if (answers[q.questionId]) {
          q.userAnswer = answers[q.questionId];
        }
      });
    }

    if (timeTaken !== undefined) {
      submission.timeTaken = timeTaken;
    }

    if (nextSection) {
      submission.currentSection = nextSection;
      if (!submission.completedSections.includes(sectionName)) {
        submission.completedSections.push(sectionName);
      }
      const nextSec = submission.sections.find(s => s.name === nextSection);
      if (nextSec) nextSec.status = 'ongoing';
      if (section) section.status = 'completed';
    }

    await submission.save();
    res.json({ message: 'Progress saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitExam = async (req, res) => {
  try {
    const { submissionId, timeTaken } = req.body;
    const submission = await Submission.findById(submissionId).populate('sections.questions.questionId');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Verify ownership
    if (submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to submit this submission' });
    }

    let totalScore = 0;
    let totalCorrect = 0;
    let totalQs = 0;

    submission.sections.forEach(section => {
      let sectionCorrect = 0;
      section.questions.forEach(q => {
        totalQs++;
        const questionData = q.questionId;
        if (q.userAnswer === questionData.correct_answer) {
          q.isCorrect = true;
          sectionCorrect++;
        }
      });
      section.correctAnswers = sectionCorrect;
      section.wrongAnswers = section.totalQuestions - sectionCorrect;
      section.score = sectionCorrect * 2; // Assuming 2 points per correct answer
      section.accuracy = (sectionCorrect / section.totalQuestions) * 100;
      section.status = 'completed';
      
      totalScore += section.score;
      totalCorrect += sectionCorrect;
    });

    submission.totalScore = totalScore;
    submission.totalAccuracy = (totalCorrect / totalQs) * 100;
    submission.timeTaken = timeTaken;
    submission.status = 'completed';
    submission.completedAt = new Date();

    await submission.save();

    // Update user history and analytics
    const user = await User.findById(submission.userId);
    user.history.push({
      testId: submission._id,
      score: totalScore
    });

    user.analytics.totalTests += 1;
    user.analytics.avgScore = ((user.analytics.avgScore * (user.analytics.totalTests - 1)) + totalScore) / user.analytics.totalTests;
    user.analytics.progress.push({ date: new Date(), score: totalScore });

    await user.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      { $match: { status: 'completed' } },
      { $group: { 
          _id: '$userId', 
          maxScore: { $max: '$totalScore' },
          avgAccuracy: { $avg: '$totalAccuracy' }
        }
      },
      { $sort: { maxScore: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: {
          name: '$user.name',
          score: '$maxScore',
          accuracy: '$avgAccuracy'
        }
      }
    ]);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActiveSubmission, startExam, saveProgress, submitExam, runCode, getHistory, getLeaderboard };
