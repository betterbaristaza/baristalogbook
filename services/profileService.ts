import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

interface ProfileRow {
  id: string;
  name: string | null;
  role: string | null;
  default_method: string | null;
  default_grinder: string | null;
  default_brewer: string | null;
}

const rowToProfile = (row: ProfileRow): UserProfile => ({
  name: row.name ?? '',
  role: row.role ?? '',
  defaultMethod: row.default_method ?? '',
  defaultGrinder: row.default_grinder ?? '',
  defaultBrewer: row.default_brewer ?? '',
});

const profileToRow = (profile: UserProfile) => ({
  name: profile.name,
  role: profile.role,
  default_method: profile.defaultMethod,
  default_grinder: profile.defaultGrinder,
  default_brewer: profile.defaultBrewer,
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

    return rowToProfile(data as ProfileRow);
  },

  update: async (
    profile: UserProfile,
    userId: string
  ): Promise<UserProfile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileToRow(profile))
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return rowToProfile(data as ProfileRow);
  },
};