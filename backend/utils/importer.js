const axios = require('axios');
const Question = require('../models/Question');

const importFromOpenTrivia = async (amount = 10, category = 18) => { // 18 is Science: Computers
  try {
    const res = await axios.get(`https://opentdb.com/api.php?amount=${amount}&category=${category}&type=multiple`);
    const results = res.data.results;
    
    const questions = results.map(q => ({
      question_text: decodeURIComponent(q.question),
      options: [...q.incorrect_answers.map(decodeURIComponent), decodeURIComponent(q.correct_answer)].sort(() => Math.random() - 0.5),
      correct_answer: decodeURIComponent(q.correct_answer),
      section: 'programming_logic',
      difficulty: q.difficulty,
      explanation: 'Imported from Open Trivia DB',
      tags: ['external', 'trivia']
    }));

    await Question.insertMany(questions);
    return questions.length;
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};

module.exports = { importFromOpenTrivia };
