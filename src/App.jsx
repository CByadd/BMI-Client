import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from './stores/useAppStore'
import { useSocketStore } from './stores/useSocketStore'
import AuthPage from './pages/AuthPage'
import PaymentPage from './pages/PaymentPage'
import WaitingPage from './pages/WaitingPage'
import BMIResultPage from './pages/BMIResultPage'
import ProgressPage from './pages/ProgressPage'
import FortunePage from './pages/FortunePage'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'

function useQueryParams() {
  return new URLSearchParams(window.location.search)
}

function App() {
  const store = useAppStore()
  const socketStore = useSocketStore()
  
  const {
    screenId,
    bmiId,
    appVersion,
    serverBase,
    loading,
    error,
    currentPage,
    data,
    user,
    fromPlayerAppF1,
    fromPlayerAppF2,
    progressValue,
    fortuneMessage,
    hasLoadedBMI,
  } = store

  // Initialize from URL on mount
  useEffect(() => {
    store.initializeFromURL()
    store.loadUserFromStorage()
  }, [])

  // Extract server base from URL hash
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const fromHash = hash.get('server')
    if (fromHash) {
      store.setServerBase(fromHash)
    }
  }, [])

  // Check dashboard/analytics routes
  useEffect(() => {
    if (window.location.pathname === '/dashboard' || window.location.pathname.includes('dashboard')) {
      store.setCurrentPage('dashboard')
      store.setLoading(false)
      return
    }
    if (window.location.pathname === '/analytics' || window.location.pathname.includes('analytics')) {
      store.setCurrentPage('analytics')
      store.setLoading(false)
      return
    }
    
    // Check if user is visiting directly (not via QR code) and has saved login
    const isDirectVisit = !bmiId && !screenId
    if (isDirectVisit && user?.userId) {
      console.log('[CLIENT] Direct visit with saved user, showing dashboard')
      store.setCurrentPage('dashboard')
      store.setLoading(false)
    }
  }, [bmiId, screenId, user?.userId])

  // Socket connection for F1 flow
  useEffect(() => {
    if (!fromPlayerAppF1 || !screenId || !serverBase || currentPage !== 'progress') {
      return
    }

    if (socketStore.socket?.connected) {
      console.log('[SOCKET] Already connected, skipping reconnection')
      return
    }

    console.log('[SOCKET] Setting up Socket.IO connection for F1 flow sync')
    const socket = socketStore.connect(serverBase, screenId)

    // Listen for processing state changes
    const unsubscribe = socketStore.onProcessingState((payload) => {
      console.log('[SOCKET] Processing state received:', payload)
      const state = payload.processingState

      if (state === 'progress') {
        console.log('[SOCKET] F1: Progress state - Android should connect now')
        store.setCurrentPage('progress')
        startProgressAnimation()
      } else if (state === 'bmi-fortune') {
        console.log('[SOCKET] F1: bmi-fortune state - showing BMI + Fortune simultaneously')
        if (payload.fortune || payload.fortuneMessage) {
          const fortune = payload.fortune || payload.fortuneMessage
          store.setFortuneMessage(fortune)
          if (data) {
            store.setData({ ...data, fortune })
          }
        } else if (!store.fortuneGenerated) {
          generateFortune()
        }
        store.setCurrentPage('bmi-result')
      } else if (state === 'waiting') {
        console.log('[SOCKET] Syncing to waiting screen')
        store.setCurrentPage('waiting')
      } else if (state === 'bmi-result') {
        console.log('[SOCKET] Syncing to BMI result screen')
        store.setCurrentPage('bmi-result')
      }
    })

    return () => {
      unsubscribe()
      console.log('[SOCKET] Progress screen cleanup')
    }
  }, [currentPage, fromPlayerAppF1, screenId, serverBase])

  // Load BMI data
  useEffect(() => {
    async function run() {
      if (currentPage === 'dashboard' || currentPage === 'analytics' || hasLoadedBMI) {
        return
      }
      
      const isQRCodeVisit = !!(screenId && bmiId)
      
      if (!isQRCodeVisit) {
        console.log(`[CLIENT] Direct visit - no QR code parameters`)
        store.setCurrentPage('auth')
        store.setLoading(false)
        return
      }
      
      if (!serverBase || !bmiId) {
        console.log(`[CLIENT] Missing params - serverBase: ${serverBase}, bmiId: ${bmiId}`)
        store.setLoading(false)
        return
      }
      
      store.setLoading(true)
      store.setError(null)
      
      try {
        const url = `${serverBase}/bmi/${bmiId}${appVersion ? `?appVersion=${appVersion}` : ''}`
        console.log(`[CLIENT] Fetching BMI data from: ${url}`)
        
        const response = await fetch(url, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const responseText = await response.text()
        if (!responseText.trim()) {
          throw new Error('Empty response from server')
        }
        
        let bmiData
        try {
          bmiData = JSON.parse(responseText)
        } catch (parseError) {
          console.error('[CLIENT] JSON parse error:', parseError)
          throw new Error('Invalid JSON response')
        }
        
        console.log('[CLIENT] BMI data loaded:', bmiData)
        store.setData(bmiData)
        
        // Determine initial page based on flow type
        if (fromPlayerAppF2) {
          console.log(`[CLIENT] Coming from PlayerApp BMI F2`)
          store.setCurrentPage('waiting')
        } else if (fromPlayerAppF1) {
          console.log(`[CLIENT] Coming from PlayerApp BMI F1`)
          const savedUser = localStorage.getItem('bmi_user')
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser)
              if (userData.userId) {
                console.log(`[CLIENT] F1: User cache exists, going to payment`)
                store.setUser(userData)
                store.setCurrentPage('payment')
              } else {
                store.setCurrentPage('auth')
              }
            } catch (e) {
              store.setCurrentPage('auth')
            }
          } else {
            console.log(`[CLIENT] F1: No user cache, showing login`)
            store.setCurrentPage('auth')
          }
        } else {
          store.setCurrentPage('auth')
        }
        
        store.setHasLoadedBMI(true)
      } catch (e) {
        console.error('[CLIENT] Fetch error:', e)
        store.setError(e.message)
        if (e.message.includes('Invalid JSON') || e.message.includes('Unexpected token')) {
          store.setError('Server returned invalid response. Please create a new BMI record.')
          store.setCurrentPage('auth')
        }
        store.setHasLoadedBMI(true)
      } finally {
        store.setLoading(false)
      }
    }
    
    if (serverBase && bmiId && !hasLoadedBMI) {
      run()
    }
  }, [serverBase, bmiId])

  // Reset hasLoadedBMI when bmiId changes
  useEffect(() => {
    store.setHasLoadedBMI(false)
  }, [bmiId])

  const handleAuth = async (userData) => {
    console.log('[AUTH] Starting authentication for:', userData)
    try {
      const res = await fetch(`${serverBase}/api/user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ name: userData.name, mobile: userData.mobile })
      })
      
      const userResponse = await res.json()
      if (!res.ok) throw new Error(userResponse.error || 'Failed to create user')
      
      console.log('[AUTH] User created successfully:', userResponse)
      const newUser = { ...userData, userId: userResponse.userId }
      store.setUser(newUser)
      
      const isQRCodeVisit = !!(screenId && bmiId)
      
      if (isQRCodeVisit && bmiId && userResponse.userId && fromPlayerAppF2) {
        try {
          console.log('[AUTH] F2 Flow: Linking user to BMI record immediately:', bmiId)
          await fetch(`${serverBase}/api/bmi/${bmiId}/link-user`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ userId: userResponse.userId })
          })
          console.log('[AUTH] F2 Flow: Successfully linked user to BMI record')
        } catch (linkError) {
          console.error('[AUTH] F2 Flow: Error linking user to BMI:', linkError)
        }
      }
      
      if (!isQRCodeVisit) {
        console.log('[AUTH] Direct visit - going to dashboard')
        store.setCurrentPage('dashboard')
      } else if (fromPlayerAppF2) {
        console.log('[AUTH] F2 flow - user logged in, going to BMI calculation')
        store.setCurrentPage('bmi-result')
      } else {
        console.log('[AUTH] F1 flow - going to payment')
        store.setCurrentPage('payment')
      }
    } catch (e) {
      console.error('[AUTH] Auth error:', e)
      store.setUser(userData)
      
      const isQRCodeVisit = !!(screenId && bmiId)
      if (isQRCodeVisit && bmiId && userData.userId && fromPlayerAppF2) {
        try {
          await fetch(`${serverBase}/api/bmi/${bmiId}/link-user`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ userId: userData.userId })
          })
        } catch (linkError) {
          console.error('[AUTH] Fallback F2: Error linking user to BMI:', linkError)
        }
      }
      
      if (!isQRCodeVisit) {
        store.setCurrentPage('dashboard')
      } else if (fromPlayerAppF2) {
        store.setCurrentPage('waiting')
      } else {
        store.setCurrentPage('payment')
      }
    }
  }

  const startProgressAnimation = () => {
    store.setProgressValue(0)
    store.setProgressRunning(true)
    
    if (startProgressAnimation.intervalRef) {
      clearInterval(startProgressAnimation.intervalRef)
    }
    
    startProgressAnimation.intervalRef = setInterval(() => {
      store.setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(startProgressAnimation.intervalRef)
          store.setProgressRunning(false)
          return 100
        }
        return prev + 1
      })
    }, 50)
  }

  const generateFortune = async () => {
    if (store.fortuneGenerated) {
      console.log('[FORTUNE] Fortune already generated, skipping.')
      return
    }
    store.setFortuneGenerated(true)

    try {
      if (data?.fortune) {
        console.log('[FORTUNE] Using fortune from database:', data.fortune)
        store.setFortuneMessage(data.fortune)
        store.setCurrentPage('fortune')

        fetch(`${serverBase}/api/fortune-generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ bmiId, appVersion })
        }).catch(e => console.error('Fortune notification error:', e))

        if (!fromPlayerAppF2) {
          setTimeout(() => {
            const savedUser = localStorage.getItem('bmi_user')
            if (savedUser) {
              try {
                const userData = JSON.parse(savedUser)
                if (userData.userId) {
                  store.setCurrentPage('dashboard')
                  return
                }
              } catch (e) {
                console.error('[FORTUNE] Error parsing saved user:', e)
              }
            }
            store.setCurrentPage('dashboard')
          }, 7000)
        } else {
          store.setCurrentPage('fortune')
        }
        return
      }

      console.log('[FORTUNE] No fortune in database, generating new one')
      const response = await fetch(`${serverBase}/api/fortune-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ bmiId, appVersion })
      })

      const result = await response.json()
      if (result.ok) {
        store.setFortuneMessage(result.fortuneMessage)
        store.setCurrentPage('fortune')

        if (!fromPlayerAppF2) {
          setTimeout(() => {
            store.setCurrentPage('dashboard')
          }, 7000)
        } else {
          store.setCurrentPage('fortune')
        }
      }
    } catch (e) {
      console.error('Fortune generation error:', e)
      store.setFortuneMessage("Your health journey is just beginning! Every step forward is progress worth celebrating.")
      store.setCurrentPage('fortune')

      setTimeout(() => {
        store.setCurrentPage('dashboard')
      }, 10000)
    }
  }

  const handlePaymentSuccess = async () => {
    if (fromPlayerAppF1 && bmiId && user?.userId) {
      try {
        console.log('[PAYMENT] F1 Flow: Linking user to BMI record after payment:', bmiId)
        await fetch(`${serverBase}/api/bmi/${bmiId}/link-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ userId: user.userId })
        })
        console.log('[PAYMENT] F1 Flow: Successfully linked user to BMI record')
      } catch (linkError) {
        console.error('[PAYMENT] F1 Flow: Error linking user to BMI:', linkError)
      }
    }

    try {
      await fetch(`${serverBase}/api/payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ userId: user?.userId, bmiId, appVersion })
      })
    } catch (e) {
      console.error('Payment success notification error:', e)
    }

    console.log('[PAYMENT] F1 Flow: Navigating to progress screen - Android will connect via socket')
    store.setFortuneGenerated(false)
    store.setCurrentPage('progress')
    startProgressAnimation()

    setTimeout(() => {
      fetch(`${serverBase}/api/processing-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ bmiId, appVersion, state: 'progress' })
      }).catch(e => console.error('Progress state notification error:', e))
    }, 100)

    setTimeout(() => {
      console.log('[PAYMENT] F1 Flow: Progress completed, emitting sync event for BMI + Fortune')
      generateFortune()

      fetch(`${serverBase}/api/processing-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
          bmiId, 
          appVersion, 
          state: 'bmi-fortune',
          fortune: data?.fortune || fortuneMessage
        })
      }).catch(e => console.error('BMI+Fortune sync notification error:', e))

      store.setCurrentPage('bmi-result')
    }, 5000)
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="loading-spinner mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    )
  }

  const pageProps = {
    screenId,
    bmiId,
    serverBase,
    data,
    user,
    error,
    progressValue,
    fortuneMessage,
    appVersion,
    fromPlayerAppF1,
    fromPlayerAppF2,
    onAuth: handleAuth,
    onPaymentSuccess: handlePaymentSuccess,
    onNavigate: store.setCurrentPage,
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1]
  }

  return (
    <AnimatePresence mode="wait">
      {currentPage === 'auth' && (
        <motion.div
          key="auth"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <AuthPage {...pageProps} />
        </motion.div>
      )}
      {currentPage === 'payment' && (
        <motion.div
          key="payment"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <PaymentPage {...pageProps} />
        </motion.div>
      )}
      {currentPage === 'waiting' && (
        <motion.div
          key="waiting"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <WaitingPage {...pageProps} />
        </motion.div>
      )}
      {currentPage === 'bmi-result' && (
        <motion.div
          key="bmi-result"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <BMIResultPage {...pageProps} />
        </motion.div>
      )}
      {currentPage === 'progress' && (
        <motion.div
          key="progress"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <ProgressPage {...pageProps} onProgressStart={startProgressAnimation} />
        </motion.div>
      )}
      {currentPage === 'fortune' && (
        <motion.div
          key="fortune"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <FortunePage message={fortuneMessage} {...pageProps} />
        </motion.div>
      )}
      {currentPage === 'dashboard' && (
        <motion.div
          key="dashboard"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <DashboardPage {...pageProps} />
        </motion.div>
      )}
      {currentPage === 'analytics' && (
        <motion.div
          key="analytics"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <AnalyticsPage {...pageProps} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App