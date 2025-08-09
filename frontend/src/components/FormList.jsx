import React, { useEffect, useState } from 'react';
import { getForms, deleteForm } from '../api';

const FormList = ({ onEdit, onPreview }) => {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    getForms().then(res => setForms(res.data));
  }, []);

  const handleDelete = async (id) => {
    await deleteForm(id);
    setForms(forms.filter(f => f._id !== id));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Forms</h2>
      <ul>
        {forms.map(form => (
          <li key={form._id} className="flex items-center justify-between mb-2 p-2 border rounded">
            <span>{form.title}</span>
            <div>
              <button className="mr-2 text-blue-600" onClick={() => onEdit(form._id)}>Edit</button>
              <button className="mr-2 text-green-600" onClick={() => onPreview(form._id)}>Preview</button>
              <button className="text-red-600" onClick={() => handleDelete(form._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormList;
