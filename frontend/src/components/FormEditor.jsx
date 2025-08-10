
import React, { useState } from 'react';
import { createForm, updateForm, uploadHeaderImage, uploadQuestionImage, getForm } from '../api';
import QuestionAdvancedUI from './QuestionAdvancedUI';

const defaultQuestion = { type: 'categorize', text: '', image: '', options: [], passage: '', blanks: [], categories: [], questions: [], subQuestions: [] };

const FormEditor = ({ formId, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [headerImage, setHeaderImage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (formId) {
      getForm(formId).then(res => {
        setTitle(res.data.title);
        setHeaderImage(res.data.headerImage || '');
        setQuestions(res.data.questions || []);
      });
    }
  }, [formId]);

  const handleHeaderImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await uploadHeaderImage(file);
    setHeaderImage(res.data.headerImage || res.data.imageUrl);
  };

  const handleQuestionImage = async (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await uploadQuestionImage(file);
    const newQuestions = [...questions];
    newQuestions[idx].image = res.data.imageUrl;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    setLoading(true);
    const data = new FormData();
    data.append('title', title);
    data.append('questions', JSON.stringify(questions));
    if (headerImage && headerImage.startsWith('blob:')) {
      // Already uploaded
    } else if (headerImage) {
      // If headerImage is a file, append it
      // Not needed, handled by uploadHeaderImage
    }
    if (formId) {
      await updateForm(formId, data);
    } else {
      await createForm(data);
    }
    setLoading(false);
    onSave && onSave();
  };

  const addQuestion = () => setQuestions([...questions, { ...defaultQuestion }]);
  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));
  const updateQuestion = (idx, field, value) => {
    const newQuestions = [...questions];
    newQuestions[idx][field] = value;
    setQuestions(newQuestions);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{formId ? 'Edit' : 'Create'} Form</h2>
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Form Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <div className="mb-4">
        <label className="block mb-1">Header Image</label>
        <input type="file" accept="image/*" onChange={handleHeaderImage} />
        {headerImage && <img src={headerImage} alt="Header" className="mt-2 max-h-32" />}
      </div>
      <div>
        <h3 className="font-semibold mb-2">Questions</h3>
        {questions.map((q, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
            <select
              className="border p-1 mb-1"
              value={q.type}
              onChange={e => updateQuestion(idx, 'type', e.target.value)}
            >
              <option value="categorize">Image MCQ</option>
              <option value="category">Categorization</option>
              <option value="cloze">Fill in the Blank</option>
              <option value="comprehension">Normal MCQ</option>
              <option value="passage">Comprehension (Passage + Questions)</option>
            </select>
            <input
              className="border p-1 mb-1 w-full"
              placeholder="Question text"
              value={q.text}
              onChange={e => updateQuestion(idx, 'text', e.target.value)}
            />
            <QuestionAdvancedUI
              q={q}
              idx={idx}
              updateQuestion={updateQuestion}
              handleQuestionImage={handleQuestionImage}
            />
            <button className="text-red-600 mt-2" onClick={() => removeQuestion(idx)}>Remove</button>
          </div>
        ))}
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={addQuestion}>Add Question</button>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default FormEditor;
