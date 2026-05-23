import create from 'zustand';
import { supabase } from '../lib/supabase';

type AuthState = {
  user: any | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  signIn: async (email: string) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) console.error('Auth error', error);
    set({ loading: false });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
  fetchUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    set({ user });
  },
}));
