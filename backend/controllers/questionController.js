const Question = require('../models/Question');

const getRandomQuestions = async (req, res) => {
  try {
    const config = {
      numerical: 10,
      reasoning: 10,
      verbal: 10,
      programming_logic: 5,
      coding: 2
    };

    const examQuestions = {};
    
    for (const section in config) {
      examQuestions[section] = await Question.aggregate([
        { $match: { section } },
        { $sample: { size: config[section] } }
      ]);
    }

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
