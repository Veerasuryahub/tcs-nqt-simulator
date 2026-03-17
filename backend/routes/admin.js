const express = require('express');
const { addQuestion, getAllQuestions, importQuestions } = require('../controllers/questionController');
const { auth, adminAuth } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/questions', auth, adminAuth, addQuestion);
router.get('/questions', auth, adminAuth, getAllQuestions);
router.post('/questions/import', auth, adminAuth, importQuestions);

module.exports = router;
