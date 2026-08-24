import React, {
  useRef,
  useState,
} from 'react';

import {
  Turnstile,
  type TurnstileInstance,
} from '@marsidev/react-turnstile';

import { useAuth } from '../context/AuthContext';

import {
  BrewprintMark,
  BrewprintWordmark,
} from './BrewprintBrand';

type AuthMode =
  | 'signin'
  | 'signup'
  | 'forgot'
  | 'verify';

const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY;

const AuthScreen: React.FC = () => {
  const {
    signIn,
    signUp,
    sendPasswordReset,
    resendSignupConfirmation,
    updatePassword,
    passwordRecovery,
  } = useAuth();

  const [mode, setMode] =
    useState<AuthMode>('signin');

  const [name, setName] = useState('');
  const [email, setEmail] =
    useState('');
  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [message, setMessage] =
    useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    captchaToken,
    setCaptchaToken,
  ] = useState<string | null>(null);

  const turnstileRef =
    useRef<TurnstileInstance>(null);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  };

  const requireCaptcha = () => {
    if (!captchaToken) {
      setMessage(
        'Please complete the security check.'
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage('');

    if (passwordRecovery) {
      setSubmitting(true);

      try {
        if (password.length < 8) {
          setMessage(
            'Password must be at least 8 characters.'
          );
          return;
        }

        if (
          password !== confirmPassword
        ) {
          setMessage(
            'Passwords do not match.'
          );
          return;
        }

        const { error } =
          await updatePassword(
            password
          );

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage(
          'Password updated successfully.'
        );
      } finally {
        setSubmitting(false);
      }

      return;
    }

    if (!requireCaptcha()) {
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'forgot') {
        const { error } =
          await sendPasswordReset(
            email,
            captchaToken
          );

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
        const { error } =
          await signUp(
            email,
            password,
            name,
            captchaToken
          );

        if (error) {
          setMessage(error.message);
          return;
        }

        setMode('verify');
        setPassword('');

        return;
      }

      const { error } =
        await signIn(
          email,
          password,
          captchaToken
        );

      if (error) {
        setMessage(error.message);
      }
    } finally {
      setSubmitting(false);
      resetCaptcha();
    }
  };

  const handleResendVerification =
    async () => {
      setMessage('');

      if (!requireCaptcha()) {
        return;
      }

      setSubmitting(true);

      try {
        const { error } =
          await resendSignupConfirmation(
            email,
            captchaToken
          );

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage(
          'Verification email sent again. Check your inbox.'
        );
      } finally {
        setSubmitting(false);
        resetCaptcha();
      }
    };

  const changeMode = (
    nextMode: AuthMode
  ) => {
    setMode(nextMode);
    setMessage('');
    setPassword('');
    setConfirmPassword('');
    resetCaptcha();
  };

  const captchaWidget = (
    <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-3">
      <p className="bp-label mb-3 text-[var(--bp-muted)]">
        Security Verification
      </p>

      <div className="flex justify-center">
        <Turnstile
          ref={turnstileRef}
          siteKey={
            TURNSTILE_SITE_KEY
          }
          onSuccess={token => {
            setCaptchaToken(token);
            setMessage('');
          }}
          onExpire={() => {
            setCaptchaToken(null);
          }}
          onError={() => {
            setCaptchaToken(null);

            setMessage(
              'Security verification could not load. Please try again.'
            );
          }}
          options={{
            theme: 'light',
            size: 'flexible',
          }}
        />
      </div>
    </div>
  );

  const shell = (
    children: React.ReactNode
  ) => (
    <div className="bp-page min-h-screen">
      <div className="bp-grid min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
          <div className="w-full max-w-xl">
            <header className="mb-4 flex items-center justify-between border-b border-[var(--bp-line)] pb-4">
              <div className="flex items-center gap-3">
                <BrewprintMark className="h-9 w-9" />

                <BrewprintWordmark className="h-[16px] w-auto" />
              </div>

              <span className="bp-code text-[var(--bp-muted)]">
                ACCESS / V1
              </span>
            </header>

            {children}

            <div className="mt-4 flex items-center justify-between border-t border-[var(--bp-line)] pt-3">
              <p className="bp-code text-[var(--bp-muted)]">
                RECORD / BREW / COMPARE / IMPROVE
              </p>

              <p className="bp-code text-[var(--bp-muted)]">
                BREWPRINT
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (
    !passwordRecovery &&
    mode === 'verify'
  ) {
    return shell(
      <section className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
        <div className="border-b border-[var(--bp-line)] p-5 sm:p-6">
          <p className="bp-index">
            00.04 / VERIFY
          </p>

          <h1 className="bp-heading mt-2 text-3xl text-[var(--bp-blue)]">
            Check your email
          </h1>

          <p className="bp-code mt-2 text-[var(--bp-muted)]">
            Confirm your account before signing in.
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
            <div className="border-b border-[var(--bp-line)] p-4">
              <p className="bp-label text-[var(--bp-muted)]">
                Verification Sent To
              </p>

              <p className="bp-code mt-2 break-all text-[var(--bp-blue)]">
                {email}
              </p>
            </div>

            <div className="p-4">
              <p className="text-sm leading-relaxed text-[var(--bp-muted)]">
                Open the verification email and confirm your account. Once confirmed, return here and sign in.
              </p>
            </div>
          </div>

          {captchaWidget}

          {message && (
            <div
              role="status"
              className="border-l-2 border-[var(--bp-orange)] bg-[var(--bp-paper-light)] px-4 py-3"
            >
              <p className="bp-code text-[var(--bp-blue)]">
                {message}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 border border-[var(--bp-line)] sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                changeMode(
                  'signin'
                )
              }
              className="bp-label min-h-14 border-b border-[var(--bp-line)] px-4 text-[var(--bp-blue)] sm:border-b-0 sm:border-r"
            >
              Back to Sign In
            </button>

            <button
              type="button"
              onClick={
                handleResendVerification
              }
              disabled={
                submitting ||
                !captchaToken
              }
              className="min-h-14 bg-[var(--bp-orange)] px-4 text-[var(--bp-blue)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="bp-label">
                {submitting
                  ? 'Please Wait...'
                  : 'Resend Email'}
              </span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  const title =
    passwordRecovery
      ? 'Set a new password'
      : mode === 'signin'
        ? 'Welcome back'
        : mode === 'signup'
          ? 'Create your account'
          : 'Reset your password';

  const description =
    passwordRecovery
      ? 'Choose a new password for your BREWPRINT account.'
      : mode === 'signin'
        ? 'Sign in to access your coffee archive and brew history.'
        : mode === 'signup'
          ? 'Create an account to save your coffees, recipes and results securely.'
          : 'Enter your email and we will send you a password reset link.';

  const index =
    passwordRecovery
      ? '00.05 / NEW PASSWORD'
      : mode === 'signin'
        ? '00.01 / SIGN IN'
        : mode === 'signup'
          ? '00.02 / CREATE ACCOUNT'
          : '00.03 / RECOVERY';

  return shell(
    <section className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
      <div className="border-b border-[var(--bp-line)] p-5 sm:p-6">
        <p className="bp-index">
          {index}
        </p>

        <h1 className="bp-heading mt-2 text-3xl text-[var(--bp-blue)]">
          {title}
        </h1>

        <p className="bp-code mt-2 max-w-md leading-relaxed text-[var(--bp-muted)]">
          {description}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-5 sm:p-6"
      >
        {!passwordRecovery &&
          mode === 'signup' && (
            <div>
              <label className="bp-label text-[var(--bp-muted)]">
                Display Name
              </label>

              <input
                type="text"
                value={name}
                onChange={event =>
                  setName(
                    event.target
                      .value
                  )
                }
                required
                autoComplete="name"
                placeholder="Your name"
                className="bp-input mt-2 w-full"
              />
            </div>
          )}

        {!passwordRecovery && (
          <div>
            <label className="bp-label text-[var(--bp-muted)]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={event =>
                setEmail(
                  event.target.value
                )
              }
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="bp-input mt-2 w-full"
            />
          </div>
        )}

        {(passwordRecovery ||
          mode === 'signin' ||
          mode === 'signup') && (
          <div>
            <label className="bp-label text-[var(--bp-muted)]">
              {passwordRecovery
                ? 'New Password'
                : 'Password'}
            </label>

            <input
              type="password"
              value={password}
              onChange={event =>
                setPassword(
                  event.target.value
                )
              }
              required
              minLength={8}
              autoComplete={
                passwordRecovery
                  ? 'new-password'
                  : mode ===
                      'signup'
                    ? 'new-password'
                    : 'current-password'
              }
              placeholder="Minimum 8 characters"
              className="bp-input mt-2 w-full"
            />

            {(passwordRecovery ||
              mode === 'signup') && (
              <p className="bp-code mt-2 text-[var(--bp-muted)]">
                Minimum 8 characters.
              </p>
            )}
          </div>
        )}

        {passwordRecovery && (
          <div>
            <label className="bp-label text-[var(--bp-muted)]">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={event =>
                setConfirmPassword(
                  event.target
                    .value
                )
              }
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              className="bp-input mt-2 w-full"
            />
          </div>
        )}

        {!passwordRecovery &&
          captchaWidget}

        {message && (
          <div
            role="status"
            className="border-l-2 border-[var(--bp-orange)] bg-[var(--bp-paper-light)] px-4 py-3"
          >
            <p className="bp-code leading-relaxed text-[var(--bp-blue)]">
              {message}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            (!passwordRecovery &&
              !captchaToken)
          }
          className="flex min-h-14 w-full items-center justify-between bg-[var(--bp-orange)] px-5 text-[var(--bp-blue)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="text-left">
            <p className="bp-label">
              {passwordRecovery
                ? 'Account Recovery'
                : mode === 'signin'
                  ? 'Account Access'
                  : mode === 'signup'
                    ? 'New Account'
                    : 'Recovery Email'}
            </p>

            <p className="mt-1 text-sm font-semibold">
              {submitting
                ? 'Please wait...'
                : passwordRecovery
                  ? 'Update Password'
                  : mode === 'signin'
                    ? 'Sign In'
                    : mode === 'signup'
                      ? 'Create Account'
                      : 'Send Reset Link'}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="bp-code text-lg"
          >
            →
          </span>
        </button>
      </form>

      {!passwordRecovery && (
        <div className="border-t border-[var(--bp-line)]">
          {mode === 'signin' && (
            <button
              type="button"
              onClick={() =>
                changeMode(
                  'forgot'
                )
              }
              className="bp-label min-h-12 w-full border-b border-[var(--bp-line)] px-4 text-[var(--bp-blue)]"
            >
              Forgot Your Password?
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (
                mode === 'signup'
              ) {
                changeMode(
                  'signin'
                );
                return;
              }

              if (
                mode === 'signin'
              ) {
                changeMode(
                  'signup'
                );
                return;
              }

              changeMode('signin');
            }}
            className="bp-label min-h-12 w-full px-4 text-[var(--bp-blue)]"
          >
            {mode === 'signin'
              ? 'Need an account? Create one'
              : mode === 'signup'
                ? 'Already have an account? Sign in'
                : 'Back to sign in'}
          </button>
        </div>
      )}
    </section>
  );
};

export default AuthScreen;
