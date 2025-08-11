const express = require('express');
const multer = require('multer');
const Form = require('../models/Form');
const path = require('path');

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });


// Upload an image for a question
router.post('/upload-question-image', upload.single('questionImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Create a new form
router.post('/', upload.single('headerImage'), async (req, res) => {
  try {
    const { title, questions, headerImage: headerImageBody } = req.body;
    let headerImage = undefined;
    if (req.file) {
      headerImage = `/uploads/${req.file.filename}`;
    } else if (headerImageBody) {
      headerImage = headerImageBody;
    }
    const form = new Form({
      title,
      headerImage,
      questions: JSON.parse(questions)
    });
    await form.save();
    res.status(201).json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all forms
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update a form
router.put('/:id', upload.single('headerImage'), async (req, res) => {
  try {
    const { title, questions, headerImage: headerImageBody } = req.body;
    const updateData = { title };
    if (questions) updateData.questions = JSON.parse(questions);
    if (req.file) {
      updateData.headerImage = `/uploads/${req.file.filename}`;
    } else if (headerImageBody) {
      updateData.headerImage = headerImageBody;
    }
    const form = await Form.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a form
router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json({ message: 'Form deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a question in a form
router.put('/:formId/questions/:questionIndex', async (req, res) => {
  try {
    const { formId, questionIndex } = req.params;
    const { question } = req.body;
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    if (!form.questions[questionIndex]) return res.status(404).json({ error: 'Question not found' });
    form.questions[questionIndex] = question;
    await form.save();
    res.json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a question in a form
router.delete('/:formId/questions/:questionIndex', async (req, res) => {
  try {
    const { formId, questionIndex } = req.params;
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    if (!form.questions[questionIndex]) return res.status(404).json({ error: 'Question not found' });
    form.questions.splice(questionIndex, 1);
    await form.save();
    res.json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
