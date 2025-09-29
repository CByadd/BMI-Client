import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function DashboardPage() {
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

  const handleStartNewBMI = () => {
    gsap.to('.cta-button', {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        window.location.href = '/'
      }
    })
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div ref={headerRef} className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BMI Pro</h1>
                <p className="text-sm text-gray-600">Professional Health Analysis</p>
              </div>
            </div>
            
            <button 
              onClick={handleStartNewBMI}
              className="btn-primary cta-button"
            >
              New BMI Check
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🎉 Congratulations!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your BMI analysis is complete! You've taken an important step towards better health awareness.
          </p>
        </div>

        {/* Features Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="feature-card card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">📊 Accurate BMI Analysis</h3>
            <p className="text-gray-600 leading-relaxed">
              Get precise BMI calculations with detailed health insights and personalized recommendations based on your unique profile.
            </p>
          </div>

          <div className="feature-card card text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">🥠 AI Fortune Cookie</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive motivational messages powered by artificial intelligence, tailored specifically to inspire your health journey.
            </p>
          </div>

          <div className="feature-card card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">📱 Cross-Platform Sync</h3>
            <p className="text-gray-600 leading-relaxed">
              Seamless experience across all your devices with real-time synchronization and secure cloud storage.
            </p>
          </div>

          <div className="feature-card card text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">🔒 Secure & Private</h3>
            <p className="text-gray-600 leading-relaxed">
              Your health data is protected with enterprise-grade security and privacy measures you can trust.
            </p>
          </div>

          <div className="feature-card card text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">⚡ Lightning Fast</h3>
            <p className="text-gray-600 leading-relaxed">
              Get instant results with our optimized algorithms and premium infrastructure for the best user experience.
            </p>
          </div>

          <div className="feature-card card text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">💝 Health Focused</h3>
            <p className="text-gray-600 leading-relaxed">
              Built by health professionals with a focus on promoting wellness and positive lifestyle changes.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="card bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready for Another Analysis?</h2>
            <p className="text-gray-600 mb-6">
              Track your progress over time with regular BMI checks and see how your health journey evolves.
            </p>
            <button 
              onClick={handleStartNewBMI}
              className="btn-primary cta-button text-lg px-8 py-4"
            >
              Start New BMI Check
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/50 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">
            © 2025 BMI Pro. Empowering healthier lives through intelligent analysis.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage