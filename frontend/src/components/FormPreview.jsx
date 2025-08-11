import React, { useEffect, useState, useCallback } from 'react';
import { getForm, submitResponse } from '../api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const FormPreview = ({ formId, onBack }) => {
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [dragOptions, setDragOptions] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getForm(formId).then(res => {
      const fetchedForm = res.data;
      setForm(fetchedForm);

      // Init answers
      setAnswers(fetchedForm.questions.map(q => {
        if (q.type === 'cloze') {
          return Array((q.text.match(/_____/g) || []).length).fill(null);
        } else if ((q.type === 'categorize' || q.type === 'category') && q.values) {
          const state = { pool: [] };
          q.categories?.forEach((_, i) => { state[i] = []; });
          q.values?.forEach((_, i) => { state.pool.push(i); });
          return state;
        } else {
          return '';
        }
      }));

      // Init drag options
      setDragOptions(fetchedForm.questions.map(q => 
        q.type === 'cloze' ? shuffleArray([...(q.options || []).filter(Boolean)]) : []
      ));
    });
  }, [formId]);

  const shuffleArray = (arr) => arr.slice().sort(() => Math.random() - 0.5);

  const handleChange = useCallback((idx, value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[idx] = value;
      return newAnswers;
    });
  }, []);

  // Single DragEnd handler
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    const [qType, qIdxStr] = draggableId.split('__');
    const qIdx = parseInt(qIdxStr, 10);
    const question = form.questions[qIdx];

    if (question.type === 'cloze') {
      const blankCount = question.blanks.length;

      // Cloze logic
      if (source.droppableId === `options-${qIdx}` && destination.droppableId.startsWith(`blank-${qIdx}-`)) {
        const blankIdx = parseInt(destination.droppableId.split('-').pop(), 10);
        const option = dragOptions[qIdx][source.index];
        setAnswers(prev => {
          const newAnswers = prev.map((a, i) => i === qIdx ? [...a] : a);
          newAnswers[qIdx][blankIdx] = option;
          return newAnswers;
        });
        setDragOptions(prev => prev.map((opts, i) => i === qIdx ? opts.filter((_, idx) => idx !== source.index) : opts));
      } 
      else if (source.droppableId.startsWith(`blank-${qIdx}-`) && destination.droppableId.startsWith(`blank-${qIdx}-`)) {
        const fromIdx = parseInt(source.droppableId.split('-').pop(), 10);
        const toIdx = parseInt(destination.droppableId.split('-').pop(), 10);
        setAnswers(prev => {
          const newAnswers = prev.map((a, i) => i === qIdx ? [...a] : a);
          [newAnswers[qIdx][fromIdx], newAnswers[qIdx][toIdx]] = [newAnswers[qIdx][toIdx], newAnswers[qIdx][fromIdx]];
          return newAnswers;
        });
      } 
      else if (source.droppableId.startsWith(`blank-${qIdx}-`) && destination.droppableId === `options-${qIdx}`) {
        const blankIdx = parseInt(source.droppableId.split('-').pop(), 10);
        const option = answers[qIdx][blankIdx];
        if (!option) return;
        setAnswers(prev => {
          const newAnswers = prev.map((a, i) => i === qIdx ? [...a] : a);
          newAnswers[qIdx][blankIdx] = null;
          return newAnswers;
        });
        setDragOptions(prev => prev.map((opts, i) => i === qIdx ? [...opts, option] : opts));
      }
    } 
    else if (question.type === 'categorize' || question.type === 'category') {
      const getListKey = (droppableId) => {
        if (droppableId === `cat-pool-${qIdx}`) return 'pool';
        if (droppableId.startsWith(`cat-${qIdx}-`)) return parseInt(droppableId.split('-').pop(), 10);
        return null;
      };
      const srcKey = getListKey(source.droppableId);
      const destKey = getListKey(destination.droppableId);
      if (srcKey == null || destKey == null) return;

      setAnswers(prev => {
        const newAns = { ...prev[qIdx], [srcKey]: [...prev[qIdx][srcKey]], [destKey]: [...prev[qIdx][destKey]] };
        const valueIdx = newAns[srcKey][source.index];
        newAns[srcKey].splice(source.index, 1);
        newAns[destKey].splice(destination.index, 0, valueIdx);
        return prev.map((a, i) => i === qIdx ? newAns : a);
      });
    }
  }, [answers, dragOptions, form]);

  const handleSubmit = async () => {
    await submitResponse({ formId, answers });
    setSubmitted(true);
  };

  if (!form) return <div>Loading...</div>;
  if (submitted) return <div className="p-4">Thank you for your response!</div>;

  // Hide back button if onBack is not provided
  return (
    <div className="p-8 max-w-2xl w-full min-w-[700px] mx-auto bg-white/80 rounded-3xl shadow-2xl border border-blue-100 mt-8 mb-8">
      {onBack && (
        <button className="mb-6 text-blue-600 font-semibold hover:underline" onClick={onBack}>← Back</button>
      )}
      <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 drop-shadow-lg tracking-tight">{form.title}</h2>
      {form.headerImage && (
        <img
          src={form.headerImage.startsWith('/uploads/') ? `http://localhost:5000${form.headerImage}` : form.headerImage}
          alt="Header"
          className="mb-6 max-h-56 rounded-xl shadow"
        />
      )}
      <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          {form.questions.map((q, idx) => (
            <Question
              key={idx}
              idx={idx}
              q={q}
              answers={answers}
              dragOptions={dragOptions}
              handleChange={handleChange}
            />
          ))}
        </DragDropContext>
        <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-green-600 hover:to-blue-600 transition mt-8 w-full text-lg" type="submit">Submit</button>
      </form>
    </div>
  );
};

// Memoized Question component
const Question = React.memo(({ q, idx, answers, dragOptions, handleChange }) => {
  // Early return for image MCQ (categorize)
  if (
    q.type === "categorize" &&
    (!q.categories || q.categories.length === 0) &&
    (!q.values || q.values.length === 0)
  ) {
    return (
      <div className="mb-8 border border-blue-100 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 shadow-md">
        <div className="font-semibold mb-1">{q.text}</div>
        {q.image && (
          <img
            src={q.image.startsWith("/uploads/") ? `http://localhost:5000${q.image}` : q.image}
            alt="Q"
            className="mb-2 max-h-24"
          />
        )}
        {q.options?.length > 0 && (
          <div className="flex flex-col gap-2 w-full mt-2 mb-2">
            {q.options.map((opt, i) => (
              <label
                key={i}
                className="flex items-center mb-1 bg-white border border-blue-100 rounded-lg px-4 py-2 shadow-sm cursor-pointer transition hover:bg-blue-50 text-left w-full"
              >
                <input
                  type="radio"
                  name={`q${idx}`}
                  checked={answers[idx] === i}
                  onChange={() => handleChange(idx, i)}
                  className="mr-3 accent-blue-500"
                />
                <span className="text-base break-words">{opt}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default rendering for other types
  return (
    <div className="mb-8 border border-blue-100 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 shadow-md">
      <div className="font-semibold mb-1">{q.text}</div>
      {q.image && (
        <img
          src={q.image.startsWith("/uploads/") ? `http://localhost:5000${q.image}` : q.image}
          alt="Q"
          className="mb-2 max-h-24"
        />
      )}
      {/* Only fallback input for unknown types, remove invalid placeholders */}
      {!['cloze', 'categorize', 'category', 'comprehension'].includes(q.type) && (
        <input className="border p-1 w-full" placeholder="Your answer" value={answers[idx]} onChange={e => handleChange(idx, e.target.value)} />
      )}
    </div>
  );
});

export default FormPreview;
