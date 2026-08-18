import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

interface ProfileRow {
  id: string;
  name: string | null;
  role: string | null;
  default_method: string | null;
  default_grinder: string | null;
  default_brewer: string | null;
  onboarding_completed: boolean | null;
}

const rowToProfile = (
  row: ProfileRow
): UserProfile => ({
  name: row.name ?? '',
  role: row.role ?? '',
  defaultMethod: row.default_method ?? '',
  defaultGrinder: row.default_grinder ?? '',
  defaultBrewer: row.default_brewer ?? '',
  onboardingCompleted:
    row.onboarding_completed ?? false,
});

const profileToRow = (
  profile: UserProfile,
  userId: string
) => ({
  id: userId,
  name: profile.name,
  role: profile.role,
  default_method: profile.defaultMethod,
  default_grinder: profile.defaultGrinder,
  default_brewer: profile.defaultBrewer,
  onboarding_completed:
    profile.onboardingCompleted ?? false,
});

export const profileService = {
  get: async (
    userId: string
  ): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return rowToProfile(
      data as ProfileRow
    );
  },

  update: async (
    profile: UserProfile,
    userId: string
  ): Promise<UserProfile> => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        profileToRow(profile, userId),
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return rowToProfile(
      data as ProfileRow
    );
  },

  setOnboardingCompleted: async (
    userId: string,
    completed: boolean
  ): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: completed,
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  },
};