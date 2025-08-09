const express = require('express');
const Response = require('../models/Response');

const router = express.Router();

// Submit a response
router.post('/', async (req, res) => {
  try {
    const { formId, answers } = req.body;
    const response = new Response({ formId, answers });
    await response.save();
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all responses for a form
router.get('/form/:formId', async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get a single response by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    if (!response) return res.status(404).json({ error: 'Response not found' });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a response by ID
router.delete('/:id', async (req, res) => {
  try {
    const response = await Response.findByIdAndDelete(req.params.id);
    if (!response) return res.status(404).json({ error: 'Response not found' });
    res.json({ message: 'Response deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
