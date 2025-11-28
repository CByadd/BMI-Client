import { create } from 'zustand'
import { io } from 'socket.io-client'
import { useAppStore } from './useAppStore'

/**
 * Socket management store
 * Handles Socket.IO connection and real-time events
 */
export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  screenId: null,
  
  connect: (serverBase, screenId) => {
    const state = get()
    const appState = useAppStore.getState()
    
    // Disconnect existing socket if any
    if (state.socket?.connected) {
      state.socket.disconnect()
    }
    
    let socketUrl = serverBase || appState.serverBase
    if (socketUrl.endsWith('/api')) {
      socketUrl = socketUrl.replace('/api', '')
    }
    socketUrl = socketUrl.replace(/\/$/, '')
    
    console.log('[SOCKET] Connecting to:', socketUrl)
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    
    socket.on('connect', () => {
      console.log('[SOCKET] Connected to server')
      set({ connected: true })
      useAppStore.getState().setSocketConnected(true)
      
      if (screenId) {
        socket.emit('player-join', { screenId })
        console.log('[SOCKET] Joined screen room:', screenId)
        set({ screenId })
      }
    })
    
    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected from server')
      set({ connected: false })
      useAppStore.getState().setSocketConnected(false)
    })
    
    socket.on('error', (error) => {
      console.error('[SOCKET] Error:', error)
    })
    
    set({ socket })
    useAppStore.getState().setSocket(socket)
    
    return socket
  },
  
  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, connected: false, screenId: null })
      useAppStore.getState().setSocket(null)
      useAppStore.getState().setSocketConnected(false)
    }
  },
  
  onProcessingState: (callback) => {
    const { socket } = get()
    if (socket) {
      socket.on('processing-state', callback)
      return () => socket.off('processing-state', callback)
    }
    return () => {}
  },
  
  onPaymentSuccess: (callback) => {
    const { socket } = get()
    if (socket) {
      socket.on('payment-success', callback)
      return () => socket.off('payment-success', callback)
    }
    return () => {}
  },
  
  onFortuneReady: (callback) => {
    const { socket } = get()
    if (socket) {
      socket.on('fortune-ready', callback)
      return () => socket.off('fortune-ready', callback)
    }
    return () => {}
  },
  
  onBMIDataReceived: (callback) => {
    const { socket } = get()
    if (socket) {
      socket.on('bmi-data-received', callback)
      return () => socket.off('bmi-data-received', callback)
    }
    return () => {}
  },
}))
