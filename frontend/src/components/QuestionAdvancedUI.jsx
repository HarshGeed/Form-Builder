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
  if (q.type === 'categorize' || q.type === 'category') {
    // Categories
    const categories = q.categories || [];
    const setCategories = (cats) => updateQuestion(idx, 'categories', cats);
    // Values/items
    const values = q.values || [];
    const setValues = (vals) => updateQuestion(idx, 'values', vals);
    // Mapping: value index -> category index
    const valueToCategory = q.valueToCategory || [];
    const setValueToCategory = (arr) => updateQuestion(idx, 'valueToCategory', arr);

    // Add/remove/edit categories
    const addCategory = () => setCategories([...categories, '']);
    const updateCategory = (i, val) => {
      const newCats = [...categories];
      newCats[i] = val;
      setCategories(newCats);
    };
    const removeCategory = (i) => {
      const newCats = categories.filter((_, idx) => idx !== i);
      setCategories(newCats);
      // Remove mapping for deleted category
      setValueToCategory(valueToCategory.map(catIdx => catIdx === i ? null : catIdx > i ? catIdx - 1 : catIdx));
    };

    // Add/remove/edit values
    const addValue = () => {
      setValues([...values, '']);
      setValueToCategory([...valueToCategory, null]);
    };
    const updateValue = (i, val) => {
      const newVals = [...values];
      newVals[i] = val;
      setValues(newVals);
    };
    const removeValue = (i) => {
      setValues(values.filter((_, idx) => idx !== i));
      setValueToCategory(valueToCategory.filter((_, idx) => idx !== i));
    };

    // Set correct category for a value
    const setValueCategory = (valIdx, catIdx) => {
      const arr = [...valueToCategory];
      arr[valIdx] = catIdx;
      setValueToCategory(arr);
    };

    return (
      <div className="space-y-4">
        <div>
          <div className="font-semibold mb-1">Categories:</div>
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center mb-1">
              <input
                className="border p-1 mr-2"
                value={cat}
                onChange={e => updateCategory(i, e.target.value)}
                placeholder={`Category ${i + 1}`}
              />
              <button className="text-red-600" onClick={() => removeCategory(i)}>Remove</button>
            </div>
          ))}
          <button className="bg-blue-400 text-white px-2 py-1 rounded" onClick={addCategory}>Add Category</button>
        </div>
        <div>
          <div className="font-semibold mb-1">Values/Items:</div>
          {values.map((val, i) => (
            <div key={i} className="flex items-center mb-1 gap-2">
              <input
                className="border p-1 mr-2"
                value={val}
                onChange={e => updateValue(i, e.target.value)}
                placeholder={`Value ${i + 1}`}
              />
              <select
                className="border p-1"
                value={valueToCategory[i] ?? ''}
                onChange={e => setValueCategory(i, e.target.value === '' ? null : Number(e.target.value))}
              >
                <option value="">-- Correct Category --</option>
                {categories.map((cat, j) => (
                  <option key={j} value={j}>{cat}</option>
                ))}
              </select>
              <button className="text-red-600" onClick={() => removeValue(i)}>Remove</button>
            </div>
          ))}
          <button className="bg-blue-400 text-white px-2 py-1 rounded" onClick={addValue}>Add Value</button>
        </div>
      </div>
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
