import React, { useState, useEffect } from 'react';

import FormList from './components/FormList';
import FormEditor from './components/FormEditor';
import FormPreview from './components/FormPreview';

import AuthForm from './components/AuthForm';
import { register, login } from './api';


function App() {
  const [mode, setMode] = useState('list'); // 'list' | 'edit' | 'preview'
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [user, setUser] = useState(() => {
    // Load user from localStorage if present
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }); // null = not logged in


  // Real auth handler
  const handleAuth = async ({ email, password }) => {
    try {
      if (authMode === 'register') {
        await register({ email, password });
        // Optionally auto-login after register
        const res = await login({ email, password });
        const userObj = { email: res.data.email, token: res.data.token };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
      } else {
        const res = await login({ email, password });
        const userObj = { email: res.data.email, token: res.data.token };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleEdit = (id) => {
    setSelectedFormId(id);
    setMode('edit');
  };
  const handlePreview = (id) => {
    setSelectedFormId(id);
    setMode('preview');
  };
  const handleBack = () => {
    setSelectedFormId(null);
    setMode('list');
  };
  const handleCreate = () => {
    setSelectedFormId(null);
    setMode('edit');
  };

  if (!user) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuth}
        switchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between min-h-screen">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-blue-700">Form Builder</h1>
          <nav className="flex flex-col gap-2">
            <button className={`text-left px-4 py-2 rounded transition font-medium ${mode==='list' ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 text-gray-700'}`} onClick={handleBack}>All Forms</button>
            <button className={`text-left px-4 py-2 rounded transition font-medium ${mode==='edit' && !selectedFormId ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 text-gray-700'}`} onClick={handleCreate}>Create New Form</button>
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs text-gray-500 mb-2">Logged in as <span className="font-semibold">{user.email}</span></div>
          <button className="text-xs text-red-500 underline" onClick={handleLogout}>Logout</button>
          <div className="text-xs text-gray-400 mt-8">&copy; {new Date().getFullYear()} Custom Form Builder</div>
        </div>
      </aside>
      <main className="flex-1 p-10">
        <div className="max-w-3xl mx-auto">
          {mode === 'list' && (
            <FormList onEdit={handleEdit} onPreview={handlePreview} />
          )}
          {mode === 'edit' && (
            <FormEditor formId={selectedFormId} onSave={handleBack} onCancel={handleBack} />
          )}
          {mode === 'preview' && (
            <FormPreview formId={selectedFormId} onBack={handleBack} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
