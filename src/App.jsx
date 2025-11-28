import { useEffect, useMemo, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { io } from 'socket.io-client'
import AuthPage from './pages/AuthPage'
import PaymentPage from './pages/PaymentPage'
import WaitingPage from './pages/WaitingPage'
import BMIResultPage from './pages/BMIResultPage'
import ProgressPage from './pages/ProgressPage'
import FortunePage from './pages/FortunePage'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'

function useQueryParams() {
  return useMemo(() => new URLSearchParams(window.location.search), [])
}

function App() {
  const params = useQueryParams()
  const screenId = params.get('screenId') || ''
  const bmiId = params.get('bmiId') || ''
  const appVersion = params.get('appVersion') || '' // Detect specific app version
  const token = params.get('token') || '' // Token for QR code URL expiration
  const fromPlayerAppF2 = appVersion === 'f2' // Detect if coming from PlayerApp BMI F2
  const fromPlayerAppF1 = appVersion === 'f1' // Detect if coming from PlayerApp BMI F1
  const fromPlayerApp = fromPlayerAppF1 || fromPlayerAppF2 // Detect if coming from any PlayerApp version
  const [serverBase, setServerBase] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('loading')
  const [progressValue, setProgressValue] = useState(0)
  const [fortuneMessage, setFortuneMessage] = useState('')
  const socketRef = useRef(null)
  const hasLoadedBMIRef = useRef(false) // Use ref to prevent re-renders

  // Check if we should show dashboard or analytics directly
  useEffect(() => {
    if (window.location.pathname === '/dashboard' || window.location.pathname.includes('dashboard')) {
      setCurrentPage('dashboard')
      setLoading(false)
      return
    }
    if (window.location.pathname === '/analytics' || window.location.pathname.includes('analytics')) {
      setCurrentPage('analytics')
      setLoading(false)
      return
    }
    
    // Check if user is visiting directly (not via QR code) and has saved login
    const isDirectVisit = !bmiId && !screenId // No QR code parameters
    if (isDirectVisit) {
      const savedUser = localStorage.getItem('bmi_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          if (userData.userId) {
            console.log('[CLIENT] Direct visit with saved user, showing dashboard')
            setUser(userData)
            setCurrentPage('dashboard')
            setLoading(false)
            return
          }
        } catch (e) {
          console.error('[CLIENT] Error parsing saved user:', e)
          localStorage.removeItem('bmi_user') // Clean up corrupted data
        }
      }
    }
  }, [bmiId, screenId])

  // Load saved user
  useEffect(() => {
    const saved = localStorage.getItem('bmi_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {}
    }
  }, [])

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const fromHash = hash.get('server')
    const base = fromHash || `${window.location.origin.replace(/\/$/, '')}`.replace(/\/$/, '')
    setServerBase(base)
  }, [])

  useEffect(() => {
    // Use the server base from URL hash if available, otherwise use ngrok
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const fromHash = hash.get('server')
    if (fromHash) {
      setServerBase(fromHash)
    } else {
      // Updated to point to Server instead of Adscape-Server
      // TODO: Update this URL to your server deployment URL
      setServerBase(' https://relieved-sparrow-fairly.ngrok-free.app/api') // Change to your server URL
    }
  }, [])

  // Set up Socket.IO connection for F1 flow synchronization
  useEffect(() => {
    if (!fromPlayerAppF1 || !screenId || !serverBase) {
      return
    }
    
    // Don't reconnect if already connected
    if (socketRef.current?.connected) {
      console.log('[SOCKET] Already connected, skipping reconnection')
      return
    }
    
    console.log('[SOCKET] Setting up Socket.IO connection for F1 flow sync')
    
    // Get socket URL from serverBase - handle both /api and without /api
    let socketUrl = serverBase
    if (socketUrl.endsWith('/api')) {
      socketUrl = socketUrl.replace('/api', '')
    }
    // Remove trailing slash
    socketUrl = socketUrl.replace(/\/$/, '')
    
    console.log('[SOCKET] Connecting to:', socketUrl)
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    socket.on('connect', () => {
      console.log('[SOCKET] Connected to server')
      // Join the screen room for receiving events (use 'player-join' as per server)
      if (screenId) {
        socket.emit('player-join', { screenId })
        console.log('[SOCKET] Joined screen room:', screenId)
      }
    })
    
    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected from server')
    })
    
    socket.on('processing-state', (payload) => {
      console.log('[SOCKET] Processing state received:', payload)
      const state = payload.processingState
      
      // Sync screen based on processing state (only sync if not already on that page)
      if (state === 'waiting') {
        console.log('[SOCKET] Syncing to waiting screen')
        setCurrentPage('waiting')
      } else if (state === 'bmi-result') {
        console.log('[SOCKET] Syncing to BMI result screen')
        setCurrentPage('bmi-result')
      } else if (state === 'progress') {
        console.log('[SOCKET] Syncing to progress screen')
        setCurrentPage('progress')
        // Progress animation will start when ProgressPage mounts
      }
    })
    
    socket.on('payment-success', (payload) => {
      console.log('[SOCKET] Payment success received:', payload)
      // Update data with payment info
      if (payload.user) {
        setData(prev => ({ ...prev, user: payload.user, userId: payload.userId }))
      }
      // Sync to waiting screen if not already there
      if (currentPage !== 'waiting') {
        setCurrentPage('waiting')
      }
    })
    
    socket.on('fortune-ready', (payload) => {
      console.log('[SOCKET] Fortune ready received:', payload)
      if (payload.fortune || payload.fortuneMessage) {
        setFortuneMessage(payload.fortune || payload.fortuneMessage)
        if (currentPage !== 'fortune') {
          setCurrentPage('fortune')
        }
      }
    })
    
    socketRef.current = socket
    
    return () => {
      console.log('[SOCKET] Cleaning up Socket.IO connection')
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [fromPlayerAppF1, screenId, serverBase]) // Remove currentPage from dependencies to prevent reconnection loops

  useEffect(() => {
    async function run() {
      // Don't reload if we're on dashboard/analytics or have already loaded
      if (currentPage === 'dashboard' || currentPage === 'analytics' || hasLoadedBMIRef.current) {
        return
      }
      
      // Check if this is a QR code visit (has screenId and bmiId)
      const isQRCodeVisit = !!(screenId && bmiId)
      
      if (!isQRCodeVisit) {
        // Direct visit without QR code parameters
        console.log(`[CLIENT] Direct visit - no QR code parameters`)
        setCurrentPage('auth')
        setLoading(false)
        return
      }
      
      if (!serverBase || !bmiId) {
        console.log(`[CLIENT] Missing params - serverBase: ${serverBase}, bmiId: ${bmiId}`)
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        // Include token in URL if available (for QR code access)
        let url = `${serverBase}/api/bmi/${encodeURIComponent(bmiId)}`
        if (token) {
          url += `?token=${encodeURIComponent(token)}`
          console.log(`[CLIENT] Using token for BMI access`)
        }
        console.log(`[CLIENT] Fetching BMI from: ${url}`)
        
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        })
        
        console.log(`[CLIENT] Response status: ${res.status}`)
        
        const responseText = await res.text()
        console.log(`[CLIENT] Raw response:`, responseText.substring(0, 200))
        
        if (!res.ok) {
          console.error(`[CLIENT] Error response:`, responseText)
          if (res.status === 404) {
            setError('BMI record not found. Please create a new BMI record.')
            setCurrentPage('auth')
            return
          }
          if (res.status === 401) {
            // Token expired or invalid
            try {
              const errorData = JSON.parse(responseText)
              setError(errorData.message || 'This QR code has expired or has already been used. Please scan a new QR code.')
            } catch {
              setError('This QR code has expired or has already been used. Please scan a new QR code.')
            }
            setCurrentPage('auth')
            return
          }
          if (res.status === 403) {
            // Token mismatch
            setError('Invalid QR code. Please scan a new QR code.')
            setCurrentPage('auth')
            return
          }
          throw new Error(`Server error ${res.status}: ${responseText}`)
        }
        
        let json
        try {
          json = JSON.parse(responseText)
        } catch (parseError) {
          console.error(`[CLIENT] JSON parse error:`, parseError)
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`)
        }
        
        console.log(`[CLIENT] BMI data received:`, json)
        setData(json)
        
        // If user is already logged in and BMI record has no user, link them (F2 only)
        const savedUser = localStorage.getItem('bmi_user')
        if (savedUser && !json.userId && fromPlayerAppF2) {
          try {
            const userData = JSON.parse(savedUser)
            if (userData.userId) {
              console.log('[CLIENT] F2 Flow: Auto-linking logged-in user to BMI record')
              await fetch(`${serverBase}/api/bmi/${bmiId}/link-user`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ userId: userData.userId })
              });
              console.log('[CLIENT] F2 Flow: Successfully auto-linked user to BMI record');
              
              // Update the data with user info
              json.userId = userData.userId;
              json.user = userData;
              setData(json);
            }
          } catch (linkError) {
            console.error('[CLIENT] F2 Flow: Error auto-linking user:', linkError);
          }
        }
        
        // Handle different PlayerApp versions according to flowcharts
        if (fromPlayerAppF2) {
          console.log(`[CLIENT] Coming from PlayerApp BMI F2`)
          // F2 Flow: Waiting (5 sec) → BMI Result → Fortune/Login QR
          setCurrentPage('waiting')
        } else if (fromPlayerAppF1) {
          console.log(`[CLIENT] Coming from PlayerApp BMI F1`)
          // F1 Flow: Check user cache
          // If user cache exists: Payment → Waiting → BMI Result → Fortune → Adscape
          // If user cache NOT exists: Auth → Payment → Waiting → BMI Result → Fortune → Dashboard
          const savedUser = localStorage.getItem('bmi_user')
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser)
              if (userData.userId) {
                console.log(`[CLIENT] F1: User cache exists, going to payment`)
                setUser(userData)
                setCurrentPage('payment') // Has cache: skip auth, go to payment
              } else {
                setCurrentPage('auth') // No valid cache: show login
              }
            } catch (e) {
              setCurrentPage('auth') // Error parsing: show login
            }
          } else {
            console.log(`[CLIENT] F1: No user cache, showing login`)
            setCurrentPage('auth') // No cache: show login
          }
        } else {
          // Regular web users: show login/payment flow
          setCurrentPage('auth')
        }
        
        // Mark as loaded to prevent re-fetching (only on successful load)
        hasLoadedBMIRef.current = true
      } catch (e) {
        console.error('[CLIENT] Fetch error:', e)
        setError(e.message)
        if (e.message.includes('Invalid JSON') || e.message.includes('Unexpected token')) {
          setError('Server returned invalid response. Please create a new BMI record.')
          setCurrentPage('auth')
        }
        hasLoadedBMIRef.current = true // Mark as loaded even on error to prevent loops
      } finally {
        setLoading(false)
      }
    }
    // Only run if we haven't loaded yet and have required params
    if (serverBase && bmiId && !hasLoadedBMIRef.current) {
      run()
    }
  }, [serverBase, bmiId, token]) // Only depend on params that should trigger reload
  
  // Reset hasLoadedBMI when bmiId changes (new QR code scan)
  useEffect(() => {
    hasLoadedBMIRef.current = false
  }, [bmiId])

  const handleAuth = async (userData) => {
    console.log('[AUTH] Starting authentication for:', userData);
    try {
      const res = await fetch(`${serverBase}/api/user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ name: userData.name, mobile: userData.mobile })
      });
      const userResponse = await res.json();
      if (!res.ok) throw new Error(userResponse.error || 'Failed to create user');
      
      console.log('[AUTH] User created successfully:', userResponse);
      setUser({ ...userData, userId: userResponse.userId });
      localStorage.setItem('bmi_user', JSON.stringify({ ...userData, userId: userResponse.userId }));
      
      // Check if this is a QR code visit or direct visit
      const isQRCodeVisit = !!(screenId && bmiId)
      
      // If F2 QR code visit, link the user to the BMI record immediately after login
      if (isQRCodeVisit && bmiId && userResponse.userId && fromPlayerAppF2) {
        try {
          console.log('[AUTH] F2 Flow: Linking user to BMI record immediately:', bmiId);
          await fetch(`${serverBase}/api/bmi/${bmiId}/link-user`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ userId: userResponse.userId })
          });
          console.log('[AUTH] F2 Flow: Successfully linked user to BMI record');
        } catch (linkError) {
          console.error('[AUTH] F2 Flow: Error linking user to BMI:', linkError);
          // Continue with flow even if linking fails
        }
      }
      // Note: For F1 flow, user linking happens after payment completion
      
      if (!isQRCodeVisit) {
        // Direct visit - go straight to dashboard
        console.log('[AUTH] Direct visit - going to dashboard');
        setCurrentPage('dashboard');
      } else if (fromPlayerAppF2) {
        // F2 flow: After login → BMI Calculation → Dashboard
        console.log('[AUTH] F2 flow - user logged in, going to BMI calculation');
        setCurrentPage('bmi-result');
      } else {
        // F1 flow: After login → Payment → Waiting → BMI Result → Fortune → Dashboard
        console.log('[AUTH] F1 flow - going to payment');
        setCurrentPage('payment');
      }
    } catch (e) {
      console.error('[AUTH] Auth error:', e);
      setUser(userData);
      localStorage.setItem('bmi_user', JSON.stringify(userData));
      
      // Try to link user even in fallback (only for F2 flow)
      const isQRCodeVisit = !!(screenId && bmiId)
      if (isQRCodeVisit && bmiId && userData.userId && fromPlayerAppF2) {
        try {
          console.log('[AUTH] Fallback F2: Linking user to BMI record:', bmiId);
          await fetch(`${serverBase}/api/bmi/${bmiId}/link-user`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ userId: userData.userId })
          });
          console.log('[AUTH] Fallback F2: Successfully linked user to BMI record');
        } catch (linkError) {
          console.error('[AUTH] Fallback F2: Error linking user to BMI:', linkError);
        }
      }
      
      // Same logic for fallback
      if (!isQRCodeVisit) {
        setCurrentPage('dashboard');
      } else if (fromPlayerAppF2) {
        setCurrentPage('waiting');
      } else {
        setCurrentPage('payment');
      }
    }
  }

  const handlePaymentSuccess = async () => {
    // F1 Flow: Payment → Waiting → BMI Result → Fortune → Dashboard/Adscape
    setCurrentPage('waiting');
    
    // For F1 flow, link user to BMI record after payment completion
    if (fromPlayerAppF1 && bmiId && user?.userId) {
      try {
        console.log('[PAYMENT] F1 Flow: Linking user to BMI record after payment:', bmiId);
        await fetch(`${serverBase}/api/bmi/${bmiId}/link-user`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ userId: user.userId })
        });
        console.log('[PAYMENT] F1 Flow: Successfully linked user to BMI record');
      } catch (linkError) {
        console.error('[PAYMENT] F1 Flow: Error linking user to BMI:', linkError);
        // Continue with flow even if linking fails
      }
    }
    
    try {
      // Notify server about payment success and that we're entering processing state
      await fetch(`${serverBase}/api/payment-success`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ userId: user?.userId, bmiId, appVersion })
      });
      
      // Immediately notify server that we're in processing/waiting state (sync with Android)
      await fetch(`${serverBase}/api/processing-start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ bmiId, appVersion, state: 'waiting' })
      });
    } catch (e) {
      console.error('Payment success notification error:', e);
    }
    
    // After 5 seconds: Waiting → BMI Result
    setTimeout(() => {
      // Notify server that we're showing BMI result
      fetch(`${serverBase}/api/processing-start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ bmiId, appVersion, state: 'bmi-result' })
      }).catch(e => console.error('BMI result notification error:', e));
      
      setCurrentPage('bmi-result');
      
      // After 5 seconds: BMI Result → Fortune
      setTimeout(() => {
        setCurrentPage('progress');
        startProgressAnimation();
        
        // Notify server to emit progress-start to Android
        fetch(`${serverBase}/api/progress-start`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ bmiId })
        }).catch(e => console.error('Progress start notification error:', e));
      }, 5000);
    }, 5000);
  }

  const startProgressAnimation = () => {
    setProgressValue(0);
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          generateFortune();
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  }

  const generateFortune = async () => {
    try {
      // Use fortune from database if available
      if (data?.fortune) {
        console.log('[FORTUNE] Using fortune from database:', data.fortune);
        setFortuneMessage(data.fortune);
        setCurrentPage('fortune');
        
        // Notify server to emit fortune-ready to Android
        fetch(`${serverBase}/api/fortune-generate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ bmiId, appVersion })
        }).catch(e => console.error('Fortune notification error:', e));
        
        // For F1: Go to dashboard after fortune
        // For F2: Fortune page will handle login QR logic
        if (!fromPlayerAppF2) {
          setTimeout(() => {
            // F1: Check if user cache exists to determine destination
            const savedUser = localStorage.getItem('bmi_user')
            if (savedUser) {
              try {
                const userData = JSON.parse(savedUser)
                if (userData.userId) {
                  // F1 with cache: Go to dashboard (could loop back to Adscape in future)
                  setCurrentPage('dashboard')
                  return
                }
              } catch (e) {
                console.error('[FORTUNE] Error parsing saved user:', e)
              }
            }
            // F1 without cache or error: Go to dashboard after 7 seconds
            setCurrentPage('dashboard')
          }, 7000); // 7 seconds for F1 fortune screen
        } else {
          // F2: Stay on fortune page (it will show login QR and handle flow)
          setCurrentPage('fortune')
        }
        return;
      }
      
      // Fallback: generate fortune if not in database (for backward compatibility)
      console.log('[FORTUNE] No fortune in database, generating new one');
      const response = await fetch(`${serverBase}/api/fortune-generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ bmiId, appVersion })
      });
      
      const result = await response.json();
      if (result.ok) {
        setFortuneMessage(result.fortuneMessage);
        setCurrentPage('fortune');
        
      // For F1: Go to dashboard after 7 seconds
      // For F2: Fortune page will handle login QR logic (15 seconds)
      if (!fromPlayerAppF2) {
        setTimeout(() => {
          setCurrentPage('dashboard')
        }, 7000); // 7 seconds for F1
        } else {
          // F2: Stay on fortune page (it will show login QR and handle flow)
          setCurrentPage('fortune')
        }
      }
    } catch (e) {
      console.error('Fortune generation error:', e);
      setFortuneMessage("Your health journey is just beginning! Every step forward is progress worth celebrating.");
      setCurrentPage('fortune');
      
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 10000);
    }
  }

  if (loading) {
  return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
      </div>
      </div>
    )
  }

  const pageProps = {
    screenId,
    bmiId,
    serverBase,
    setServerBase,
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
    onNavigate: setCurrentPage
  }

  switch (currentPage) {
    case 'auth':
      return <AuthPage {...pageProps} />
    case 'payment':
      return <PaymentPage {...pageProps} />
    case 'waiting':
      return <WaitingPage {...pageProps} />
    case 'bmi-result':
      return <BMIResultPage {...pageProps} />
    case 'progress':
      return <ProgressPage {...pageProps} onProgressStart={startProgressAnimation} />
    case 'fortune':
      return <FortunePage message={fortuneMessage} onNavigate={setCurrentPage} {...pageProps} />
    case 'dashboard':
      return <DashboardPage {...pageProps} />
    case 'analytics':
      return <AnalyticsPage {...pageProps} />
    default:
      return <AuthPage {...pageProps} />
  }
}

export default App