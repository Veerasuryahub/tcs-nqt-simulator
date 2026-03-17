const express = require('express');
const { getRandomQuestions, getAllQuestions } = require('../controllers/questionController');
const { auth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/random', auth, getRandomQuestions);
router.get('/all', auth, getAllQuestions);

module.exports = router;
