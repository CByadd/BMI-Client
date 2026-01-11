import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import ScreenLogo from '../components/ScreenLogo'
import api from '../lib/api'
import { updateBaseURL } from '../lib/axios'
import { useApiStore } from '../stores/apiStore'
import { useUserSessionStore } from '../stores/userSessionStore'

function AuthPage({ onAuth, screenId, serverBase, bmiId }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [mobile, setMobile] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef(null)
  const formRef = useRef(null)

  const { user: sessionUser } = useUserSessionStore()

  useEffect(() => {
    // Load saved user data from session store
    if (sessionUser) {
      setName(sessionUser.name || '')
      setMobile(sessionUser.mobile || '')
      setIsSignup(false)
    }
    
    // For direct visits, default to login
    const isDirectVisit = !screenId && !bmiId
    if (isDirectVisit) {
      setIsSignup(false)
    }
  }, [screenId, bmiId, sessionUser])

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
  }, [isSignup]) // Re-animate when switching between login/signup

  const handleSignup = async (e) => {
    e?.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!gender) {
      setError('Please select your gender')
      return
    }

    if (!age || parseInt(age) <= 0) {
      setError('Please enter a valid age')
      return
    }

    if (!mobile.trim()) {
      setError('Mobile number is required')
      return
    }

    setLoading(true)
    try {
      // Update server base if needed
      if (serverBase) {
        useApiStore.getState().setServerBase(serverBase)
        updateBaseURL(serverBase)
      }
      
      const userResponse = await api.createUser(name.trim(), gender, parseInt(age), mobile.trim())
      
      const userData = {
        name: userResponse.name,
        mobile: userResponse.mobile,
        userId: userResponse.userId,
        gender: userResponse.gender,
        age: userResponse.age
      }

      // Save to Zustand store with 8-day session expiry
      const { setUser: setSessionUser } = useUserSessionStore.getState()
      setSessionUser(userData)

      // Call onAuth callback
      onAuth(userData)
    } catch (err) {
      console.error('Signup error:', err)
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to create account'
      
      // If user already exists, redirect to login
      if (errorMessage.includes('already exists') || err?.response?.status === 409) {
        setError('Account already exists. Please login instead.')
        setTimeout(() => {
          setIsSignup(false)
          setError('')
        }, 2000)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e?.preventDefault()
    setError('')

    if (!mobile.trim()) {
      setError('Mobile number is required')
      return
    }

    setLoading(true)
    try {
      // Update server base if needed
      if (serverBase) {
        useApiStore.getState().setServerBase(serverBase)
        updateBaseURL(serverBase)
      }
      
      const userResponse = await api.loginUser(mobile.trim())
      
      const userData = {
        name: userResponse.name,
        mobile: userResponse.mobile,
        userId: userResponse.userId,
        gender: userResponse.gender,
        age: userResponse.age
      }

      // Save to Zustand store with 8-day session expiry
      const { setUser: setSessionUser } = useUserSessionStore.getState()
      setSessionUser(userData)

      // Call onAuth callback
      onAuth(userData)
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to login'
      
      // If user not found, redirect to signup
      if (errorMessage.includes('not found') || err?.response?.status === 404) {
        setError('Account not found. Please create an account first.')
        setTimeout(() => {
          setIsSignup(true)
          setError('')
        }, 2000)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Signup form
  if (isSignup) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div ref={containerRef} className="w-full max-w-md">
          <ScreenLogo screenId={screenId} serverBase={serverBase} />
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Enter your details to get started
            </p>
          </div>

          <div className="card">
            <form ref={formRef} onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={gender === 'Male'}
                      onChange={(e) => {
                        setGender(e.target.value)
                        setError('')
                      }}
                      className="mr-2"
                      required
                    />
                    <span className="text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={gender === 'Female'}
                      onChange={(e) => {
                        setGender(e.target.value)
                        setError('')
                      }}
                      className="mr-2"
                      required
                    />
                    <span className="text-gray-700">Female</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || (parseInt(value) > 0 && parseInt(value) <= 150)) {
                      setAge(value)
                      setError('')
                    }
                  }}
                  placeholder="Enter your age"
                  className="input-field"
                  required
                  min="1"
                  max="150"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter your mobile number"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alphanumeric characters are allowed
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
                disabled={loading || !name.trim() || !gender || !age || !mobile.trim()}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignup(false)
                  setError('')
                }}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors text-center w-full"
              >
                Already have an account? Login
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Login form
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div ref={containerRef} className="w-full max-w-md">
        <ScreenLogo screenId={screenId} serverBase={serverBase} />
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Enter your mobile number to login
          </p>
        </div>

        <div className="card">
          <form ref={formRef} onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value)
                  setError('')
                }}
                placeholder="Enter your mobile number"
                className="input-field"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Alphanumeric characters are allowed
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
              disabled={loading || !mobile.trim()}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignup(true)
                setError('')
              }}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors text-center w-full"
            >
              New? Create an account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
