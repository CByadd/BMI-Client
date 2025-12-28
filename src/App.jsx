import { useEffect, useMemo, useState } from 'react'
import { gsap } from 'gsap'
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
      // setServerBase('https://bmi-server-eight.vercel.app') // Change to your server URL
      setServerBase(' https://wan-changeable-efferently.ngrok-free.dev') // Change to your server URL
    }
  }, [])

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
      let userId = userData.userId;
      
      // If userId not provided, fallback to old API (for backward compatibility)
      if (!userId) {
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
          if (res.ok && userResponse.userId) {
            userId = userResponse.userId;
            console.log('[AUTH] User created successfully via fallback API:', userResponse);
          }
        } catch (e) {
          console.error('[AUTH] Fallback API error:', e);
        }
      } else {
        console.log('[AUTH] User authenticated via OTP:', userData);
      }
      
      // Set user state
      setUser({ ...userData, userId: userId });
      localStorage.setItem('bmi_user', JSON.stringify({ ...userData, userId: userId }));
      
      // Check if this is a QR code visit or direct visit
      const isQRCodeVisit = !!(screenId && bmiId)
      
      // If F2 QR code visit, link the user to the BMI record immediately after login
      if (isQRCodeVisit && bmiId && userId && fromPlayerAppF2) {
        try {
          console.log('[AUTH] F2 Flow: Linking user to BMI record immediately:', bmiId);
          await fetch(`${serverBase}/api/bmi/${bmiId}/link-user`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ userId: userId })
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
      await fetch(`${serverBase}/api/payment-success`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ userId: user?.userId, bmiId, appVersion })
      });
    } catch (e) {
      console.error('Payment success notification error:', e);
    }
    
    setTimeout(() => {
      setCurrentPage('bmi-result');
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
      return <WaitingPage {...pageProps} />
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