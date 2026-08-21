import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type {
  AuthChangeEvent,
  Session,
  User,
} from '@supabase/supabase-js';

import { supabase } from '../services/supabaseClient';

const getAuthErrorMessage = (error: any): string => {
  switch (error?.code) {
    case 'invalid_credentials':
      return 'The email or password is incorrect.';

    case 'email_not_confirmed':
      return 'Please verify your email before signing in.';

    case 'user_already_exists':
    case 'email_exists':
      return 'An account already exists with this email.';

    case 'weak_password':
      return 'Choose a stronger password and try again.';

    case 'over_email_send_rate_limit':
      return 'Too many emails have been sent. Please wait before trying again.';

    case 'over_request_rate_limit':
      return 'Too many attempts. Please wait a few minutes and try again.';

    case 'email_address_invalid':
      return 'Enter a valid email address.';

    case 'email_address_not_authorized':
      return 'This email address cannot currently receive authentication emails.';

    case 'signup_disabled':
    case 'email_provider_disabled':
      return 'Account creation is currently unavailable.';

    case 'same_password':
      return 'Your new password must be different from your current password.';

    case 'session_expired':
      return 'Your session has expired. Please sign in again.';

    case 'captcha_failed':
      return 'Security verification failed. Please try again.';

    default:
      console.error('Supabase auth error:', error);
      return 'Something went wrong. Please try again.';
  }
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  passwordRecovery: boolean;

  signUp: (
    email: string,
    password: string,
    name: string,
    captchaToken: string
  ) => Promise<{ error: Error | null }>;

  signIn: (
    email: string,
    password: string,
    captchaToken: string
  ) => Promise<{ error: Error | null }>;

  sendPasswordReset: (
    email: string,
    captchaToken: string
  ) => Promise<{ error: Error | null }>;

  resendSignupConfirmation: (
    email: string,
    captchaToken: string
  ) => Promise<{ error: Error | null }>;

  updatePassword: (
    password: string
  ) => Promise<{ error: Error | null }>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] =
    useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'PASSWORD_RECOVERY') {
          setPasswordRecovery(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    captchaToken: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        captchaToken,
        data: {
          name,
        },
      },
    });

    return {
      error: error
        ? new Error(getAuthErrorMessage(error))
        : null,
    };
  };

  const signIn = async (
    email: string,
    password: string,
    captchaToken: string
  ) => {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken,
        },
      });

    return {
      error: error
        ? new Error(getAuthErrorMessage(error))
        : null,
    };
  };

  const sendPasswordReset = async (
    email: string,
    captchaToken: string
  ) => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
        captchaToken,
      });

    return {
      error: error
        ? new Error(getAuthErrorMessage(error))
        : null,
    };
  };

  const resendSignupConfirmation = async (
    email: string,
    captchaToken: string
  ) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: window.location.origin,
        captchaToken,
      },
    });

    return {
      error: error
        ? new Error(getAuthErrorMessage(error))
        : null,
    };
  };

  const updatePassword = async (
    password: string
  ) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (!error) {
      setPasswordRecovery(false);
    }

    return {
      error: error
        ? new Error(getAuthErrorMessage(error))
        : null,
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPasswordRecovery(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        passwordRecovery,
        signUp,
        signIn,
        sendPasswordReset,
        resendSignupConfirmation,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
};