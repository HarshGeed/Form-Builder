
import React, { useState } from 'react';
import FormList from './components/FormList';
import FormEditor from './components/FormEditor';
import FormPreview from './components/FormPreview';
import AuthForm from './components/AuthForm';
import { register, login } from './api';
import FillFormRoute from './FillFormRoute';


function App() {
  const [mode, setMode] = useState('list'); // 'list' | 'edit' | 'preview'
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [user, setUser] = useState(() => {
    // Load user from localStorage if present
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }); // null = not logged in
  // For redirect after login
  const [pendingFillFormId, setPendingFillFormId] = useState(null);

  // Check if current URL is /:formId (not matching builder/editor routes)
  // Exclude known routes: '', 'edit', 'preview', etc.
  const path = window.location.pathname.replace(/^\//, '');
  const knownRoutes = ['', 'edit', 'preview', 'list', 'login', 'register'];
  const isFormIdRoute = path && !knownRoutes.includes(path.split('/')[0]);
  const formIdRoute = isFormIdRoute ? path.split('/')[0] : null;

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
      // If login was triggered by /:formId, redirect
      if (pendingFillFormId) {
        window.location.href = `/${pendingFillFormId}`;
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

  // If on /:formId, gate with login
  if (formIdRoute) {
    if (!user) {
      // Save intended formId for redirect after login
      if (!pendingFillFormId || pendingFillFormId !== formIdRoute) {
        setPendingFillFormId(formIdRoute);
      }
      return (
        <AuthForm
          mode={authMode}
          onSubmit={handleAuth}
          switchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      );
    }
    // User is logged in, show fill form UI
    return <FillFormRoute />;
  }

  // Default: builder/editor UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200 flex font-sans">
      <aside className="w-72 bg-white/70 backdrop-blur-lg shadow-2xl p-8 flex flex-col justify-between min-h-screen rounded-r-3xl border-r border-blue-100">
        <div>
          <h1 className="text-3xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 drop-shadow-lg tracking-tight">Form Builder</h1>
          <nav className="flex flex-col gap-3">
            <button className={`text-left px-5 py-3 rounded-xl transition font-semibold text-lg ${mode==='list' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow' : 'hover:bg-blue-50 text-gray-700'}`} onClick={handleBack}>All Forms</button>
            <button className={`text-left px-5 py-3 rounded-xl transition font-semibold text-lg ${mode==='edit' && !selectedFormId ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow' : 'hover:bg-blue-50 text-gray-700'}`} onClick={handleCreate}>Create New Form</button>
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs text-gray-500 mb-2">Logged in as <span className="font-semibold">{user.email}</span></div>
          <button
            className="text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow hover:from-pink-600 hover:to-purple-600 transition border-none outline-none"
            onClick={handleLogout}
          >
            Logout
          </button>
          <div className="text-xs text-gray-400 mt-8">&copy; {new Date().getFullYear()} Custom Form Builder</div>
        </div>
      </aside>
      <main className="flex-1 p-12 bg-white/60 rounded-l-3xl shadow-xl">
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
