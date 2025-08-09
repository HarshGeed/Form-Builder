const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  answers: { type: Array, required: true },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Response', ResponseSchema);
