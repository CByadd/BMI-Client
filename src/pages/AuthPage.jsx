import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

function AuthPage({ onAuth, screenId, serverBase, bmiId }) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('mobile') // 'mobile' | 'otp' | 'name'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isSignup, setIsSignup] = useState(false)
  const containerRef = useRef(null)
  const formRef = useRef(null)
  const otpInputRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('bmi_user')
    if (saved) {
      try {
        const userData = JSON.parse(saved)
        setName(userData.name || '')
        setMobile(userData.mobile || '')
        setIsSignup(false)
      } catch {}
    }
    
    // For direct visits, just show login form
    const isDirectVisit = !screenId && !bmiId
    if (isDirectVisit) {
      setIsSignup(false) // Default to login for existing users
    }
  }, [screenId, bmiId])

  useEffect(() => {
    if (containerRef.current && formRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
      
      gsap.fromTo(formRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "power2.out" }
      )
    }
  }, [])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Focus OTP input when step changes to OTP
  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 300)
    }
  }, [step])

  const cleanMobile = (mobile) => {
    return mobile.replace(/\D/g, '')
  }

  const handleSendOTP = async (e) => {
    e?.preventDefault()
    setError('')
    
    const cleanMobileNumber = cleanMobile(mobile)
    if (cleanMobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${serverBase}/api/otp/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ mobile: cleanMobileNumber })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      // OTP sent successfully
      setStep('otp')
      setCountdown(60) // 60 second countdown
      setMobile(cleanMobileNumber) // Update with cleaned mobile
    } catch (err) {
      console.error('Send OTP error:', err)
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e?.preventDefault()
    setError('')

    if (otp.length < 4) {
      setError('Please enter the complete OTP')
      return
    }

    setLoading(true)
    try {
      const cleanMobileNumber = cleanMobile(mobile)
      const response = await fetch(`${serverBase}/api/otp/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
          mobile: cleanMobileNumber,
          otp: otp,
          name: name.trim() || undefined // Include name if provided (for signup)
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Check if user needs to provide name (new user registration)
        if (data.error && data.error.includes('name')) {
          setStep('name')
          setError('')
          return
        }
        throw new Error(data.error || 'Invalid OTP')
      }

      // OTP verified successfully, user logged in
      const userData = {
        name: data.user.name,
        mobile: data.user.mobile,
        userId: data.user.userId || data.user.id,
        token: data.token
      }

      // Save to localStorage
      localStorage.setItem('bmi_user', JSON.stringify(userData))
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }

      // Call onAuth callback
      onAuth(userData)
    } catch (err) {
      console.error('Verify OTP error:', err)
      setError(err.message || 'Invalid OTP. Please try again.')
      setOtp('') // Clear OTP on error
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    setOtp('')
    setError('')
    await handleSendOTP()
  }

  const handleBackToMobile = () => {
    setStep('mobile')
    setOtp('')
    setError('')
  }

  const handleNameSubmit = async (e) => {
    e?.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    // Go back to OTP verification with name
    setStep('otp')
    setError('')
  }

  // Mobile input step
  if (step === 'mobile') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div ref={containerRef} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignup 
                ? 'Enter your mobile number to get started'
                : 'Enter your mobile number to login'
              }
            </p>
          </div>

          <div className="card">
            <form ref={formRef} onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    const cleaned = cleanMobile(e.target.value)
                    if (cleaned.length <= 10) {
                      setMobile(cleaned)
                      setError('')
                    }
                  }}
                  placeholder="Enter your 10-digit mobile number"
                  className="input-field"
                  required
                  maxLength={10}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send you an OTP to verify your number
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading || cleanMobile(mobile).length !== 10}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                >
                  {isSignup ? 'Already have an account? Sign in' : 'New? Create an account'}
                </button>
                
                {!screenId && !bmiId && localStorage.getItem('bmi_user') && (
                  <button
                    type="button"
                    onClick={() => window.location.href = '/dashboard'}
                    className="text-accent-600 hover:text-accent-700 font-medium text-sm transition-colors"
                  >
                    View My Dashboard →
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Name input step (for new user registration)
  if (step === 'name') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div ref={containerRef} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              Please enter your name to continue
            </p>
          </div>

          <div className="card">
            <form ref={formRef} onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter your full name"
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading || !name.trim()}
              >
                Continue
              </button>

              <button
                type="button"
                onClick={handleBackToMobile}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors text-center"
              >
                ← Back to mobile number
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // OTP verification step
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div ref={containerRef} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enter OTP
          </h1>
          <p className="text-gray-600">
            We've sent an OTP to <span className="font-semibold">{mobile}</span>
          </p>
        </div>

        <div className="card">
          <form ref={formRef} onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                ref={otpInputRef}
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 6) {
                    setOtp(value)
                    setError('')
                  }
                }}
                placeholder="Enter 6-digit OTP"
                className="input-field text-center text-2xl tracking-widest font-mono"
                required
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                OTP is valid for 5 minutes
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full btn-primary"
              disabled={loading || otp.length < 4}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0}
                className={`font-medium text-sm transition-colors ${
                  countdown > 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-primary-600 hover:text-primary-700'
                }`}
              >
                {countdown > 0 
                  ? `Resend OTP in ${countdown}s`
                  : 'Resend OTP'
                }
              </button>

              <button
                type="button"
                onClick={handleBackToMobile}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                ← Change mobile number
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
