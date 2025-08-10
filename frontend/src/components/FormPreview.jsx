
import React, { useEffect, useState } from 'react';
import { getForm, submitResponse } from '../api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const FormPreview = ({ formId, onBack }) => {
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [dragOptions, setDragOptions] = useState([]); // for cloze drag-and-drop
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getForm(formId).then(res => {
      setForm(res.data);
      setAnswers(res.data.questions.map(q => q.type === 'cloze' ? Array((q.text.match(/_____/g)||[]).length).fill(null) : ''));
      setDragOptions(res.data.questions.map(q => q.type === 'cloze' ? shuffleArray([...(q.options||[]).filter(Boolean)]) : []));
    });
  }, [formId]);

  // Helper to shuffle options
  function shuffleArray(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
  }

  const handleChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  // Drag and drop handler for cloze
  const handleDragEnd = (result, qIdx, blankCount) => {
    if (!result.destination) return;
    const { source, destination } = result;
    // If dragging from options to a blank
    if (source.droppableId === `options-${qIdx}` && destination.droppableId.startsWith(`blank-${qIdx}-`)) {
      const blankIdx = parseInt(destination.droppableId.split('-').pop(), 10);
      // Place option in blank, remove from options
      const option = dragOptions[qIdx][source.index];
      const newAnswers = answers.map((a, i) => i === qIdx ? [...a] : a);
      newAnswers[qIdx][blankIdx] = option;
      setAnswers(newAnswers);
      // Remove from options
      const newDragOptions = dragOptions.map((opts, i) => i === qIdx ? opts.filter((_, idx) => idx !== source.index) : opts);
      setDragOptions(newDragOptions);
    }
    // If dragging from one blank to another (swap)
    else if (source.droppableId.startsWith(`blank-${qIdx}-`) && destination.droppableId.startsWith(`blank-${qIdx}-`)) {
      const fromIdx = parseInt(source.droppableId.split('-').pop(), 10);
      const toIdx = parseInt(destination.droppableId.split('-').pop(), 10);
      const newAnswers = answers.map((a, i) => i === qIdx ? [...a] : a);
      const temp = newAnswers[qIdx][fromIdx];
      newAnswers[qIdx][fromIdx] = newAnswers[qIdx][toIdx];
      newAnswers[qIdx][toIdx] = temp;
      setAnswers(newAnswers);
    }
    // If dragging from blank back to options
    else if (source.droppableId.startsWith(`blank-${qIdx}-`) && destination.droppableId === `options-${qIdx}`) {
      const blankIdx = parseInt(source.droppableId.split('-').pop(), 10);
      const option = answers[qIdx][blankIdx];
      if (!option) return;
      // Remove from blank
      const newAnswers = answers.map((a, i) => i === qIdx ? [...a] : a);
      newAnswers[qIdx][blankIdx] = null;
      setAnswers(newAnswers);
      // Add back to options
      const newDragOptions = dragOptions.map((opts, i) => i === qIdx ? [...opts, option] : opts);
      setDragOptions(newDragOptions);
    }
  };

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
        {form.questions.map((q, idx) => (
          <div key={idx} className="mb-4 border p-2 rounded">
            <div className="font-semibold mb-1">{q.text}</div>
            {q.image && <img src={q.image} alt="Q" className="mb-2 max-h-24" />}
            {/* Render input based on question type */}
            {q.type === 'cloze' && q.blanks && q.blanks.length > 0 ? (
              <DragDropContext onDragEnd={result => handleDragEnd(result, idx, q.blanks.length)}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {(() => {
                    const parts = q.text.split('_____');
                    return parts.map((part, i) => (
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
                                {answers[idx]?.[i] ? (
                                  <Draggable draggableId={`ans-${idx}-${i}-${answers[idx][i]}`} index={0}>
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
                                ) : null}
                                {provided.placeholder}
                              </span>
                            )}
                          </Droppable>
                        )}
                      </React.Fragment>
                    ));
                  })()}
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
                          <Draggable key={opt + i} draggableId={`opt-${idx}-${i}-${opt}`} index={i}>
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
              </DragDropContext>
            ) : q.type === 'categorize' && q.options && q.options.length > 0 ? (
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
            ) : q.type === 'comprehension' && q.options && q.options.length > 0 ? (
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
            ) : (
              <input className="border p-1 w-full" placeholder="Your answer" value={answers[idx]} onChange={e => handleChange(idx, e.target.value)} />
            )}
          </div>
        ))}
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FormPreview;
