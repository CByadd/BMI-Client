import { useEffect, useMemo, useState } from 'react'
import './App.css'

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
  const [showAuth, setShowAuth] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showWaiting, setShowWaiting] = useState(false)
  const [showBMI, setShowBMI] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [showFortune, setShowFortune] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [fortuneMessage, setFortuneMessage] = useState('')

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
    setServerBase('https://relieved-sparrow-fairly.ngrok-free.app')
  }, [])

  useEffect(() => {
    async function run() {
      if (!serverBase || !bmiId) {
        console.log(`[CLIENT] Missing params - serverBase: ${serverBase}, bmiId: ${bmiId}`)
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
        console.log(`[CLIENT] Response headers:`, Object.fromEntries(res.headers.entries()))
        
        const responseText = await res.text()
        console.log(`[CLIENT] Raw response:`, responseText.substring(0, 200))
        
        if (!res.ok) {
          console.error(`[CLIENT] Error response:`, responseText)
          if (res.status === 404) {
            setError('BMI record not found. Please create a new BMI record.')
            setShowAuth(true)
            return
          }
          throw new Error(`Server error ${res.status}: ${responseText}`)
        }
        
        // Try to parse as JSON
        let json
        try {
          json = JSON.parse(responseText)
        } catch (parseError) {
          console.error(`[CLIENT] JSON parse error:`, parseError)
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`)
        }
        
        console.log(`[CLIENT] BMI data received:`, json)
        setData(json)
        // Show auth if no user
        if (!user) {
          setShowAuth(true)
        }
      } catch (e) {
        console.error('[CLIENT] Fetch error:', e)
        setError(e.message)
        // If it's a JSON parse error, show auth form
        if (e.message.includes('Invalid JSON') || e.message.includes('Unexpected token')) {
          setError('Server returned invalid response. Please create a new BMI record.')
          setShowAuth(true)
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [serverBase, bmiId, user])

  const handleAuth = async (userData) => {
    try {
      // Create/find user in database
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
      
      setUser({ ...userData, userId: userResponse.userId });
      localStorage.setItem('bmi_user', JSON.stringify({ ...userData, userId: userResponse.userId }));
      setShowAuth(false);
      setShowPayment(true);
    } catch (e) {
      console.error('Auth error:', e);
      // Fallback to local storage only
      setUser(userData);
      localStorage.setItem('bmi_user', JSON.stringify(userData));
      setShowAuth(false);
      setShowPayment(true);
    }
  }

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setShowWaiting(true);
    
    try {
      // Notify server of payment success
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
    
    // Show BMI after 5 seconds, then progress after another 5 seconds
    setTimeout(() => {
      setShowWaiting(false);
      setShowBMI(true);
      
      // After BMI is shown for 5 seconds, start progress
      setTimeout(() => {
        setShowBMI(false);
        setShowProgress(true);
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
          // After progress completes, generate fortune
          generateFortune();
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total
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
        setShowProgress(false);
        setShowFortune(true);
        
        // After fortune is shown for 5 seconds, redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 5000);
      }
    } catch (e) {
      console.error('Fortune generation error:', e);
      // Fallback: show default fortune
      setFortuneMessage("Your health journey is just beginning! Every step forward is progress worth celebrating.");
      setShowProgress(false);
      setShowFortune(true);
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 5000);
    }
  }

  if (showAuth) {
    return <AuthForm onSubmit={handleAuth} screenId={screenId} serverBase={serverBase} />
  }

  if (showPayment) {
    return <PaymentForm user={user} onSuccess={handlePaymentSuccess} />
  }

  if (showWaiting) {
    return <WaitingScreen />
  }

  if (showBMI && data) {
    return <BMIDisplay data={data} user={user} />
  }

  if (showProgress) {
    return <ProgressScreen progress={progressValue} />
  }

  if (showFortune) {
    return <FortuneScreen message={fortuneMessage} />
  }

  return (
    <div style={{ maxWidth: 600, margin: '24px auto', fontFamily: 'system-ui, Arial' }}>
      <h2>BMI Result</h2>
      <div style={{ fontSize: 12, color: '#666' }}>screenId: {screenId} · bmiId: {bmiId}</div>
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, color: '#555' }}>Server Base</label>
        <input
          value={serverBase}
          onChange={(e) => setServerBase(e.target.value)}
          placeholder="http://localhost:4000"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: '#b00020' }}>{error}</p>}
      {data && (
        <div style={{ marginTop: 16, border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>BMI: {data.bmi?.toFixed?.(1) ?? data.bmi}</div>
          <div style={{ color: '#666', marginBottom: 12 }}>{data.category}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Height" value={`${data.height} cm`} />
            <Field label="Weight" value={`${data.weight} kg`} />
            <Field label="Screen ID" value={data.screenId} />
            <Field label="Timestamp" value={new Date(data.timestamp).toLocaleString()} />
          </div>
        </div>
      )}
    </div>
  )
}

function AuthForm({ onSubmit, screenId, serverBase }) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [showBMICreation, setShowBMICreation] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !mobile.trim()) return
    
    // If we have height/weight, create BMI first
    if (showBMICreation && height && weight) {
      try {
        const bmiRes = await fetch(`${serverBase}/api/bmi`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ 
            heightCm: parseFloat(height), 
            weightKg: parseFloat(weight), 
            screenId: screenId 
          })
        })
        const bmiData = await bmiRes.json()
        if (bmiRes.ok) {
          console.log('BMI created:', bmiData)
          // Update URL with new BMI ID
          const newUrl = `${window.location.origin}${window.location.pathname}?screenId=${screenId}&bmiId=${bmiData.bmiId}${window.location.hash}`
          window.history.replaceState({}, '', newUrl)
        }
      } catch (e) {
        console.error('BMI creation error:', e)
      }
    }
    
    onSubmit({ name: name.trim(), mobile: mobile.trim(), isSignup })
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'system-ui, Arial' }}>
      <h2>{showBMICreation ? 'Create BMI Record' : (isSignup ? 'Sign Up' : 'Login')}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter mobile number"
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
            required
          />
        </div>
        {showBMICreation && (
    <>
      <div>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Enter height in cm"
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight in kg"
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
                required
              />
      </div>
          </>
        )}
        <button
          type="submit"
          style={{
            padding: 12,
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          {showBMICreation ? 'Create BMI & Continue' : (isSignup ? 'Sign Up' : 'Login')}
        </button>
        {!showBMICreation && (
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            style={{
              padding: 8,
              background: 'transparent',
              color: '#667eea',
              border: 'none',
              fontSize: 14,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignup ? 'Already have an account? Login' : 'New user? Sign up'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowBMICreation(!showBMICreation)}
          style={{
            padding: 8,
            background: 'transparent',
            color: '#667eea',
            border: 'none',
            fontSize: 14,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {showBMICreation ? 'Hide BMI Creation' : 'Create New BMI Record'}
        </button>
      </form>
    </div>
  )
}

function PaymentForm({ user, onSuccess }) {
  const [processing, setProcessing] = useState(false)

  const handlePayment = async () => {
    setProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProcessing(false)
    onSuccess()
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'system-ui, Arial' }}>
      <h2>Payment</h2>
      <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#666' }}>User: {user?.name}</div>
        <div style={{ fontSize: 14, color: '#666' }}>Mobile: {user?.mobile}</div>
      </div>
      <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>BMI Analysis</div>
        <div style={{ fontSize: 14, color: '#666' }}>Price: ₹99</div>
      </div>
      <button
        onClick={handlePayment}
        disabled={processing}
        style={{
          width: '100%',
          padding: 12,
          background: processing ? '#ccc' : '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          cursor: processing ? 'not-allowed' : 'pointer'
        }}
      >
        {processing ? 'Processing...' : 'Pay ₹99'}
      </button>
    </div>
  )
}

function WaitingScreen() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, Arial',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Processing BMI Analysis</div>
      <div style={{ fontSize: 16, marginBottom: 32 }}>Please wait while we calculate your BMI...</div>
      <div style={{ 
        width: 40, 
        height: 40, 
        border: '4px solid rgba(255,255,255,0.3)', 
        borderTop: '4px solid white', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function BMIDisplay({ data, user }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, Arial',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: 20
    }}>
      <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Your BMI Result</div>
      <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>
        {data.bmi?.toFixed?.(1) ?? data.bmi}
      </div>
      <div style={{ fontSize: 20, marginBottom: 32 }}>{data.category}</div>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 16, marginBottom: 8 }}>Height: {data.height} cm</div>
        <div style={{ fontSize: 16, marginBottom: 8 }}>Weight: {data.weight} kg</div>
        <div style={{ fontSize: 16, marginBottom: 8 }}>User: {user?.name}</div>
        <div style={{ fontSize: 16 }}>Mobile: {user?.mobile}</div>
      </div>
    </div>
  )
}

function ProgressScreen({ progress }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, Arial',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: 20
    }}>
      <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 32 }}>Analyzing Your Health Data</div>
      
      <div style={{ width: '100%', maxWidth: 400, marginBottom: 24 }}>
        <div style={{ 
          width: '100%', 
          height: 8, 
          backgroundColor: 'rgba(255,255,255,0.3)', 
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            backgroundColor: 'white', 
            borderRadius: 4,
            transition: 'width 0.1s ease'
          }} />
        </div>
      </div>
      
      <div style={{ fontSize: 18, marginBottom: 16 }}>Generating personalized insights...</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{progress}%</div>
    </div>
  )
}

function FortuneScreen({ message }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, Arial',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: 20
    }}>
      <div style={{ fontSize: 48, marginBottom: 24 }}>🍪</div>
      <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 32 }}>Your Fortune Cookie</div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 32, 
        borderRadius: 16, 
        textAlign: 'center',
        maxWidth: 500,
        border: '2px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ fontSize: 18, lineHeight: 1.6, color: '#FFF8E1' }}>
          {message}
        </div>
      </div>
      
      <div style={{ fontSize: 16, marginTop: 32, opacity: 0.8 }}>
        Thank you for using our BMI service!
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ padding: 8, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: 12, color: '#777' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  )
}

export default App
