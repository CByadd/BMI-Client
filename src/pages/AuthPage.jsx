import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

function AuthPage({ onAuth, screenId, serverBase }) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [showBMICreation, setShowBMICreation] = useState(false)
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
  }, [])

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
          const newUrl = `${window.location.origin}${window.location.pathname}?screenId=${screenId}&bmiId=${bmiData.bmiId}${window.location.hash}`
          window.history.replaceState({}, '', newUrl)
        }
      } catch (e) {
        console.error('BMI creation error:', e)
      }
    }
    
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
            {showBMICreation ? 'Create BMI Record' : (isSignup ? 'Create Account' : 'Welcome Back')}
          </h1>
          <p className="text-gray-600">
            {showBMICreation 
              ? 'Enter your details to create a new BMI record'
              : isSignup 
                ? 'Join thousands who trust BMI Pro for health insights'
                : 'Please verify your details to continue'
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

            {showBMICreation && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Enter height in cm"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight in kg"
                    className="input-field"
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="w-full btn-primary">
              {showBMICreation ? 'Create BMI & Continue' : (isSignup ? 'Create Account' : 'Continue to Payment')}
            </button>

            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                {isSignup ? 'Already have an account? Sign in' : 'New to BMI Pro? Create account'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowBMICreation(!showBMICreation)}
                className="text-accent-600 hover:text-accent-700 font-medium text-sm transition-colors"
              >
                {showBMICreation ? 'Hide BMI Creation' : 'Create New BMI Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default AuthPage
