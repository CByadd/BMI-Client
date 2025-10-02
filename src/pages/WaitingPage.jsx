import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function WaitingPage({ onNavigate, data, appVersion }) {
  const containerRef = useRef(null)
  const pulseRef = useRef(null)

  useEffect(() => {
    if (containerRef.current && pulseRef.current) {
      // Fade in animation
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
      
      // Continuous pulse animation
      gsap.to(pulseRef.current, {
        scale: 1.1,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut"
      })
      
      // Floating animation for the icon
      gsap.to('.floating-icon', {
        y: -10,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut"
      })
    }
    
    // Auto-progress for F2 flow
    if (appVersion === 'f2') {
      const timer = setTimeout(() => {
        console.log('[WAITING] F2 flow - auto-progressing to BMI result');
        onNavigate('bmi-result');
      }, 3000); // 3 seconds for F2
      
      return () => clearTimeout(timer);
    }
  }, [appVersion, onNavigate])

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div ref={containerRef} className="text-center max-w-md mx-auto">
        <div className="relative mb-8">
          <div ref={pulseRef} className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
            <svg className="floating-icon w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-primary-200 rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-2 border-primary-100 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing Your BMI Analysis</h1>
        <p className="text-lg text-gray-600 mb-8">
          Our advanced algorithms are calculating your personalized health insights...
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-primary-600">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          
          <p className="text-sm text-gray-500">This usually takes a few seconds...</p>
        </div>
      </div>
    </div>
  )
}
export default WaitingPage
