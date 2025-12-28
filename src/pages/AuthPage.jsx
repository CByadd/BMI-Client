import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

function AuthPage({ onAuth, screenId, serverBase, bmiId }) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [step, setStep] = useState('enterDetails') // 'enterDetails' | 'enterOTP'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
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

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Focus OTP input when entering OTP step
  useEffect(() => {
    if (step === 'enterOTP' && otpInputRef.current) {
      setTimeout(() => {
        otpInputRef.current?.focus()
      }, 300)
    }
  }, [step])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim() || !mobile.trim()) {
      setError('Please enter both name and mobile number')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`${serverBase}/api/otp/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim()
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setStep('enterOTP')
        setResendTimer(60) // 60 seconds cooldown
        setError('')
        
        // Animate transition
        if (formRef.current) {
          gsap.fromTo(formRef.current,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
          )
        }
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.')
      }
    } catch (err) {
      console.error('[AUTH] Send OTP error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    
    setError('')
    setIsLoading(true)
    
    try {
      const response = await fetch(`${serverBase}/api/otp/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim()
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setResendTimer(60)
        setError('')
        setOtp('')
      } else {
        setError(data.error || 'Failed to resend OTP. Please try again.')
      }
    } catch (err) {
      console.error('[AUTH] Resend OTP error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidateOTP = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`${serverBase}/api/otp/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          mobile: mobile.trim(),
          otp: otp.trim()
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success && data.user) {
        // OTP validated, proceed with authentication
        onAuth({ 
          name: data.user.name, 
          mobile: data.user.mobile, 
          isSignup,
          userId: data.user.userId 
        })
      } else {
        setError(data.error || 'Invalid OTP. Please try again.')
        setOtp('')
      }
    } catch (err) {
      console.error('[AUTH] Validate OTP error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep('enterDetails')
    setOtp('')
    setError('')
    setResendTimer(0)
    
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      )
    }
  }

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
            {step === 'enterOTP' 
              ? 'Enter OTP' 
              : (isSignup ? 'Create Account' : 'Welcome Back')
            }
          </h1>
          <p className="text-gray-600">
            {step === 'enterOTP'
              ? `We've sent a 6-digit OTP to ${mobile}. Please enter it below.`
              : (isSignup 
              ? 'Join to access your BMI analytics dashboard'
              : 'Login to view your health analytics and trends'
              )
            }
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form 
            ref={formRef} 
            onSubmit={step === 'enterOTP' ? handleValidateOTP : handleSendOTP} 
            className="space-y-6"
          >
            {step === 'enterDetails' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="input-field"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="input-field"
                    required
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>

                <div className="flex flex-col space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                    disabled={isLoading}
                  >
                    {isSignup ? 'Already have an account? Sign in' : 'New? Create an account'}
                  </button>
                  
                  {/* Show dashboard link for existing users on direct visits */}
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
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setOtp(value)
                      setError('')
                    }}
                    placeholder="000000"
                    className="input-field text-center text-2xl tracking-widest font-semibold"
                    required
                    disabled={isLoading}
                    maxLength={6}
                  />
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    OTP sent to {mobile}
                  </p>
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="flex flex-col space-y-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors"
                    disabled={isLoading}
                  >
                    ← Change Number
                  </button>
                  
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Didn't receive OTP? </span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading || resendTimer > 0}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
export default AuthPage
