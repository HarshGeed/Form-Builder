
import React, { useEffect, useState } from 'react';
import { getForms, deleteForm } from '../api';

const FormList = ({ onEdit, onPreview }) => {
  const [forms, setForms] = useState([]);
  const [shareModal, setShareModal] = useState({ open: false, link: '', copied: false });

  useEffect(() => {
    getForms().then(res => setForms(res.data));
  }, []);

  const handleDelete = async (id) => {
    await deleteForm(id);
    setForms(forms.filter(f => f._id !== id));
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/${id}`;
    setShareModal({ open: true, link: url, copied: false });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareModal.link);
    setShareModal((m) => ({ ...m, copied: true }));
    setTimeout(() => setShareModal((m) => ({ ...m, copied: false })), 2000);
  };

  const closeModal = () => setShareModal({ open: false, link: '', copied: false });

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
              <button className="text-red-600 font-semibold hover:underline" onClick={() => handleDelete(form._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Share Modal */}
      {shareModal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-blue-200 relative">
            <button className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={closeModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">Share Form Link</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shareModal.link}
                readOnly
                className="flex-1 border border-blue-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-mono text-sm"
                onFocus={e => e.target.select()}
              />
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:from-blue-600 hover:to-purple-600 transition"
                onClick={handleCopy}
              >
                {shareModal.copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="text-xs text-gray-500">Anyone with this link can fill the form.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormList;
