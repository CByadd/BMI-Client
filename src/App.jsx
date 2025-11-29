import { useEffect, useMemo, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { io } from 'socket.io-client'
import AuthPage from './pages/AuthPage'
import PaymentPage from './pages/PaymentPage'
import WaitingPage from './pages/WaitingPage'
import AnalyzingPage from './pages/AnalyzingPage'
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
  const token = params.get('token') || '' // Token for pairing
  const fromPlayerAppF2 = appVersion === 'f2' // Detect if coming from PlayerApp BMI F2
  const fromPlayerAppF1 = appVersion === 'f1' // Detect if coming from PlayerApp BMI F1
  const fromPlayerApp = fromPlayerAppF1 || fromPlayerAppF2 // Detect if coming from any PlayerApp version
  const [tokenClaimed, setTokenClaimed] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false)
  const [serverBase, setServerBase] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('loading')
  const [progressValue, setProgressValue] = useState(0)
  const [fortuneMessage, setFortuneMessage] = useState('')
  const progressIntervalRef = useRef(null)
  const socketRef = useRef(null)
  const [androidReady, setAndroidReady] = useState(false)
  
  // Helper function to wait for Android app to be ready
  const waitForAndroidApp = async (maxWaitSeconds = 60) => {
    if (!screenId || !serverBase) {
      console.log('[CLIENT] [SYNC] No screenId or serverBase, skipping Android wait')
      return true
    }
    
    console.log(`[CLIENT] [SYNC] Waiting for Android app to be ready (max wait: ${maxWaitSeconds}s)...`)
    const maxAttempts = Math.floor(maxWaitSeconds / 2) // Check every 2 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${serverBase}/api/debug/connections`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        const result = await response.json()
        const roomName = `screen:${screenId}`
        const room = result.rooms?.find(r => r.room === roomName)
        const androidConnected = room && room.size > 0
        
        console.log(`[CLIENT] [SYNC] Attempt ${attempt + 1}/${maxAttempts}: Android status:`, {
          roomName,
          roomSize: room?.size || 0,
          androidConnected
        })
        
        if (androidConnected) {
          console.log('[CLIENT] [SYNC] ✅ Android app is ready!')
          setAndroidReady(true)
          return true
        }
      } catch (e) {
        console.error('[CLIENT] [SYNC] Error checking Android status:', e)
      }
      
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    console.log('[CLIENT] [SYNC] ⚠️ Android app not ready after waiting, proceeding anyway')
    return false
  }

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
      setServerBase('https://adscape-server-c4eedvgxgqcdepfe.centralindia-01.azurewebsites.net') // Change to your server URL
    }
  }, [])

  // Connect to Socket.IO and wait for Android app (only for QR code visits)
  useEffect(() => {
    if (!screenId || !serverBase) return
    
    const isQRCodeVisit = !!(screenId && bmiId)
    if (!isQRCodeVisit || !fromPlayerApp) return
    
    console.log('[CLIENT] [SOCKET] Connecting to server for Android sync:', serverBase)
    const socketUrl = serverBase.replace('/api', '')
    console.log('[CLIENT] [SOCKET] Socket URL:', socketUrl)
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      timeout: 20000,
      // Pass BMI session token (if any) in Socket.IO auth payload
      auth: token ? { bmiToken: token } : {}
    })
    
    socket.on('connect', () => {
      console.log('[CLIENT] [SOCKET] ✅ Connected to server, socket ID:', socket.id)
      // Join the same room as Android app
      socket.emit('player-join', {
        screenId: screenId,
        machineId: screenId,
        type: 'web'
      })
      console.log('[CLIENT] [SOCKET] Joined room for screenId:', screenId)
    })
    
    socket.on('disconnect', (reason) => {
      console.log('[CLIENT] [SOCKET] Disconnected from server, reason:', reason)
      setAndroidReady(false)
    })
    
    socket.on('connect_error', (error) => {
      console.error('[CLIENT] [SOCKET] Connection error:', error)
      setAndroidReady(false)
    })
    
    // Listen for Android screen state changes
    socket.on('android-screen-state', (data) => {
      console.log('[CLIENT] [SOCKET] ✅ Android screen state changed:', data)
      if (data.state === 'loading' || data.state === 'bmi') {
        console.log('[CLIENT] [SOCKET] Android switched from QR to', data.state, '- client can proceed')
        setAndroidReady(true)
      }
    })
    
    // Listen for Android payment confirmation (legacy, keeping for compatibility)
    socket.on('android-payment-received', (data) => {
      console.log('[CLIENT] [SOCKET] ✅ Android confirmed payment received:', data)
      setAndroidReady(true)
    })
    
    // NEW: listen for explicit android-ready event
    socket.on('android-ready', (data) => {
      console.log('[CLIENT] [SOCKET] ✅ Received android-ready event:', data)
      setAndroidReady(true)
    })
    
    socketRef.current = socket
    
    return () => {
      if (socket) {
        console.log('[CLIENT] [SOCKET] Disconnecting socket')
        socket.disconnect()
      }
    }
  }, [screenId, bmiId, serverBase, fromPlayerApp])

  // Claim token when QR is scanned (for F1 flow)
  useEffect(() => {
    if (token && screenId && bmiId && fromPlayerAppF1 && serverBase) {
      console.log('[CLIENT] [TOKEN] Claiming token:', token)
      fetch(`${serverBase}/api/token/claim`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ token })
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          console.log('[CLIENT] [TOKEN] ✅ Token claimed successfully:', data)
          setTokenClaimed(true)
          
          // Start monitoring token status
          const checkTokenStatus = async () => {
            let attempts = 0
            const maxAttempts = 30 // 30 seconds (30 * 1s)
            
            while (attempts < maxAttempts && !tokenExpired) {
              try {
                const statusRes = await fetch(`${serverBase}/api/token/${token}/status`, {
                  headers: { 'ngrok-skip-browser-warning': 'true' }
                })
                const statusData = await statusRes.json()
                
                if (statusData.ok) {
                  console.log('[CLIENT] [TOKEN] Token status:', statusData.token)
                  if (statusData.token.isExpired || statusData.token.isUnusedTimeout) {
                    console.log('[CLIENT] [TOKEN] ⚠️ Token expired or unused timeout')
                    setTokenExpired(true)
                    break
                  }
                }
              } catch (e) {
                console.error('[CLIENT] [TOKEN] Error checking status:', e)
              }
              
              attempts++
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
          
          checkTokenStatus()
        } else {
          console.log('[CLIENT] [TOKEN] ⚠️ Token claim failed:', data.error)
          setTokenExpired(true)
        }
      })
      .catch(e => {
        console.error('[CLIENT] [TOKEN] Error claiming token:', e)
      })
    }
  }, [token, screenId, bmiId, fromPlayerAppF1, serverBase])

  useEffect(() => {
    async function run() {
      if (currentPage === 'dashboard' || currentPage === 'analytics') return
      
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
        const url = `${serverBase}/api/bmi/${encodeURIComponent(bmiId)}`
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
        
        // Handle different PlayerApp versions
        if (fromPlayerAppF2) {
          console.log(`[CLIENT] Coming from PlayerApp BMI F2, auto-progressing through flow`)
          setCurrentPage('bmi-result')
          
          // F2: Auto-progress through the flow
          setTimeout(() => {
            setCurrentPage('progress')
            startProgressAnimation()
          }, 5000)
        } else if (fromPlayerAppF1) {
          console.log(`[CLIENT] Coming from PlayerApp BMI F1, showing login/payment flow`)
          // F1: Show login/payment flow first, then synchronized flow after payment
          setCurrentPage('auth')
        } else {
          // Regular web users: show login/payment flow
          setCurrentPage('auth')
        }
      } catch (e) {
        console.error('[CLIENT] Fetch error:', e)
        setError(e.message)
        if (e.message.includes('Invalid JSON') || e.message.includes('Unexpected token')) {
          setError('Server returned invalid response. Please create a new BMI record.')
          setCurrentPage('auth')
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [serverBase, bmiId]) // Removed user and currentPage from dependencies

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
        // F2 flow: Auth -> Waiting -> BMI Result -> Dashboard
        console.log('[AUTH] F2 flow - going to waiting');
        setCurrentPage('waiting');
      } else {
        // F1 flow: Auth -> Payment -> Waiting -> BMI Result -> Fortune -> Dashboard
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
    // For F1: show \"Analyzing\" screen, for F2: keep existing waiting screen
    if (fromPlayerAppF1) {
      setCurrentPage('analyzing')
    } else {
      setCurrentPage('waiting')
    }
    
    // For F1 flow, link user to BMI record after payment completion
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
        // Continue with flow even if linking fails
      }
    }
    
    try {
      await fetch(`${serverBase}/api/payment-success`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        // Include token so server can move token state from qr_scanned -> payment_done
        body: JSON.stringify({ userId: user?.userId, bmiId, appVersion, token })
      })
    } catch (e) {
      console.error('Payment success notification error:', e)
    }
    
    // For F2 flow, keep existing behavior (wait for Android and show progress)
    if (!fromPlayerAppF1) {
      console.log('[PAYMENT] [SYNC] Waiting for Android app to be ready...')
      waitForAndroidApp(60).then(() => {
        console.log('[PAYMENT] [SYNC] Proceeding with flow after Android sync')
        // Proceed with flow
        setCurrentPage('bmi-result')
        setTimeout(() => {
          setCurrentPage('progress')
          startProgressAnimation()
          
          // Notify server to emit progress-start to Android
          fetch(`${serverBase}/api/progress-start`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ bmiId })
          }).catch(e => console.error('Progress start notification error:', e))
        }, 5000)
      })
    }
  }

  const startProgressAnimation = () => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    setProgressValue(0);
    progressIntervalRef.current = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          generateFortune();
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  }
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

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
        
        setTimeout(() => {
          setCurrentPage('dashboard');
        }, 10000);
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
        
        setTimeout(() => {
          setCurrentPage('dashboard');
        }, 10000);
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
      return <WaitingPage {...pageProps} socketRef={socketRef} />
    case 'analyzing':
      return <AnalyzingPage {...pageProps} socketRef={socketRef} token={token} onNavigate={setCurrentPage} />
    case 'bmi-result':
      return <BMIResultPage {...pageProps} />
    case 'progress':
      return <ProgressPage {...pageProps} />
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