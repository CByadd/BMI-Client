import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import api from '../lib/api'
import { updateBaseURL } from '../lib/axios'
import { useApiStore } from '../stores/apiStore'

function WaitingPage({ onNavigate, data, appVersion, screenId, serverBase, socketRef }) {
  const containerRef = useRef(null)
  const pulseRef = useRef(null)
  const [waitingForAndroid, setWaitingForAndroid] = useState(false)
  const [androidPaymentReceived, setAndroidPaymentReceived] = useState(false)

  // Helper to check if Android app is ready
  const checkAndroidReady = async () => {
    if (!screenId || !serverBase) return false
    
    try {
      console.log('[WAITING] [SYNC] Checking if Android app is ready for screenId:', screenId)
      // Update server base if needed
      if (serverBase) {
        useApiStore.getState().setServerBase(serverBase)
        updateBaseURL(serverBase)
      }
      const result = await api.getDebugConnections()
      const roomName = `screen:${screenId}`
      const room = result.rooms?.find(r => r.room === roomName)
      const androidConnected = room && room.size > 0
      
      console.log('[WAITING] [SYNC] Android app status:', {
        roomName,
        roomSize: room?.size || 0,
        androidConnected
      })
      
      return androidConnected
    } catch (e) {
      console.error('[WAITING] [SYNC] Error checking Android status:', e)
      return false
    }
  }

  useEffect(() => {
    if (containerRef.current && pulseRef.current) {
      // Fade in animation
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
      
      // Continuous pulse animation
      gsap.to(pulseRef.current, {
        scale: 1.1,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut"
      })
      
      // Floating animation for the icon
      gsap.to('.floating-icon', {
        y: -10,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut"
      })
    }
    
    // For F1 flow, wait for Android screen state change (QR -> loading)
    if (appVersion === 'f1' && socketRef?.current) {
      setWaitingForAndroid(true)
      console.log('[WAITING] [F1] Setting up screen state change listener and waiting...')
      const socket = socketRef.current
      
      const handleScreenStateChange = (data) => {
        console.log('[WAITING] [F1] Android screen state changed:', data)
        if (data.state === 'loading' || data.state === 'bmi') {
          console.log('[WAITING] [F1] ✅ Android switched from QR to', data.state, '- proceeding to BMI result')
          setAndroidPaymentReceived(true)
          setWaitingForAndroid(false)
          // Proceed to BMI result after Android switches screen
          setTimeout(() => {
            console.log('[WAITING] [F1] Proceeding to BMI result')
            onNavigate('bmi-result')
          }, 1000)
        }
      }
      
      const handlePaymentReceived = (data) => {
        console.log('[WAITING] [F1] ✅ Android confirmed payment received (legacy):', data)
        setAndroidPaymentReceived(true)
        setWaitingForAndroid(false)
        setTimeout(() => {
          console.log('[WAITING] [F1] Proceeding to BMI result')
          onNavigate('bmi-result')
        }, 1000)
      }
      
      socket.on('android-screen-state', handleScreenStateChange)
      socket.on('android-payment-received', handlePaymentReceived)
      
      // Also poll as fallback (wait up to 120 seconds)
      const pollForConfirmation = async () => {
        let attempts = 0
        const maxAttempts = 60 // Wait up to 120 seconds (60 * 2s)
        
        while (attempts < maxAttempts && !androidPaymentReceived) {
          attempts++
          console.log(`[WAITING] [F1] Waiting for Android screen state change... (attempt ${attempts}/${maxAttempts})`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
        if (!androidPaymentReceived) {
          console.log('[WAITING] [F1] ⚠️ Android screen state change timeout, proceeding anyway')
          setWaitingForAndroid(false)
          onNavigate('bmi-result')
        }
      }
      
      pollForConfirmation()
      
      return () => {
        socket.off('android-screen-state', handleScreenStateChange)
        socket.off('android-payment-received', handlePaymentReceived)
      }
    }
    // For F2 flow, wait for Android app connection
    else if (appVersion === 'f2' && screenId && serverBase) {
      setWaitingForAndroid(true)
      console.log('[WAITING] [F2] Waiting for Android app to be ready...')
      
      const waitForAndroid = async () => {
        let attempts = 0
        const maxAttempts = 30 // Wait up to 60 seconds (30 * 2s)
        
        while (attempts < maxAttempts) {
          const ready = await checkAndroidReady()
          if (ready) {
            console.log('[WAITING] [F2] ✅ Android app is ready!')
            setWaitingForAndroid(false)
            break
          }
          
          attempts++
          console.log(`[WAITING] [F2] Waiting for Android app... (attempt ${attempts}/${maxAttempts})`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
        if (attempts >= maxAttempts) {
          console.log('[WAITING] [F2] ⚠️ Android app not ready after waiting, proceeding anyway')
          setWaitingForAndroid(false)
        }
        
        // Auto-progress after Android is ready (or timeout)
        console.log('[WAITING] [F2] Auto-progressing to BMI result')
        onNavigate('bmi-result')
      }
      
      waitForAndroid()
    } else if (appVersion === 'f2') {
      // Fallback: if no screenId, just wait 3 seconds
      const timer = setTimeout(() => {
        console.log('[WAITING] F2 flow - auto-progressing to BMI result (no Android sync)');
        onNavigate('bmi-result');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [appVersion, onNavigate, screenId, serverBase, socketRef])

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div ref={containerRef} className="text-center max-w-md mx-auto">
        <div className="relative mb-8">
          <div ref={pulseRef} className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
            <svg className="floating-icon w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-primary-200 rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-2 border-primary-100 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing Your BMI Analysis</h1>
        <p className="text-lg text-gray-600 mb-8">
          {waitingForAndroid 
            ? 'Waiting for Android app to sync...' 
            : 'Our advanced algorithms are calculating your personalized health insights...'}
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-primary-600">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          
          <p className="text-sm text-gray-500">This usually takes a few seconds...</p>
        </div>
      </div>
    </div>
  )
}
export default WaitingPage
