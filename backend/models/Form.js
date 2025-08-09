const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['categorize', 'cloze', 'comprehension'], required: true },
  text: { type: String, required: true },
  image: { type: String }, // image path or URL
  options: { type: Array }, // for categorize, cloze, etc.
  passage: { type: String }, // for comprehension
  blanks: { type: Array }, // for cloze
  categories: { type: Array }, // for categorize
  questions: { type: Array }, // for comprehension sub-questions
});

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  headerImage: { type: String }, // image path or URL
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Form', FormSchema);
