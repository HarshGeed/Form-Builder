import React, { useState } from 'react';

function QuestionAdvancedUI({ q, idx, updateQuestion, handleQuestionImage }) {
  // Image MCQ (categorize)
  if (q.type === 'categorize') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Question Image</label>
          <div className="relative inline-block mb-2">
            <input
              type="file"
              accept="image/*"
              onChange={e => handleQuestionImage(idx, e)}
              id={`questionImageInput-${idx}`}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <label htmlFor={`questionImageInput-${idx}`} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-lg font-bold shadow hover:from-blue-600 hover:to-purple-600 transition cursor-pointer block text-center">
              Choose Image
            </label>
          </div>
          {q.image && (
            <img
              src={q.image}
              alt="Question"
              className="mt-2 max-h-32 rounded-xl shadow"
            />
          )}
        </div>
        <OptionsBuilder
          options={q.options || []}
          setOptions={opts => updateQuestion(idx, 'options', opts)}
          answer={q.answer}
          setAnswer={ans => updateQuestion(idx, 'answer', ans)}
        />
      </div>
    );
  }

  // Categorization (category)
  if (q.type === 'category') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Categories (comma separated)</label>
          <input
            className="border border-blue-100 p-2 mb-3 w-full rounded-lg text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={q.categories ? q.categories.join(', ') : ''}
            onChange={e => updateQuestion(idx, 'categories', e.target.value.split(',').map(s => s.trim()))}
            placeholder="e.g. Fruits, Vegetables, Animals"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Values to Categorize (comma separated)</label>
          <input
            className="border border-blue-100 p-2 mb-3 w-full rounded-lg text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={q.values ? q.values.join(', ') : ''}
            onChange={e => updateQuestion(idx, 'values', e.target.value.split(',').map(s => s.trim()))}
            placeholder="e.g. Apple, Carrot, Lion"
          />
        </div>
      </div>
    );
  }

  // Fill in the Blank (cloze)
  if (q.type === 'cloze') {
    return (
      <div className="space-y-4">
        <ClozeBuilder
          value={q.text || ''}
          onChange={val => updateQuestion(idx, 'text', val)}
          blanks={q.blanks || []}
          setBlanks={blanks => updateQuestion(idx, 'blanks', blanks)}
        />
        <OptionsBuilder
          options={q.options || []}
          setOptions={opts => updateQuestion(idx, 'options', opts)}
          answer={undefined} // No single answer for cloze, so skip radio
          setAnswer={() => {}}
        />
        <div className="text-xs text-gray-500">Add all possible options for the blanks. These will be draggable for the user to fill in the blanks.</div>
      </div>
    );
  }

  // Normal MCQ (comprehension)
  if (q.type === 'comprehension') {
    return (
      <OptionsBuilder
        options={q.options || []}
        setOptions={opts => updateQuestion(idx, 'options', opts)}
        answer={q.answer}
        setAnswer={ans => updateQuestion(idx, 'answer', ans)}
      />
    );
  }

  // Comprehension with passage and sub-questions (passage)
  if (q.type === 'passage') {
    // subQuestions: array of { text, options, answer }
    const subQuestions = Array.isArray(q.subQuestions) ? q.subQuestions : [];
    const updateSubQuestion = (subIdx, field, value) => {
      const newSubs = [...subQuestions];
      if (!newSubs[subIdx]) newSubs[subIdx] = { text: '', options: [], answer: undefined };
      newSubs[subIdx][field] = value;
      updateQuestion(idx, 'subQuestions', newSubs);
    };
    const addSubQuestion = () => {
      updateQuestion(idx, 'subQuestions', [...subQuestions, { text: '', options: [], answer: undefined }]);
    };
    const removeSubQuestion = (subIdx) => {
      updateQuestion(idx, 'subQuestions', subQuestions.filter((_, i) => i !== subIdx));
    };
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Passage</label>
          <textarea
            className="border border-blue-100 p-2 mb-3 w-full rounded-lg text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={q.passage || ''}
            onChange={e => updateQuestion(idx, 'passage', e.target.value)}
            rows={4}
            placeholder="Enter the passage text here..."
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Sub-Questions</label>
          {subQuestions.map((sub, subIdx) => (
            <div key={subIdx} className="border border-blue-100 rounded-xl p-4 mb-3 bg-white/60">
              <div className="flex items-center mb-2">
                <input
                  className="border border-blue-100 p-2 rounded-lg text-base bg-white/80 flex-1 mr-2"
                  value={sub.text || ''}
                  onChange={e => updateSubQuestion(subIdx, 'text', e.target.value)}
                  placeholder={`Sub-question ${subIdx + 1}`}
                />
                <button className="text-red-500 font-bold text-lg ml-2 hover:scale-110 transition" onClick={() => removeSubQuestion(subIdx)} title="Remove">&times;</button>
              </div>
              <OptionsBuilder
                options={sub.options || []}
                setOptions={opts => updateSubQuestion(subIdx, 'options', opts)}
                answer={sub.answer}
                setAnswer={ans => updateSubQuestion(subIdx, 'answer', ans)}
              />
            </div>
          ))}
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:from-blue-600 hover:to-purple-600 transition mt-2" onClick={addSubQuestion}>Add Sub-Question</button>
        </div>
      </div>
    );
  }

  // Default fallback
  return <div className="text-red-500">Unknown question type</div>;
}

