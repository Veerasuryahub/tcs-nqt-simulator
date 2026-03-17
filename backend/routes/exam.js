const express = require('express');
const { getActiveSubmission, startExam, saveProgress, submitExam, runCode, getHistory, getLeaderboard } = require('../controllers/examController');
const { auth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/active', auth, getActiveSubmission);
router.post('/start', auth, startExam);
router.post('/save-progress', auth, saveProgress);
router.post('/submit', auth, submitExam);
router.post('/run-code', auth, runCode);
router.get('/history', auth, getHistory);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
