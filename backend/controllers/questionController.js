const Question = require('../models/Question');
const { getQuestionsForUser } = require('../utils/questionHelper');

const getRandomQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const examQuestions = await getQuestionsForUser(userId);
    res.json(examQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { importFromOpenTrivia } = require('../utils/importer');

const importQuestions = async (req, res) => {
  try {
    const count = await importFromOpenTrivia(req.query.amount || 10);
    res.json({ message: `Successfully imported ${count} questions` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRandomQuestions, addQuestion, getAllQuestions, importQuestions };
