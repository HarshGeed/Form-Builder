import React, { useState } from 'react';

export default function AuthForm({ mode = 'login', onSubmit, switchMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    onSubmit({ email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200">
      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md border border-blue-100">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 drop-shadow-lg tracking-tight">{mode === 'login' ? 'Login' : 'Register'}</h2>
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-semibold">Email</label>
          <input
            type="email"
            className="w-full border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-semibold">Password</label>
          <input
            type="password"
            className="w-full border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {mode === 'register' && (
          <div className="mb-6">
            <label className="block mb-2 text-gray-700 font-semibold">Confirm Password</label>
            <input
              type="password"
              className="w-full border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-500 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-600 transition mb-4 shadow-lg">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
        <div className="text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button type="button" className="text-blue-600 hover:underline font-semibold" onClick={switchMode}>Register</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="text-blue-600 hover:underline font-semibold" onClick={switchMode}>Login</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
