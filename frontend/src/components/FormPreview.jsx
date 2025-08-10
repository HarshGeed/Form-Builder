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

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button className="mb-4 text-blue-600" onClick={onBack}>Back</button>
      <h2 className="text-2xl font-bold mb-2">{form.title}</h2>
      {form.headerImage && <img src={form.headerImage} alt="Header" className="mb-4 max-h-40" />}
      
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
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">Submit</button>
      </form>
    </div>
  );
};

// Memoized Question component
const Question = React.memo(({ q, idx, answers, dragOptions, handleChange }) => {
  return (
    <div className="mb-4 border p-2 rounded">
      <div className="font-semibold mb-1">{q.text}</div>
      {q.image && <img src={q.image} alt="Q" className="mb-2 max-h-24" />}

      {q.type === 'cloze' && q.blanks?.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {q.text.split('_____').map((part, i) => (
              <React.Fragment key={i}>
                <span>{part}</span>
                {i < q.blanks.length && (
                  <Droppable droppableId={`blank-${idx}-${i}`} direction="vertical">
                    {(provided, snapshot) => (
                      <span
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`inline-block min-w-[60px] min-h-[32px] border-b-2 border-blue-400 mx-1 px-1 align-middle bg-white ${snapshot.isDraggingOver ? 'bg-blue-100' : ''}`}
                      >
                        {answers[idx]?.[i] && (
                          <Draggable draggableId={`cloze__${idx}__${i}`} index={0}>
                            {(provided) => (
                              <span
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="inline-block px-2 py-1 bg-blue-200 rounded cursor-move"
                              >
                                {answers[idx][i]}
                              </span>
                            )}
                          </Draggable>
                        )}
                        {provided.placeholder}
                      </span>
                    )}
                  </Droppable>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mb-2">
            <div className="font-semibold text-sm mb-1">Options:</div>
            <Droppable droppableId={`options-${idx}`} direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-wrap gap-2 min-h-[40px] ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                >
                  {dragOptions[idx]?.map((opt, i) => (
                    <Draggable key={`opt-${idx}-${i}`} draggableId={`cloze__${idx}__opt-${i}`} index={i}>
                      {(provided) => (
                        <span
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="inline-block px-2 py-1 bg-blue-100 rounded cursor-move border"
                        >
                          {opt}
                        </span>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </>
      )}

      {(q.type === 'categorize' || q.type === 'category') && q.categories?.length > 0 && q.values?.length > 0 && (
        <div className="flex flex-row gap-8 mb-8 items-start w-full">
          <Droppable droppableId={`cat-pool-${idx}`} direction="vertical">
            {(provided, snapshot) => {
              const poolVals = answers[idx]?.pool || [];
              return (
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-[160px] min-h-[60px] bg-gray-100 p-4 rounded-lg shadow-inner flex flex-col gap-3 items-center border-2 border-dashed border-gray-300">
                  <div className="font-semibold text-gray-600 mb-2">Unsorted</div>
                  {poolVals.map((vIdx, i) => (
                    <Draggable key={`cat-${idx}-${vIdx}`} draggableId={`cat__${idx}__${vIdx}`} index={i}>
                      {(provided) => (
                        <span
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg cursor-move border border-blue-300 shadow text-blue-800 font-medium text-center mb-2"
                        >
                          {q.values[vIdx]}
                        </span>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <div className="text-xs text-gray-400 w-full mt-2">Drag to a category</div>
                </div>
              );
            }}
          </Droppable>

          <div className="flex flex-row gap-6 flex-1">
            {q.categories.map((cat, cIdx) => {
              const catVals = answers[idx]?.[cIdx] || [];
              return (
                <Droppable key={cIdx} droppableId={`cat-${idx}-${cIdx}`} direction="vertical">
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`min-w-[160px] min-h-[60px] bg-white border-2 border-blue-400 rounded-lg p-4 shadow flex flex-col gap-3 items-center ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-600' : ''}`}>
                      <div className="font-bold text-blue-700 mb-2 text-center">{cat}</div>
                      {catVals.map((vIdx, i) => (
                        <Draggable key={`cat-${idx}-${vIdx}`} draggableId={`cat__${idx}__${vIdx}`} index={i}>
                          {(provided) => (
                            <span
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="inline-block px-4 py-2 bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg cursor-move border border-blue-400 shadow text-blue-900 font-semibold text-center mb-2"
                            >
                              {q.values[vIdx]}
                            </span>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      )}

      {q.type === 'comprehension' && q.options?.length > 0 && (
        <div>
          {q.options.map((opt, i) => (
            <label key={i} className="flex items-center mb-1">
              <input
                type="radio"
                name={`q${idx}`}
                checked={answers[idx] === i}
                onChange={() => handleChange(idx, i)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
      {q.type === 'passage' && (
        <div className="mb-4">
          <div className="bg-gray-100 p-3 rounded mb-3 whitespace-pre-line border border-gray-300">
            {q.passage}
          </div>
          {q.subQuestions?.map((sub, subIdx) => (
            <div key={subIdx} className="mb-3">
              <div className="font-semibold mb-1">{sub.text}</div>
              {sub.options?.map((opt, i) => (
                <label key={i} className="flex items-center mb-1">
                  <input
                    type="radio"
                    name={`q${idx}-sub${subIdx}`}
                    checked={answers[idx]?.[subIdx] === i}
                    onChange={() => {
                      const newAns = Array.isArray(answers[idx]) ? [...answers[idx]] : [];
                      newAns[subIdx] = i;
                      handleChange(idx, newAns);
                    }}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}

      {!['cloze', 'categorize', 'category', 'comprehension'].includes(q.type) && (
        <input className="border p-1 w-full" placeholder="Your answer" value={answers[idx]} onChange={e => handleChange(idx, e.target.value)} />
      )}
    </div>
  );
});

export default FormPreview;
