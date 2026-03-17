const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  options: [String],
  correct_answer: String,
  section: { 
    type: String, 
    required: true,
    enum: ['numerical', 'reasoning', 'verbal', 'advanced_quant_reasoning', 'coding']
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  explanation: String,
  tags: [String],
  // For coding questions
  code_templates: {
    python: String,
    cpp: String,
    java: String
  },
  test_cases: [{
    input: String,
    expected_output: String,
    is_hidden: { type: Boolean, default: false }
  }],
  is_previous_nqt_question: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
