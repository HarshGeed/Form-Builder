const express = require('express');
const Response = require('../models/Response');

const router = express.Router();

// Submit a response
router.post('/', async (req, res) => {
  try {
    const { formId, answers } = req.body;
    // Fetch form to get questions and correct answers
    const Form = require('../models/Form');
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    let score = 0;
    const processedAnswers = form.questions.map((q, idx) => {
      const userAns = answers[idx];
      let answerToStore = userAns;
      let correct = false;
      // MCQ/image MCQ: store value, check correctness
      if ((q.type === 'categorize' || q.type === 'comprehension') && Array.isArray(q.options)) {
        // userAns is index or value; store value
        let userVal = typeof userAns === 'number' ? q.options[userAns] : userAns;
        answerToStore = userVal;
        if (q.answer !== undefined && userVal === q.options[q.answer]) correct = true;
      } else if (q.type === 'cloze' && Array.isArray(q.answer)) {
        // userAns is array of indices or values; store values
        if (Array.isArray(userAns)) {
          answerToStore = userAns.map((ua, i) => {
            if (typeof ua === 'number' && Array.isArray(q.options)) {
              return q.options[ua];
            }
            return ua;
          });
          correct = answerToStore.every((v, i) => v === q.answer[i]);
        }
      } else if ((q.type === 'category' || q.type === 'categorize') && Array.isArray(q.valueToCategory)) {
        // userAns is {pool, 0:[], 1:[], ...}; store value mapping
        let userMap = [];
        let valueToCat = [];
        if (userAns && typeof userAns === 'object') {
          Object.entries(userAns).forEach(([key, arr]) => {
            if (key !== 'pool' && Array.isArray(arr)) {
              arr.forEach(valIdx => {
                valueToCat[valIdx] = Number(key);
                userMap.push(Number(key));
              });
            }
          });
        }
        // Store as array of { value, category }
        answerToStore = (q.values || []).map((val, i) => ({ value: val, category: typeof valueToCat[i] === 'number' ? (q.categories ? q.categories[valueToCat[i]] : valueToCat[i]) : null }));
        // Compare to correct mapping
        correct = JSON.stringify(userMap) === JSON.stringify(q.valueToCategory);
      }
      if (correct && q.marks) score += q.marks;
      return answerToStore;
    });

    const response = new Response({ formId, answers: processedAnswers, score });
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
