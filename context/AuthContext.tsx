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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  passwordRecovery: boolean;

  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: Error | null }>;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;

  sendPasswordReset: (
    email: string
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
  const [session, setSession] = useState<Session | null>(null);
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
    name: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    return {
      error: error ? new Error(error.message) : null,
    };
  };

  const signIn = async (
    email: string,
    password: string
  ) => {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    return {
      error: error ? new Error(error.message) : null,
    };
  };

  const sendPasswordReset = async (email: string) => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

    return {
      error: error ? new Error(error.message) : null,
    };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (!error) {
      setPasswordRecovery(false);
    }

    return {
      error: error ? new Error(error.message) : null,
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