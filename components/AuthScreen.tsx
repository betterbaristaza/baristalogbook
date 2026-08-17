import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type AuthMode =
  | 'signin'
  | 'signup'
  | 'forgot'
  | 'verify';

const AuthScreen: React.FC = () => {
  const {
    signIn,
    signUp,
    sendPasswordReset,
    resendSignupConfirmation,
    updatePassword,
    passwordRecovery,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setSubmitting(true);
    setMessage('');

    try {
      if (passwordRecovery) {
        if (password.length < 6) {
          setMessage(
            'Password must be at least 6 characters.'
          );
          return;
        }

        if (password !== confirmPassword) {
          setMessage('Passwords do not match.');
          return;
        }

        const { error } =
          await updatePassword(password);

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage('Password updated successfully.');
        return;
      }

      if (mode === 'forgot') {
        const { error } =
          await sendPasswordReset(email);

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage(
          'Check your email for a password reset link.'
        );
        return;
      }

      if (mode === 'signup') {
        const { error } = await signUp(
          email,
          password,
          name
        );

        if (error) {
          setMessage(error.message);
          return;
        }

        setMode('verify');
        setPassword('');
        return;
      }

      const { error } = await signIn(
        email,
        password
      );

      if (error) {
        setMessage(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setSubmitting(true);
    setMessage('');

    try {
      const { error } =
        await resendSignupConfirmation(email);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        'Verification email sent again. Check your inbox.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!passwordRecovery && mode === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
            Barista Logbook
          </p>

          <h1 className="text-3xl font-bold text-stone-900 mt-2">
            Check your email
          </h1>

          <p className="text-stone-500 mt-3">
            We sent a verification link to:
          </p>

          <p className="font-semibold text-stone-900 mt-2 break-all">
            {email}
          </p>

          <p className="text-sm text-stone-500 mt-4">
            Open the email and confirm your account before
            signing in.
          </p>

          {message && (
            <div className="text-sm text-stone-700 bg-stone-100 rounded-lg p-3 mt-5">
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handleResendVerification}
            disabled={submitting}
            className="w-full mt-6 bg-stone-900 text-white rounded-lg px-4 py-3 font-semibold disabled:opacity-50"
          >
            {submitting
              ? 'Please wait...'
              : 'Resend verification email'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setMessage('');
            }}
            className="w-full mt-4 text-sm text-stone-600"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  const title = passwordRecovery
    ? 'Set a new password'
    : mode === 'signin'
    ? 'Welcome back'
    : mode === 'signup'
    ? 'Create your account'
    : 'Reset your password';

  const description = passwordRecovery
    ? 'Choose a new password for your Barista Logbook account.'
    : mode === 'signin'
    ? 'Sign in to access your coffee library and brew history.'
    : mode === 'signup'
    ? 'Create an account to save your coffee and brew data securely.'
    : 'Enter your email and we will send you a password reset link.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
            Barista Logbook
          </p>

          <h1 className="text-3xl font-bold text-stone-900 mt-2">
            {title}
          </h1>

          <p className="text-stone-500 mt-2">
            {description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {!passwordRecovery &&
            mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                  className="w-full border border-stone-300 rounded-lg px-3 py-2"
                />
              </div>
            )}

          {!passwordRecovery && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                autoComplete="email"
                className="w-full border border-stone-300 rounded-lg px-3 py-2"
              />
            </div>
          )}

          {(passwordRecovery ||
            mode === 'signin' ||
            mode === 'signup') && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {passwordRecovery
                  ? 'New password'
                  : 'Password'}
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={6}
                autoComplete={
                  passwordRecovery
                    ? 'new-password'
                    : mode === 'signup'
                    ? 'new-password'
                    : 'current-password'
                }
                className="w-full border border-stone-300 rounded-lg px-3 py-2"
              />
            </div>
          )}

          {passwordRecovery && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Confirm new password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full border border-stone-300 rounded-lg px-3 py-2"
              />
            </div>
          )}

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
              : passwordRecovery
              ? 'Update password'
              : mode === 'signin'
              ? 'Sign in'
              : mode === 'signup'
              ? 'Create account'
              : 'Send reset link'}
          </button>
        </form>

        {!passwordRecovery &&
          mode === 'signin' && (
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setMessage('');
              }}
              className="w-full mt-4 text-sm text-amber-800 font-medium"
            >
              Forgot your password?
            </button>
          )}

        {!passwordRecovery && (
          <button
            type="button"
            onClick={() => {
              setMode(
                mode === 'signup'
                  ? 'signin'
                  : mode === 'signin'
                  ? 'signup'
                  : 'signin'
              );

              setMessage('');
              setPassword('');
            }}
            className="w-full mt-4 text-sm text-stone-600"
          >
            {mode === 'signin'
              ? 'Need an account? Create one'
              : mode === 'signup'
              ? 'Already have an account? Sign in'
              : 'Back to sign in'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;