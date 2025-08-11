const mongoose = require('mongoose');


const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['categorize', 'category', 'cloze', 'comprehension', 'passage'], required: true },
  text: { type: String },
  image: { type: String }, // image path or URL
  options: { type: Array }, // for categorize (image MCQ), cloze, etc.
  answer: { type: mongoose.Schema.Types.Mixed }, // for MCQ/image MCQ
  passage: { type: String }, // for comprehension/passage
  blanks: { type: Array }, // for cloze
  categories: { type: Array }, // for categorize/category
  values: { type: Array }, // for category
  valueToCategory: { type: Array }, // for category (answer key)
  questions: { type: Array }, // for comprehension sub-questions (legacy)
  subQuestions: { type: Array }, // for passage type (array of {text, options, answer})
});
const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  headerImage: { type: String }, // image path or URL
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Form', FormSchema);
