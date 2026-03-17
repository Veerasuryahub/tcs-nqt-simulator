const express = require('express');
const { submitExam, runCode, getHistory, getLeaderboard } = require('../controllers/examController');
const { auth } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/submit', auth, submitExam);
router.post('/run-code', auth, runCode);
router.get('/history', auth, getHistory);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
