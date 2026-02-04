import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Region } from '@chaza/shared';

interface User {
  id: string;
  email: string;
  name: string | null;
  region: Region;
}

interface AuthState {
  user: User | null;
  token: string | null;
  region: Region;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRegion: (region: Region) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      region: 'US',
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRegion: (region) => set({ region }),
      login: (user, token) => set({ user, token, region: user.region }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'chaza-auth',
      partialize: (state) => ({
        token: state.token,
        region: state.region,
      }),
    }
  )
);

// Search history store
interface SearchState {
  recentSearches: string[];
  addSearch: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recentSearches: [],
      addSearch: (query) =>
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter((q) => q !== query),
          ].slice(0, 10),
        })),
      clearHistory: () => set({ recentSearches: [] }),
    }),
    {
      name: 'chaza-search',
    }
  )
);
