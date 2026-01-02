import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import api, { updateServerBase } from '../lib/api'

function AnalyzingPage({ onNavigate, screenId, serverBase, socketRef, token }) {
  const containerRef = useRef(null)
  const [androidState, setAndroidState] = useState(null)
  const [waitingForAndroid, setWaitingForAndroid] = useState(true)
  const [tokenExpired, setTokenExpired] = useState(false)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
    }
    
    // Listen for Android screen state changes
    if (socketRef?.current) {
      const socket = socketRef.current
      
      const handleScreenState = (data) => {
        console.log('[ANALYZING] Android screen state:', data)
        setAndroidState(data.state)
        
        if (data.state === 'loading' || data.state === 'bmi') {
          console.log('[ANALYZING] ✅ Android switched to', data.state, '- proceeding')
          setWaitingForAndroid(false)
          setTimeout(() => {
            if (onNavigate) onNavigate('bmi-result')
          }, 1000)
        }
      }
      
      socket.on('android-screen-state', handleScreenState)
      
      // Claim session once via secure header (idempotent)
      const claimSession = async () => {
        try {
          if (!token || !serverBase) return
          await api.claimSession(token)
        } catch (_) {}
      }
      claimSession()

      // Also poll session status via secure header
      const pollTokenStatus = async () => {
        if (!token || !serverBase) return
        
        let attempts = 0
        const maxAttempts = 30 // 30 attempts
        
        while (attempts < maxAttempts && waitingForAndroid) {
          try {
            const data = await api.getSessionStatus(token)
            
            if (data && data.ok) {
              console.log('[ANALYZING] Token status:', data.token.state)
              const state = data.token.state
              const expired = data.token.isExpired || data.token.isUnusedTimeout
              if (expired) {
                console.log('[ANALYZING] ⚠️ Token expired/unused, ending session')
                setTokenExpired(true)
                setWaitingForAndroid(false)
                if (socketRef?.current && screenId && token) {
                  socketRef.current.emit('token-expired', { screenId, token })
                }
                break
              }
              if (state === 'loading' || state === 'bmi') {
                setWaitingForAndroid(false)
                setTimeout(() => {
                  if (onNavigate) onNavigate('bmi-result')
                }, 1000)
                break
              }
            }
          } catch (e: any) {
            console.error('[ANALYZING] Error checking token:', e)
            // If token is gone or server error, treat as expired
            if (e.status && e.status >= 400) {
              console.log('[ANALYZING] ⚠️ Token status request failed with status:', e.status)
              setTokenExpired(true)
              setWaitingForAndroid(false)
              // Inform Android that this token/session has expired
              if (socketRef?.current && screenId && token) {
                socketRef.current.emit('token-expired', { screenId, token })
              }
              break
            }
          }
          
          attempts++
          // Poll every 2 seconds to reduce load
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
        if (attempts >= maxAttempts) {
          console.log('[ANALYZING] ⚠️ Timeout waiting for Android, proceeding anyway')
          setWaitingForAndroid(false)
          if (!tokenExpired && onNavigate) onNavigate('bmi-result')
        }
      }
      
      pollTokenStatus()
      
      return () => {
        socket.off('android-screen-state', handleScreenState)
      }
    }
  }, [socketRef, token, serverBase, onNavigate, waitingForAndroid])

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div ref={containerRef} className="text-center max-w-md mx-auto">
        <div className="relative mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-primary-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {tokenExpired ? 'Session Expired' : 'Analyzing Your Screen'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {tokenExpired
            ? 'Your session has expired. Please scan the QR code again to start a new analysis.'
            : waitingForAndroid 
              ? 'Waiting for Android app to sync...' 
              : 'Synchronizing with Android device...'}
        </p>
        
        {androidState && (
          <p className="text-sm text-primary-600 mb-4">
            Android state: {androidState}
          </p>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-primary-600">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          
          <p className="text-sm text-gray-500">Please wait while we sync with the Android device...</p>
        </div>
      </div>
    </div>
  )
}

export default AnalyzingPage

