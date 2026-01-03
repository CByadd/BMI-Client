/**
 * Zustand Store for API State Management (Client)
 */
import { create } from 'zustand';

interface ApiState {
  isLoading: boolean;
  error: string | null;
  serverBase: string;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setServerBase: (base: string) => void;
  clearError: () => void;
}

export const useApiStore = create<ApiState>((set) => ({
  isLoading: false,
  error: null,
  serverBase: ' https://wan-changeable-efferently.ngrok-free.dev',
  // serverBase: 'https://bmi-server-eight.vercel.app',
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  setServerBase: (base: string) => set({ serverBase: base }),
  clearError: () => set({ error: null }),
}));
