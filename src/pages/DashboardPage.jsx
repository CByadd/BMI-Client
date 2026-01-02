import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import UserMenu from '../components/UserMenu'
import { useUserSessionStore } from '../stores/userSessionStore'

function DashboardPage({ user, data, serverBase }) {
  const { clearUser } = useUserSessionStore()
  const containerRef = useRef(null)
  const cardsRef = useRef(null)
  const headerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current && cardsRef.current && headerRef.current) {
      // Header animation
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
      
      // Cards stagger animation
      gsap.fromTo(cardsRef.current.children,
        { opacity: 0, y: 50, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6, 
          stagger: 0.15, 
          delay: 0.3,
          ease: "back.out(1.7)" 
        }
      )
      
      // Floating animation for feature cards
      gsap.to('.feature-card', {
        y: -5,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut",
        stagger: 0.3,
        delay: 1
      })
    }
  }, [])

  // BMI creation removed - client is read-only for analytics

  const handleLogout = () => {
    clearUser()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div ref={headerRef} className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className=" bg-primary-600 rounded-xl flex items-center justify-center">
                <img src="https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759391612/Well2Day/imgi_1_Group_2325_f1mz13.png" alt="logo" />
              </div>
              <div>
                {/* <h1 className="text-xl font-bold text-gray-900">Well2Day</h1> */}
                {/* <p className="text-sm text-gray-600">Professional Health Analysis</p> */}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {user && <UserMenu user={user} onLogout={handleLogout} />}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4"> Health Analytics Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user?.name ? `Welcome back, ${user.name}!` : 'Welcome!'} Track your BMI journey with detailed analytics and insights.
          </p>
        </div>

        {/* Analytics Dashboard */}
        {user?.userId ? (
          <AnalyticsDashboard userId={user.userId} />
        ) : (
          <div className="card text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">Please complete the BMI measurement process to access your analytics dashboard.</p>
            <button 
              onClick={handleStartNewBMI}
              className="btn-primary"
            >
              Start BMI Check
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
export default DashboardPage
