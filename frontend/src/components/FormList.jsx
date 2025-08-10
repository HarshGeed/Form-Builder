import React, { useEffect, useState } from 'react';
import { getForms, deleteForm } from '../api';


const FormList = ({ onEdit, onPreview }) => {
  const [forms, setForms] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    getForms().then(res => setForms(res.data));
  }, []);

  const handleDelete = async (id) => {
    await deleteForm(id);
    setForms(forms.filter(f => f._id !== id));
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 bg-white/80 rounded-2xl shadow-xl border border-blue-100">
      <h2 className="text-2xl font-extrabold mb-6 text-blue-700 tracking-tight">Your Forms</h2>
      <ul>
        {forms.map(form => (
          <li key={form._id} className="flex items-center justify-between mb-3 p-4 border border-blue-100 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm hover:shadow-md transition">
            <span className="font-semibold text-lg text-gray-800">{form.title}</span>
            <div className="flex items-center gap-2">
              <button className="mr-2 text-blue-600 font-semibold hover:underline" onClick={() => onEdit(form._id)}>Edit</button>
              <button className="mr-2 text-green-600 font-semibold hover:underline" onClick={() => onPreview(form._id)}>Preview</button>
              <button className="mr-2 text-purple-600 font-semibold hover:underline" onClick={() => handleShare(form._id)}>
                Share
              </button>
              {copiedId === form._id && (
                <span className="text-xs text-green-600 font-semibold ml-1 animate-pulse">Link copied!</span>
              )}
              <button className="text-red-600 font-semibold hover:underline" onClick={() => handleDelete(form._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormList;
