
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
    if (headerImage) {
      data.append('headerImage', headerImage);
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
    <div className="p-8 max-w-3xl mx-auto bg-white/80 rounded-3xl shadow-2xl border border-blue-100 mt-8 mb-8">
      <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 drop-shadow-lg tracking-tight">{formId ? 'Edit' : 'Create'} Form</h2>
      <input
        className="border border-blue-100 p-3 mb-4 w-full rounded-xl text-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Form Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <div className="mb-8">
        <label className="block mb-2 font-semibold text-gray-700">Header Image</label>
        <div className="relative inline-block mb-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleHeaderImage}
            id="headerImageInput"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <label htmlFor="headerImageInput" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-lg font-bold shadow hover:from-blue-600 hover:to-purple-600 transition cursor-pointer block text-center">
            Choose Image
          </label>
        </div>
        {headerImage && (
          <img
            src={headerImage.startsWith('/uploads/') ? `http://localhost:5000${headerImage}` : headerImage}
            alt="Header"
            className="mt-2 max-h-40 rounded-xl shadow"
          />
        )}
      </div>
      <div>
        <h3 className="font-bold mb-4 text-xl text-blue-700">Questions</h3>
        {questions.map((q, idx) => (
          <div key={idx} className="border border-blue-100 p-6 mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 shadow-md relative">
            <div className="absolute top-4 right-4">
              <button className="text-red-500 font-bold text-lg hover:scale-110 transition" onClick={() => removeQuestion(idx)} title="Remove">&times;</button>
            </div>
            <select
              className="border border-blue-100 p-2 mb-3 rounded-lg text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="border border-blue-100 p-2 mb-3 w-full rounded-lg text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Question text"
              value={q.text}
              onChange={e => updateQuestion(idx, 'text', e.target.value)}
            />
            {q.image && (
              <img
                src={q.image.startsWith('/uploads/') ? `http://localhost:5000${q.image}` : q.image}
                alt="Question"
                className="mb-2 max-h-24 rounded shadow"
              />
            )}
            <QuestionAdvancedUI
              q={q}
              idx={idx}
              updateQuestion={updateQuestion}
              handleQuestionImage={handleQuestionImage}
            />
          </div>
        ))}
        <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition" onClick={addQuestion}>Add Question</button>
      </div>
      <div className="mt-8 flex gap-4 justify-end">
        <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-green-600 hover:to-blue-600 transition" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        <button className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold shadow hover:bg-gray-400 transition" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default FormEditor;
