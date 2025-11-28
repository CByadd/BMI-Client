import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function BMIResultPage({ data, user, onNavigate, appVersion }) {
  const containerRef = useRef(null)
  const bmiValueRef = useRef(null)
  const cardsRef = useRef(null)

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'text-blue-600'
    if (bmi < 25) return 'text-green-600'
    if (bmi < 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBMIBgColor = (bmi) => {
    if (bmi < 18.5) return 'bg-blue-50 border-blue-200'
    if (bmi < 25) return 'bg-green-50 border-green-200'
    if (bmi < 30) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  useEffect(() => {
    if (containerRef.current && bmiValueRef.current && cardsRef.current) {
      // Container fade in
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
      
      // BMI value counter animation
      gsap.fromTo(bmiValueRef.current,
        { textContent: 0, scale: 0.5 },
        { 
          textContent: data?.bmi?.toFixed?.(1) ?? data?.bmi ?? 0,
          scale: 1,
          duration: 1.5,
          delay: 0.5,
          ease: "back.out(1.7)",
          snap: { textContent: 0.1 },
          onUpdate: function() {
            bmiValueRef.current.textContent = parseFloat(this.targets()[0].textContent).toFixed(1)
          }
        }
      )
      
      // Cards stagger animation
      gsap.fromTo(cardsRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6, 
          stagger: 0.1, 
          delay: 1,
          ease: "back.out(1.7)" 
        }
      )
    }
    
    // F2 flow: After showing BMI result for 5 seconds, go to Fortune/Login QR
    // F1 flow: Stay on BMI result (will be handled by parent component)
    if (appVersion === 'f2') {
      const timer = setTimeout(() => {
        console.log('[BMI-RESULT] F2 flow - auto-progressing to Fortune/Login QR');
        onNavigate('fortune'); // Go to fortune page which shows login QR for F2
      }, 5000); // 5 seconds to view BMI result
      
      return () => clearTimeout(timer);
    }
  }, [data, appVersion, onNavigate])

  if (!data) return null

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div ref={containerRef} className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your BMI Results</h1>
          <p className="text-gray-600 text-lg">Here's your comprehensive body mass index analysis</p>
        </div>

        {/* Main BMI Display */}
        <div className={`card text-center mb-8 border-2 ${getBMIBgColor(data.bmi)}`}>
          <div className="mb-4">
            <div ref={bmiValueRef} className={`text-6xl font-bold ${getBMIColor(data.bmi)} mb-2`}>
              0.0
            </div>
            <div className="text-2xl font-semibold text-gray-700 mb-2">{data.category}</div>
            <div className="text-gray-600">Body Mass Index</div>
          </div>
        </div>

        {/* Details Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Height</div>
                <div className="text-2xl font-bold text-primary-600">{data.height} cm</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Weight</div>
                <div className="text-2xl font-bold text-accent-600">{data.weight} kg</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">User</div>
                <div className="text-lg font-medium text-green-600">{user?.name}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Analyzed</div>
                <div className="text-sm font-medium text-blue-600">
                  {new Date(data.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
            <span>Generating personalized insights...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BMIResultPage
