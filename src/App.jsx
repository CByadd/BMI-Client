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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsAndConditionsPage from './pages/TermsAndConditionsPage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import ContactUsPage from './pages/ContactUsPage'
import AboutUsPage from './pages/AboutUsPage'
import DevPanel from './components/DevPanel'
import Footer from './components/Footer'
import { useApiStore } from './stores/apiStore'
import { useUserSessionStore } from './stores/userSessionStore'
import { updateBaseURL } from './lib/axios'
import { getApiBaseUrl } from './config/api.config'
import api from './lib/api'
import { getUserFromStorage, isSessionValidSync } from './utils/sessionHelper'

function useQueryParams() {
  return useMemo(() => new URLSearchParams(window.location.search), [])
}

function App() {
  const params = useQueryParams()
  const screenId = params.get('screenId') || ''
  const bmiId = params.get('bmiId') || ''
  const appVersion = params.get('appVersion') || '' // Detect specific app version
  const paymentToken = params.get('paymentToken') || '' // Payment token for verification
  const fromPlayerAppF2 = appVersion === 'f2' // F2 = claim-only: no payment, link BMI to user when they log in or are already logged in
  const fromPlayerAppF1 = appVersion === 'f1' // Detect if coming from PlayerApp BMI F1
  const fromPlayerApp = fromPlayerAppF1 || fromPlayerAppF2 // Detect if coming from any PlayerApp version
  const [serverBase, setServerBase] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  
  // Initialize user from localStorage IMMEDIATELY (synchronous, before any effects)
  const initialUser = getUserFromStorage()
  const [user, setUser] = useState(initialUser)
  
  const [currentPage, setCurrentPage] = useState('loading')
  const [progressValue, setProgressValue] = useState(0)
  const [fortuneMessage, setFortuneMessage] = useState('')

  // Get session store methods
  const { setUser: setSessionUser } = useUserSessionStore()

  // Log initial user load
  useEffect(() => {
    if (initialUser) {
      console.log('[CLIENT] User loaded from localStorage on mount:', initialUser.userId)
    } else {
      console.log('[CLIENT] No user found in localStorage on mount')
    }
  }, []) // Only run once on mount

  // Sync user to Zustand store when it changes
  useEffect(() => {
    if (user && user.userId) {
      setSessionUser(user)
    }
  }, [user, setSessionUser])

  // Load saved user and handle routing - SIMPLE VERSION
  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase()
    
    // Use the user state that was initialized from localStorage
    const loadedUser = user
    
    // Handle static pages (no auth required)
    if (pathname === '/privacy-policy' || pathname.includes('/privacy-policy')) {
      setCurrentPage('privacy-policy')
      setLoading(false)
      return
    }
    if (pathname === '/terms-and-conditions' || pathname.includes('/terms-and-conditions')) {
      setCurrentPage('terms-and-conditions')
      setLoading(false)
      return
    }
    if (pathname === '/refund-policy' || pathname.includes('/refund-policy')) {
      setCurrentPage('refund-policy')
      setLoading(false)
      return
    }
    if (pathname === '/contact-us' || pathname.includes('/contact-us')) {
      setCurrentPage('contact-us')
      setLoading(false)
      return
    }
    if (pathname === '/about-us' || pathname.includes('/about-us')) {
      setCurrentPage('about-us')
      setLoading(false)
      return
    }
    
    // Check session validity for protected pages (dashboard/analytics)
    if (pathname === '/dashboard' || pathname.includes('dashboard')) {
      if (loadedUser && loadedUser.userId) {
        console.log('[CLIENT] Dashboard access with valid session')
        setCurrentPage('dashboard')
        setLoading(false)
        return
      }
      console.log('[CLIENT] No valid session for dashboard, redirecting to auth')
      setCurrentPage('auth')
      setLoading(false)
      return
    }
    
    if (pathname === '/analytics' || pathname.includes('analytics')) {
      if (loadedUser && loadedUser.userId) {
        console.log('[CLIENT] Analytics access with valid session')
        setCurrentPage('analytics')
        setLoading(false)
        return
      }
      console.log('[CLIENT] No valid session for analytics, redirecting to auth')
      setCurrentPage('auth')
      setLoading(false)
      return
    }
    
    // Check if user is visiting directly (not via QR code) and has valid session
    const isDirectVisit = !bmiId && !screenId // No QR code parameters
    if (isDirectVisit) {
      if (loadedUser && loadedUser.userId) {
        console.log('[CLIENT] Direct visit with valid session, auto-logging in')
        setCurrentPage('dashboard')
        setLoading(false)
        return
      } else {
        console.log('[CLIENT] Session expired or invalid, showing auth page')
        setCurrentPage('auth')
        setLoading(false)
      }
    }
  }, [bmiId, screenId, user])

  const { setServerBase: setStoreServerBase } = useApiStore()

  useEffect(() => {
    // Get base URL from config (which handles URL params, env vars, and defaults)
    const base = getApiBaseUrl()
    setServerBase(base)
    setStoreServerBase(base)
    updateBaseURL(base)
  }, [setStoreServerBase])

  // Protect dashboard and analytics pages - redirect to auth if no valid session
  useEffect(() => {
    if (currentPage === 'dashboard' || currentPage === 'analytics') {
      if (!isSessionValidSync() || !user || !user.userId) {
        console.log('[CLIENT] Protected page accessed without valid session, redirecting to auth')
        setCurrentPage('auth')
      }
    }
  }, [currentPage, user])

  useEffect(() => {
    async function run() {
      if (currentPage === 'dashboard' || currentPage === 'analytics') return
      
      // Check if this is a QR code visit (has screenId and bmiId)
      const isQRCodeVisit = !!(screenId && bmiId)
      
      if (!isQRCodeVisit) {
        // Direct visit without QR code parameters - check if user is logged in
        if (user && user.userId && isSessionValidSync()) {
          console.log(`[CLIENT] Direct visit with logged in user, staying on current page`)
          setLoading(false)
          return
        } else {
          console.log(`[CLIENT] Direct visit - no QR code parameters and no user, showing auth`)
          setCurrentPage('auth')
          setLoading(false)
          return
        }
      }
      
      if (!serverBase || !bmiId) {
        console.log(`[CLIENT] Missing params - serverBase: ${serverBase}, bmiId: ${bmiId}`)
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        // Update server base if needed
        if (serverBase) {
          setStoreServerBase(serverBase)
          updateBaseURL(serverBase)
        }
        
        console.log(`[CLIENT] Fetching BMI for: ${bmiId}`)
        
        const json = await api.getBMI(bmiId)
        
        console.log(`[CLIENT] BMI data received:`, json)
        setData(json)
        
        // If user is already logged in and BMI record has no user, link them (F2 only)
        const currentSessionUser = useUserSessionStore.getState().user
        if (currentSessionUser && currentSessionUser.userId && !json.userId && fromPlayerAppF2) {
          try {
            console.log('[CLIENT] F2 Flow: Auto-linking logged-in user to BMI record')
            await api.linkUserToBMI(bmiId, currentSessionUser.userId)
            console.log('[CLIENT] F2 Flow: Successfully auto-linked user to BMI record');
            
            // Update the data with user info
            json.userId = currentSessionUser.userId;
            json.user = currentSessionUser;
            setData(json);
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
          // F1: Check if user has valid session - if yes, skip auth and go to payment
          const currentUser = user || getUserFromStorage()
          if (currentUser && currentUser.userId && isSessionValidSync()) {
            console.log(`[CLIENT] F1 QR code visit with valid session - skipping auth, going to payment`)
            setUser(currentUser) // Ensure user state is set
            useUserSessionStore.getState().setUser(currentUser) // Sync to session store
            setCurrentPage('payment')
          } else {
            console.log(`[CLIENT] Coming from PlayerApp BMI F1, showing login/payment flow`)
            // F1: Show login/payment flow first, then synchronized flow after payment
            setCurrentPage('auth')
          }
        } else {
          // Regular web users: Check if user has valid session
          const currentUser = user || getUserFromStorage()
          if (currentUser && currentUser.userId && isSessionValidSync()) {
            console.log(`[CLIENT] QR code visit with valid session - skipping auth, going to payment`)
            setUser(currentUser) // Ensure user state is set
            useUserSessionStore.getState().setUser(currentUser) // Sync to session store
            setCurrentPage('payment')
          } else {
            // Regular web users: show login/payment flow
            setCurrentPage('auth')
          }
        }
      } catch (e) {
        console.error('[CLIENT] Fetch error:', e)
        const errorMessage = e?.message || 'Failed to fetch BMI data'
        setError(errorMessage)
        if (e.status === 404 || errorMessage.includes('not found')) {
          setError('BMI record not found. Please create a new BMI record.')
          setCurrentPage('auth')
        } else if (errorMessage.includes('Invalid JSON') || errorMessage.includes('Unexpected token')) {
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
      // If user is already authenticated via OTP (has userId and token), skip user creation
      let finalUserData = userData;
      
      if (!userData.userId) {
        // Legacy flow: Create user via API
        const userResponse = await api.createUser(userData.name, userData.mobile);
        console.log('[AUTH] User created successfully:', userResponse);
        finalUserData = { ...userData, userId: userResponse.userId };
      } else {
        console.log('[AUTH] User already authenticated via OTP:', userData.userId);
      }
      
      setUser(finalUserData);
      // Save with 8-day session expiry using Zustand store
      setSessionUser(finalUserData);
      
      // Check if this is a QR code visit or direct visit
      const isQRCodeVisit = !!(screenId && bmiId)
      
      // If F2 QR code visit, link the user to the BMI record immediately after login
      if (isQRCodeVisit && bmiId && finalUserData.userId && fromPlayerAppF2) {
        try {
          console.log('[AUTH] F2 Flow: Linking user to BMI record immediately:', bmiId);
          await api.linkUserToBMI(bmiId, finalUserData.userId);
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
      // Save with 8-day session expiry even in error fallback using Zustand store
      setSessionUser(userData);
      
      // Try to link user even in fallback (only for F2 flow)
      const isQRCodeVisit = !!(screenId && bmiId)
      if (isQRCodeVisit && bmiId && userData.userId && fromPlayerAppF2) {
        try {
          console.log('[AUTH] Fallback F2: Linking user to BMI record:', bmiId);
          await api.linkUserToBMI(bmiId, userData.userId);
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

  const handlePaymentSuccess = async (paymentAmount) => {
    setCurrentPage('waiting');
    
    // For F1 flow, link user to BMI record after payment completion
    if (fromPlayerAppF1 && bmiId && user?.userId) {
      try {
        console.log('[PAYMENT] F1 Flow: Linking user to BMI record after payment:', bmiId);
        await api.linkUserToBMI(bmiId, user.userId);
        console.log('[PAYMENT] F1 Flow: Successfully linked user to BMI record');
      } catch (linkError) {
        console.error('[PAYMENT] F1 Flow: Error linking user to BMI:', linkError);
        // Continue with flow even if linking fails
      }
    }
    
    // Include payment amount and token in payment success notification
    await api.notifyPaymentSuccess(user?.userId, bmiId, appVersion, paymentToken, paymentAmount);
    
    setTimeout(() => {
      setCurrentPage('bmi-result');
      setTimeout(() => {
        setCurrentPage('progress');
        startProgressAnimation();
        
        // Notify server to emit progress-start to Android
        api.notifyProgressStart(bmiId);
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
        api.notifyFortuneGenerate(bmiId, appVersion).catch(e => console.error('Fortune notification error:', e));
        
        setTimeout(() => {
          setCurrentPage('dashboard');
        }, 10000);
        return;
      }
      
      // Fallback: generate fortune if not in database (for backward compatibility)
      console.log('[FORTUNE] No fortune in database, generating new one');
      const result = await api.notifyFortuneGenerate(bmiId, appVersion);
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

  const currentPageComponent = (() => {
    switch (currentPage) {
      case 'privacy-policy':
        return <PrivacyPolicyPage />
      case 'terms-and-conditions':
        return <TermsAndConditionsPage />
      case 'refund-policy':
        return <RefundPolicyPage />
      case 'contact-us':
        return <ContactUsPage />
      case 'about-us':
        return <AboutUsPage />
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
  })()

  const isStaticPage = ['privacy-policy', 'terms-and-conditions', 'refund-policy', 'contact-us', 'about-us'].includes(currentPage)
  
  // Pages that should not show footer (full-screen experiences)
  const hideFooterPages = ['loading', 'waiting', 'progress', 'bmi-result', 'fortune']
  const showFooter = !hideFooterPages.includes(currentPage)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {currentPageComponent}
      </div>
      {showFooter && <Footer />}
      {/* {!isStaticPage && <DevPanel />} */}
    </div>
  )
}

export default App