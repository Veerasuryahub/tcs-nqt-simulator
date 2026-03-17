const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  options: [String],
  correct_answer: String,
  section: { 
    type: String, 
    required: true,
    enum: ['numerical', 'reasoning', 'verbal', 'programming_logic', 'coding']
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
  }]
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
