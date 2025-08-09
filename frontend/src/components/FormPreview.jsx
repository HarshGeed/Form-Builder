import React, { useEffect, useState } from 'react';
import { getForm, submitResponse } from '../api';

const FormPreview = ({ formId, onBack }) => {
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getForm(formId).then(res => {
      setForm(res.data);
      setAnswers(res.data.questions.map(() => ''));
    });
  }, [formId]);

  const handleChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
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
              <div className="flex flex-col gap-2">
                {/* Render the cloze sentence with blanks as inputs */}
                <div>
                  {(() => {
                    // Split the text by '_____' and interleave blanks
                    const parts = q.text.split('_____');
                    return parts.map((part, i) => (
                      <span key={i}>
                        {part}
                        {i < q.blanks.length && (
                          <input
                            className="border-b-2 border-blue-400 mx-1 px-1 outline-none"
                            style={{ width: Math.max(40, q.blanks[i].length * 10) }}
                            value={answers[idx]?.[i] || ''}
                            onChange={e => {
                              const newAns = Array.isArray(answers[idx]) ? [...answers[idx]] : [];
                              newAns[i] = e.target.value;
                              const newAnswers = [...answers];
                              newAnswers[idx] = newAns;
                              setAnswers(newAnswers);
                            }}
                          />
                        )}
                      </span>
                    ));
                  })()}
                </div>
              </div>
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
