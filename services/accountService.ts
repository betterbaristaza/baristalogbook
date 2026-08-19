import { supabase } from './supabaseClient';

export const accountService = {
  deleteAccount: async (): Promise<void> => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session?.access_token) {
      throw new Error('You are not signed in.');
    }

    const response = await fetch('/api/delete-account', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.error || 'Unable to delete account.'
      );
    }
  },
};