const Question = require('../models/Question');
const Submission = require('../models/Submission');

const getQuestionsForUser = async (userId) => {
  const config = {
    verbal: 25,
    reasoning: 20,
    numerical: 20,
    advanced_quant_reasoning: 15,
    coding: 2
  };

  // Find all questionIds already seen by this user
  const previousSubmissions = await Submission.find({ userId }).select('sections.questions.questionId');
  const seenIds = [];
  previousSubmissions.forEach(sub => {
    sub.sections.forEach(sec => {
      sec.questions.forEach(q => seenIds.push(q.questionId));
    });
  });

  const examQuestions = {};
  
  for (const section in config) {
    // 1. Try to find questions NOT seen by user and are [is_previous_nqt_question: true]
    let results = await Question.aggregate([
      { $match: { 
          section, 
          is_previous_nqt_question: true,
          _id: { $nin: seenIds }
        } 
      },
      { $sample: { size: config[section] } }
    ]);

    // 2. If not enough unseen NQT questions, backfill with previously seen NQT questions
    if (results.length < config[section]) {
      const remainingCount = config[section] - results.length;
      const additional = await Question.aggregate([
        { $match: { section, is_previous_nqt_question: true, _id: { $in: seenIds } } },
        { $sample: { size: remainingCount } }
      ]);
      results = [...results, ...additional];
    }

    // 3. Last fallback: random from any in section
    if (results.length < config[section]) {
      const finalRemaining = config[section] - results.length;
      const fallback = await Question.aggregate([
        { $match: { section, _id: { $nin: results.map(r => r._id) } } },
        { $sample: { size: finalRemaining } }
      ]);
      results = [...results, ...fallback];
    }

    examQuestions[section] = results;
  }

  return examQuestions;
};

module.exports = { getQuestionsForUser };
