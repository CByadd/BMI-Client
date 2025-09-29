import { useEffect, useMemo, useState } from 'react'
import { gsap } from 'gsap'
import AuthPage from './pages/AuthPage'
import PaymentPage from './pages/PaymentPage'
import WaitingPage from './pages/WaitingPage'
import BMIResultPage from './pages/BMIResultPage'
import ProgressPage from './pages/ProgressPage'
import FortunePage from './pages/FortunePage'
import DashboardPage from './pages/DashboardPage'

function useQueryParams() {
  return useMemo(() => new URLSearchParams(window.location.search), [])
}

function App() {
  const params = useQueryParams()
  const screenId = params.get('screenId') || ''
  const bmiId = params.get('bmiId') || ''
  const [serverBase, setServerBase] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('loading')
  const [progressValue, setProgressValue] = useState(0)
  const [fortuneMessage, setFortuneMessage] = useState('')

  // Check if we should show dashboard directly
  useEffect(() => {
    if (window.location.pathname === '/dashboard' || window.location.pathname.includes('dashboard')) {
      setCurrentPage('dashboard')
      setLoading(false)
      return
    }
  }, [])

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
      setServerBase('https://relieved-sparrow-fairly.ngrok-free.app')
    }
  }, [])

  useEffect(() => {
    async function run() {
      if (currentPage === 'dashboard') return
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
        // Only set to auth if we're not already in a flow
        if (currentPage === 'loading' || currentPage === 'auth') {
          console.log(`[CLIENT] Setting current page to auth (current: ${currentPage})`)
          setCurrentPage('auth')
        } else {
          console.log(`[CLIENT] Not changing page, current: ${currentPage}`)
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
      console.log('[AUTH] Setting current page to payment');
      setCurrentPage('payment');
    } catch (e) {
      console.error('[AUTH] Auth error:', e);
      setUser(userData);
      localStorage.setItem('bmi_user', JSON.stringify(userData));
      console.log('[AUTH] Setting current page to payment (fallback)');
      setCurrentPage('payment');
    }
  }

  const handlePaymentSuccess = async () => {
    setCurrentPage('waiting');
    
    try {
      await fetch(`${serverBase}/api/payment-success`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ userId: user?.userId, bmiId })
      });
    } catch (e) {
      console.error('Payment success notification error:', e);
    }
    
    setTimeout(() => {
      setCurrentPage('bmi-result');
      setTimeout(() => {
        setCurrentPage('progress');
        startProgressAnimation();
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
      const response = await fetch(`${serverBase}/api/fortune-generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ bmiId })
      });
      
      const result = await response.json();
      if (result.ok) {
        setFortuneMessage(result.fortuneMessage);
        setCurrentPage('fortune');
        
        setTimeout(() => {
          setCurrentPage('dashboard');
        }, 10000); // Increased from 5 seconds to 10 seconds
      }
    } catch (e) {
      console.error('Fortune generation error:', e);
      setFortuneMessage("Your health journey is just beginning! Every step forward is progress worth celebrating.");
      setCurrentPage('fortune');
      
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 10000); // Increased from 5 seconds to 10 seconds
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
      return <FortunePage message={fortuneMessage} {...pageProps} />
    case 'dashboard':
      return <DashboardPage {...pageProps} />
    default:
      return <AuthPage {...pageProps} />
  }
}

export default App