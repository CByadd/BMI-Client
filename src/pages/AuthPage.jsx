import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

function AuthPage({ onAuth, screenId, serverBase, bmiId }) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const containerRef = useRef(null)
  const formRef = useRef(null)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !mobile.trim()) return
    
    // Animate form submission
    gsap.to(formRef.current, {
      scale: 0.95,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    })
    
    // BMI creation removed - client is read-only for analytics
    
    onAuth({ name: name.trim(), mobile: mobile.trim(), isSignup })
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
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignup 
              ? 'Join to access your BMI analytics dashboard'
              : 'Login to view your health analytics and trends'
            }
          </p>
        </div>

        <div className="card">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="input-field"
                required
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
              />
            </div>

            {/* BMI creation fields removed - client is read-only */}

            <button type="submit" className="w-full btn-primary">
              {isSignup ? 'Create Account' : 'Login to Dashboard'}
            </button>

            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
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
              
              {/* <button
                type="button"
                onClick={() => setShowBMICreation(!showBMICreation)}
                className="text-accent-600 hover:text-accent-700 font-medium text-sm transition-colors"
              >
                {showBMICreation ? 'Hide BMI Creation' : 'Create New BMI Record'}
              </button> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default AuthPage
