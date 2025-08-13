const auth = require('../middleware/auth');
const express = require('express');
const Form = require('../models/Form');
const cloudinary = require('../utils/cloudinary');


const upload = require('../utils/parseFormData');
const router = express.Router();


// Multer for file upload (memory only, no disk)
const multer = require('multer');
const memoryUpload = multer({ storage: multer.memoryStorage() });

// Upload an image for a question (Cloudinary, file upload)
router.post('/upload-question-image', auth, memoryUpload.single('questionImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    // Convert buffer to base64
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: 'form-builder/questions',
      resource_type: 'auto',
    });
    res.status(200).json({ imageUrl: uploadResult.secure_url });
  } catch (err) {
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message });
  }
});

// Upload an image for a form header (Cloudinary, file upload)
router.post('/upload-header-image', auth, memoryUpload.single('headerImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    // Convert buffer to base64
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: 'form-builder/headers',
      resource_type: 'auto',
    });
    res.status(200).json({ headerImage: uploadResult.secure_url });
  } catch (err) {
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message });
  }
});


// Create a new form (header image can be base64 or direct URL)
router.post('/', auth, upload.none(), async (req, res) => {
  try {
    const { title, questions, headerImage: headerImageBody } = req.body;
    let headerImage;

    if (headerImageBody && headerImageBody.startsWith('data:')) {
      const uploadResult = await cloudinary.uploader.upload(headerImageBody, {
        folder: 'form-builder/headers',
        resource_type: 'auto',
      });
      headerImage = uploadResult.secure_url;
    } else {
      headerImage = headerImageBody || undefined;
    }

    const form = new Form({
      title,
      headerImage,
      questions: typeof questions === 'string' ? JSON.parse(questions) : questions,
    });

    await form.save();
    res.status(201).json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all forms

// Get all forms (protected)
router.get('/', auth, async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single form by ID (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Update a form (header image can be base64 or direct URL)
router.put('/:id', auth, upload.none(), async (req, res) => {
  try {
    const { title, questions, headerImage: headerImageBody } = req.body;
    const updateData = { title };

    if (questions) {
      updateData.questions = typeof questions === 'string' ? JSON.parse(questions) : questions;
    }

    if (headerImageBody && headerImageBody.startsWith('data:')) {
      const uploadResult = await cloudinary.uploader.upload(headerImageBody, {
        folder: 'form-builder/headers',
        resource_type: 'auto',
      });
      updateData.headerImage = uploadResult.secure_url;
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

// Update a specific question in a form
router.put('/:formId/questions/:questionIndex', auth, async (req, res) => {
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

// Delete a form
router.delete('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    res.json({ message: 'Form deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
