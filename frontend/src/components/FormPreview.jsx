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

    // For categorization, draggableId is 'cat-val-<qIdx>-<valIdx>'
    let qIdx, valIdx;
    if (draggableId.startsWith('cat-val-')) {
      // Format: cat-val-<qIdx>-<valIdx>
      const parts = draggableId.split('-');
      qIdx = parseInt(parts[2], 10);
      valIdx = parseInt(parts[3], 10);
    } else {
      // For cloze: <qType>__<qIdx>
      const [qType, qIdxStr] = draggableId.split('__');
      qIdx = parseInt(qIdxStr, 10);
    }
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
      // For categorization, move valueIdx from source list to destination list
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
        // Remove valueIdx from srcKey list (by index)
        const movedValIdx = newAns[srcKey][source.index];
        newAns[srcKey].splice(source.index, 1);
        // Prevent duplicate: remove from destKey if already present
        const existingIdx = newAns[destKey].indexOf(movedValIdx);
        if (existingIdx !== -1) newAns[destKey].splice(existingIdx, 1);
        // Insert into destKey at destination.index
        newAns[destKey].splice(destination.index, 0, movedValIdx);
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
  // Categorization drag-and-drop preview for 'category' and 'categorize' with categories/values
  if ((q.type === 'category' || q.type === 'categorize') && q.categories && q.categories.length > 0 && q.values && q.values.length > 0) {
    const state = answers[idx];
    return (
      <div className="mb-8 border border-blue-100 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 shadow-md relative">
        {/* Serial number */}
        <div className="absolute left-2 top-2 flex items-center justify-center w-12 h-12 text-lg font-bold text-blue-500 bg-white/90 rounded-lg shadow select-none border border-blue-200 z-20">
          {idx + 1}.
        </div>
        {/* Marks */}
        <div className="absolute right-6 top-4 text-base font-bold text-green-600 bg-white/80 px-3 py-1 rounded shadow">{q.marks ? `${q.marks} mark${q.marks > 1 ? 's' : ''}` : ''}</div>
        <div style={{ marginLeft: '56px' }}>
          <div className="font-semibold mb-1 mt-2">{q.text}</div>
          <div className="flex flex-row flex-wrap gap-4 mt-4 items-stretch w-full">
          {/* Pool of values to drag */}
          <Droppable droppableId={`cat-pool-${idx}`} direction="vertical">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-w-[180px] grow bg-white/70 border border-blue-200 rounded-xl p-3 shadow-inner ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400' : ''}`}
              >
                <div className="font-semibold text-blue-500 mb-2">Pool</div>
                {state.pool.map((valIdx, i) => (
                  <Draggable key={valIdx} draggableId={`cat-val-${idx}-${valIdx}`} index={i}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg shadow cursor-move select-none ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                      >
                        {q.values[valIdx]}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {/* Category blocks */}
          {q.categories.map((cat, catIdx) => (
            <Droppable key={catIdx} droppableId={`cat-${idx}-${catIdx}`} direction="vertical">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-w-[180px] grow bg-white/70 border border-purple-200 rounded-xl p-3 shadow-inner ${snapshot.isDraggingOver ? 'ring-2 ring-purple-400' : ''}`}
                >
                  <div className="font-semibold text-purple-500 mb-2">{cat}</div>
                  {state[catIdx].map((valIdx, i) => (
                    <Draggable key={valIdx} draggableId={`cat-val-${idx}-${valIdx}`} index={i}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg shadow cursor-move select-none ${snapshot.isDragging ? 'ring-2 ring-purple-400' : ''}`}
                        >
                          {q.values[valIdx]}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
        </div>
      </div>
    );
  }

  // Default rendering for other types
  return (
    <div className="mb-8 border border-blue-100 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 shadow-md relative">
      {/* Serial number */}
      <div className="absolute left-2 top-2 flex items-center justify-center w-12 h-12 text-lg font-bold text-blue-500 bg-white/90 rounded-lg shadow select-none border border-blue-200 z-20">
        {idx + 1}.
      </div>
      {/* Marks */}
      <div className="absolute right-6 top-4 text-base font-bold text-green-600 bg-white/80 px-3 py-1 rounded shadow">{q.marks ? `${q.marks} mark${q.marks > 1 ? 's' : ''}` : ''}</div>
      <div style={{ marginLeft: '56px' }}>
        <div className="font-semibold mb-1 mt-2">{q.text}</div>
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
    </div>
  );
});

export default FormPreview;
