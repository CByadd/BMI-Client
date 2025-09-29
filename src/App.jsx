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
      if (!serverBase || !bmiId) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${serverBase}/api/bmi/${encodeURIComponent(bmiId)}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch BMI')
        setData(json)
        // Show auth if no user
        if (!user) {
          setShowAuth(true)
        }
      } catch (e) {
        setError(e.message)
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.userId, bmiId })
      });
    } catch (e) {
      console.error('Payment success notification error:', e);
    }
    
    // Show BMI after 5 seconds
    setTimeout(() => {
      setShowWaiting(false);
      setShowBMI(true);
    }, 5000);
  }

  if (showAuth) {
    return <AuthForm onSubmit={handleAuth} />
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

function AuthForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [isSignup, setIsSignup] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !mobile.trim()) return
    onSubmit({ name: name.trim(), mobile: mobile.trim(), isSignup })
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'system-ui, Arial' }}>
      <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
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
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
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

function Field({ label, value }) {
  return (
    <div style={{ padding: 8, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: 12, color: '#777' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  )
}

export default App
