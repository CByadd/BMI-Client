import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import AnalyticsDashboard from '../components/AnalyticsDashboard'

function AnalyticsPage() {
  const [userId, setUserId] = useState('')
  const [showDashboard, setShowDashboard] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    // Check URL params for userId
    const params = new URLSearchParams(window.location.search)
    const userIdFromUrl = params.get('userId')
    if (userIdFromUrl) {
      setUserId(userIdFromUrl)
      setShowDashboard(true)
    }

    // Check localStorage for saved user
    const savedUser = localStorage.getItem('bmi_user')
    if (savedUser && !userIdFromUrl) {
      try {
        const user = JSON.parse(savedUser)
        if (user.userId) {
          setUserId(user.userId)
          setShowDashboard(true)
        }
      } catch (e) {
        console.error('Error parsing saved user:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
    }
  }, [showDashboard])

  const handleUserIdSubmit = (e) => {
    e.preventDefault()
    if (userId.trim()) {
      setShowDashboard(true)
      // Update URL
      const url = new URL(window.location)
      url.searchParams.set('userId', userId.trim())
      window.history.pushState({}, '', url)
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 rounded-xl flex items-center justify-center">
                <img src="https://api.well2day.in/assets/images/logo.png" alt="logo" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BMI Analytics</h1>
                <p className="text-sm text-gray-600">Health Insights Dashboard</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setShowDashboard(false)
                setUserId('')
                const url = new URL(window.location)
                url.searchParams.delete('userId')
                window.history.pushState({}, '', url)
              }}
              className="btn-secondary"
            >
              Change User
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="max-w-7xl mx-auto px-4 py-12">
        {!showDashboard ? (
          <div className="max-w-md mx-auto">
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Analytics</h2>
                <p className="text-gray-600">Enter your User ID to view your BMI analytics and trends.</p>
              </div>

              <form onSubmit={handleUserIdSubmit}>
                <div className="mb-4">
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="input-field"
                    placeholder="Enter your User ID (UUID format)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can find your User ID in your profile or after completing a BMI measurement.
                  </p>
                </div>

                <button type="submit" className="w-full btn-primary">
                  View Analytics
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Demo User IDs:</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setUserId('demo-user-1')}
                    className="text-xs text-blue-600 hover:text-blue-800 block"
                  >
                    demo-user-1 (Sample data)
                  </button>
                  <button
                    onClick={() => setUserId('demo-user-2')}
                    className="text-xs text-blue-600 hover:text-blue-800 block"
                  >
                    demo-user-2 (Sample data)
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">📊 Your Health Analytics</h1>
              <p className="text-xl text-gray-600">
                Comprehensive insights into your BMI journey and health trends.
              </p>
            </div>
            
            <AnalyticsDashboard userId={userId} />
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsPage









