import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Main application store using Zustand
 * Manages all application state including BMI flow, user, navigation, and socket
 */
export const useAppStore = create(
  persist(
    (set, get) => ({
      // URL Parameters
      screenId: '',
      bmiId: '',
      appVersion: '',
      token: '',
      
      // Server Configuration - Default to ngrok URL
      serverBase: 'https://relieved-sparrow-fairly.ngrok-free.app/api',
      
      // Application State
      loading: true,
      error: null,
      currentPage: 'loading',
      
      // BMI Data
      data: null,
      
      // User State
      user: null,
      
      // Flow Detection
      fromPlayerAppF1: false,
      fromPlayerAppF2: false,
      fromPlayerApp: false,
      
      // Progress State
      progressValue: 0,
      isProgressRunning: false,
      
      // Fortune State
      fortuneMessage: '',
      fortuneGenerated: false,
      
      // Socket State
      socket: null,
      socketConnected: false,
      
      // Loading State
      hasLoadedBMI: false,
      
      // Actions
      setParams: (params) => set({
        screenId: params.screenId || '',
        bmiId: params.bmiId || '',
        appVersion: params.appVersion || '',
        token: params.token || '',
        fromPlayerAppF1: params.appVersion === 'f1',
        fromPlayerAppF2: params.appVersion === 'f2',
        fromPlayerApp: params.appVersion === 'f1' || params.appVersion === 'f2',
      }),
      
      setServerBase: (base) => set({ serverBase: base }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setData: (data) => set({ data }),
      
      setUser: (user) => {
        set({ user })
        // Auto-save user to localStorage
        if (user) {
          localStorage.setItem('bmi_user', JSON.stringify(user))
        } else {
          localStorage.removeItem('bmi_user')
        }
      },
      
      setProgressValue: (value) => set({ progressValue: value }),
      
      setProgressRunning: (running) => set({ isProgressRunning: running }),
      
      setFortuneMessage: (message) => set({ fortuneMessage: message }),
      
      setFortuneGenerated: (generated) => set({ fortuneGenerated: generated }),
      
      setSocket: (socket) => set({ socket }),
      
      setSocketConnected: (connected) => set({ socketConnected: connected }),
      
      setHasLoadedBMI: (loaded) => set({ hasLoadedBMI: loaded }),
      
      // Complex Actions
      initializeFromURL: () => {
        const params = new URLSearchParams(window.location.search)
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        
        const screenId = params.get('screenId') || ''
        const bmiId = params.get('bmiId') || ''
        const appVersion = params.get('appVersion') || ''
        const token = params.get('token') || ''
        const serverBase = hash.get('server') || ''
        
        get().setParams({ screenId, bmiId, appVersion, token })
        
        if (serverBase) {
          // Ensure it includes /api
          const baseUrl = serverBase.endsWith('/api') ? serverBase : `${serverBase}/api`
          get().setServerBase(baseUrl)
        } else {
          // Default server base
          get().setServerBase('https://relieved-sparrow-fairly.ngrok-free.app/api')
        }
      },
      
      loadUserFromStorage: () => {
        try {
          const saved = localStorage.getItem('bmi_user')
          if (saved) {
            const userData = JSON.parse(saved)
            get().setUser(userData)
          }
        } catch (e) {
          console.error('[STORE] Error loading user from storage:', e)
          localStorage.removeItem('bmi_user')
        }
      },
      
      reset: () => set({
        loading: true,
        error: null,
        currentPage: 'loading',
        data: null,
        progressValue: 0,
        isProgressRunning: false,
        fortuneMessage: '',
        fortuneGenerated: false,
        hasLoadedBMI: false,
      }),
    }),
    {
      name: 'bmi-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        serverBase: state.serverBase,
      }),
    }
  )
)
