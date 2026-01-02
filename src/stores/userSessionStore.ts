/**
 * Zustand Store for User Session Management
 * Handles 8-day session storage with persistence
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const SESSION_DURATION_DAYS = 8;

interface User {
  name: string;
  mobile: string;
  userId: string;
  token?: string;
}

interface UserSessionState {
  user: User | null;
  sessionExpiry: string | null;
  _hasHydrated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  isSessionValid: () => boolean;
  getSessionDaysRemaining: () => number;
  setHasHydrated: (state: boolean) => void;
}

export const useUserSessionStore = create<UserSessionState>()(
  persist(
    (set, get) => ({
      user: null,
      sessionExpiry: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      setUser: (user: User) => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + SESSION_DURATION_DAYS);
        
        console.log('[SESSION STORE] Setting user session, expires on:', expiryDate.toISOString());
        
        set({
          user,
          sessionExpiry: expiryDate.toISOString(),
        });
      },

      clearUser: () => {
        console.log('[SESSION STORE] Clearing user session');
        set({
          user: null,
          sessionExpiry: null,
        });
      },

      isSessionValid: () => {
        const state = get();
        if (!state.sessionExpiry || !state.user) {
          return false;
        }

        try {
          const expiryDate = new Date(state.sessionExpiry);
          const now = new Date();

          if (now > expiryDate) {
            console.log('[SESSION STORE] Session expired');
            get().clearUser();
            return false;
          }

          return true;
        } catch (error) {
          console.error('[SESSION STORE] Error checking session validity:', error);
          return false;
        }
      },

      getSessionDaysRemaining: () => {
        const state = get();
        if (!state.sessionExpiry) {
          return 0;
        }

        try {
          const expiryDate = new Date(state.sessionExpiry);
          const now = new Date();
          const diffTime = expiryDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return diffDays > 0 ? diffDays : 0;
        } catch (error) {
          return 0;
        }
      },
    }),
    {
      name: 'bmi-user-session', // localStorage key
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log('[SESSION STORE] Hydration finished', state);
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
