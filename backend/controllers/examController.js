const Submission = require('../models/Submission');
const User = require('../models/User');
const { executeCode } = require('../services/judge0Service');

const runCode = async (req, res) => {
  const { source_code, language_id, stdin } = req.body;
  try {
    const result = await executeCode(source_code, language_id, stdin);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Code execution failed' });
  }
};

const submitExam = async (req, res) => {
  try {
    const { sections, totalScore, totalAccuracy, timeTaken } = req.body;
    const userId = req.user.id;

    const submission = new Submission({
      userId,
      sections,
      totalScore,
      totalAccuracy,
      timeTaken
    });

    await submission.save();

    // Update user history and analytics
    const user = await User.findById(userId);
    user.history.push({
      testId: submission._id,
      score: totalScore
    });

    user.analytics.totalTests += 1;
    user.analytics.avgScore = ((user.analytics.avgScore * (user.analytics.totalTests - 1)) + totalScore) / user.analytics.totalTests;
    user.analytics.progress.push({ date: new Date(), score: totalScore });

    await user.save();

    res.status(201).json(submission);
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

module.exports = { submitExam, runCode, getHistory, getLeaderboard };
