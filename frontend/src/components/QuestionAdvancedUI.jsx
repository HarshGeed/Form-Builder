import React, { useState } from 'react';

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
  }, [value]);

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
    <div>
      <textarea
        className="border p-1 w-full mb-1"
        value={value}
        onChange={e => onChange(e.target.value)}
        onSelect={handleSelect}
        rows={2}
      />
      <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" onClick={handleBlank}>Blank Selected</button>
      <div className="text-sm mt-1 flex flex-wrap gap-2">Blanks: {blanks.map((b, i) => (
        <span key={i} className="bg-gray-200 px-1 rounded flex items-center">
          {b}
          <button type="button" className="ml-1 text-red-500" onClick={() => handleRemoveBlank(i)} title="Remove blank">&times;</button>
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
    <div>
      <div className="mb-1">Options:</div>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center mb-1">
          <input
            className="border p-1 mr-2"
            value={opt}
            onChange={e => updateOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
          />
          <input
            type="radio"
            name="answer"
            checked={answer === i}
            onChange={() => setAnswer(i)}
            className="mr-2"
          />
          <button className="text-red-600" onClick={() => removeOption(i)}>Remove</button>
        </div>
      ))}
      <button className="bg-blue-400 text-white px-2 py-1 rounded" onClick={addOption}>Add Option</button>
    </div>
  );
}

export default function QuestionAdvancedUI({ q, idx, updateQuestion, handleQuestionImage }) {
  // Cloze
  if (q.type === 'cloze') {
    return (
      <>
        <ClozeBuilder
          value={q.text}
          onChange={val => updateQuestion(idx, 'text', val)}
          blanks={q.blanks || []}
          setBlanks={blanks => updateQuestion(idx, 'blanks', blanks)}
        />
        <div className="mt-2">
          <div className="font-semibold mb-1">Options for Drag & Drop (include all correct and distractors):</div>
          <OptionsBuilder
            options={q.options || []}
            setOptions={opts => updateQuestion(idx, 'options', opts)}
            answer={null}
            setAnswer={() => {}}
          />
        </div>
      </>
    );
  }
  // Image-based MCQ
  if (q.type === 'categorize') {
    return (
      <>
        <input type="file" accept="image/*" onChange={e => handleQuestionImage(idx, e)} />
        {q.image && <img src={q.image} alt="Q" className="mt-1 max-h-24" />}
        <OptionsBuilder
          options={q.options || []}
          setOptions={opts => updateQuestion(idx, 'options', opts)}
          answer={q.answer}
          setAnswer={ans => updateQuestion(idx, 'answer', ans)}
        />
      </>
    );
  }
  // Normal MCQ
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
  return null;
}
