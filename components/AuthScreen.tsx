import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setSubmitting(true);
    setMessage('');

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, name);

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage(
          'Account created. Check your email if confirmation is required.'
        );
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          setMessage(error.message);
          return;
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
            Barista Logbook
          </p>

          <h1 className="text-3xl font-bold text-stone-900 mt-2">
            {mode === 'signin'
              ? 'Welcome back'
              : 'Create your account'}
          </h1>

          <p className="text-stone-500 mt-2">
            {mode === 'signin'
              ? 'Sign in to access your coffee library and brew history.'
              : 'Create an account to save your coffee and brew data securely.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full border border-stone-300 rounded-lg px-3 py-2"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full border border-stone-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full border border-stone-300 rounded-lg px-3 py-2"
            />
          </div>

          {message && (
            <div className="text-sm text-stone-700 bg-stone-100 rounded-lg p-3">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-stone-900 text-white rounded-lg px-4 py-3 font-semibold disabled:opacity-50"
          >
            {submitting
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign in'
              : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setMessage('');
          }}
          className="w-full mt-4 text-sm text-stone-600"
        >
          {mode === 'signin'
            ? 'Need an account? Create one'
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;