// Helper for Cloze: highlight and blank out selected words
function ClozeBuilder({ value, onChange, blanks, setBlanks }) {
  const [selection, setSelection] = useState({ start: null, end: null });

  // Keep blanks array in sync with number of _____ in text
  React.useEffect(() => {
    const blankCount = (value.match(/_____/g) || []).length;
    if (blankCount < blanks.length) {
      setBlanks(blanks.slice(0, blankCount));
    }
    // Don't auto-add blanks, only trim
    // If user adds more _____, they must select and blank new text
  }, [value, blanks, setBlanks]);

  const handleSelect = (e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    setSelection({ start, end });
  };

  const handleBlank = () => {
    if (selection.start === selection.end) return;
    const before = value.slice(0, selection.start);
    const blank = value.slice(selection.start, selection.end);
    const after = value.slice(selection.end);
    const newValue = before + '_____' + after;
    onChange(newValue);
    setBlanks([...blanks, blank]);
  };

  const handleRemoveBlank = (i) => {
    // Remove the i-th blank and the corresponding _____
    let idx = -1;
    let newText = value.replace(/_____/g, (m) => {
      idx++;
      return idx === i ? '' : m;
    });
    const newBlanks = blanks.filter((_, j) => j !== i);
    onChange(newText);
    setBlanks(newBlanks);
  };

  return (
    <div className="bg-white/70 rounded-xl shadow p-4 mb-4 border border-blue-100">
      <textarea
        className="border border-blue-100 p-3 w-full mb-3 rounded-lg text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value}
        onChange={e => onChange(e.target.value)}
        onSelect={handleSelect}
        rows={2}
        placeholder="Type your question with blanks (_____) here..."
      />
      <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold mr-3 shadow hover:bg-yellow-600 transition" onClick={handleBlank}>Blank Selected</button>
      <div className="text-sm mt-2 flex flex-wrap gap-2">Blanks: {blanks.map((b, i) => (
        <span key={i} className="bg-gray-200 px-2 py-1 rounded flex items-center font-semibold">
          {b}
          <button type="button" className="ml-2 text-red-500 font-bold" onClick={() => handleRemoveBlank(i)} title="Remove blank">&times;</button>
        </span>
      ))}</div>
    </div>
  );
}

// MCQ and Image-based MCQ
function OptionsBuilder({ options, setOptions, answer, setAnswer }) {
  const addOption = () => setOptions([...options, '']);
  const updateOption = (i, val) => {
    const newOpts = [...options];
    newOpts[i] = val;
    setOptions(newOpts);
  };
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));

  return (
    <div className="bg-white/60 rounded-xl shadow p-4 mb-2 border border-blue-50">
      <div className="mb-2 font-semibold text-blue-700">Options:</div>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center mb-2 gap-2">
          <input
            className="border border-blue-100 p-2 rounded-lg text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
            value={opt}
            onChange={e => updateOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
          />
          <input
            type="radio"
            name="answer"
            checked={answer === i}
            onChange={() => setAnswer(i)}
            className="mr-2 accent-blue-500"
          />
          <button className="text-red-500 font-bold text-lg hover:scale-110 transition" onClick={() => removeOption(i)} title="Remove">&times;</button>
        </div>
      ))}
      <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:from-blue-600 hover:to-purple-600 transition mt-2" onClick={addOption}>Add Option</button>
    </div>
  );
}

export default QuestionAdvancedUI;
