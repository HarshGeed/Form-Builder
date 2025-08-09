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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">{mode === 'login' ? 'Login' : 'Register'}</h2>
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {mode === 'register' && (
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition mb-2">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
        <div className="text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button type="button" className="text-blue-600 hover:underline" onClick={switchMode}>Register</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="text-blue-600 hover:underline" onClick={switchMode}>Login</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
