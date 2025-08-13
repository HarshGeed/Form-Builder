

import React from 'react';
import { deleteForm } from '../api';

const FormList = ({ forms, onEdit, onPreview, refreshForms }) => {

  const handleDelete = async (id) => {
    await deleteForm(id);
    refreshForms && refreshForms();
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
              {/* Share button removed */}
              <button className="text-red-600 font-semibold hover:underline" onClick={() => handleDelete(form._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

  {/* Share Modal removed */}
    </div>
  );
};

export default FormList;
