const mongoose = require('mongoose');


const ResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  answers: { type: Array, required: true },
  score: { type: Number, default: 0 }, // total marks obtained
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Response', ResponseSchema);
