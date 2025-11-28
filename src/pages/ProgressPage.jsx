import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function ProgressPage({ progressValue, onProgressStart }) {
  const containerRef = useRef(null)
  const progressBarRef = useRef(null)
  const percentageRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
    }
    
    // Start progress animation when component mounts or when onProgressStart is called
    if (onProgressStart) {
      onProgressStart()
    }
  }, [onProgressStart])

  useEffect(() => {
    if (progressBarRef.current && percentageRef.current) {
      // Animate progress bar
      gsap.to(progressBarRef.current, {
        width: `${progressValue}%`,
        duration: 0.3,
        ease: "power2.out"
      })
      
      // Animate percentage counter
      gsap.to(percentageRef.current, {
        textContent: progressValue,
        duration: 0.3,
        snap: { textContent: 1 },
        ease: "power2.out"
      })
    }
  }, [progressValue])

  const getProgressMessage = (progress) => {
    if (progress < 25) return "Initializing health analysis..."
    if (progress < 50) return "Processing BMI calculations..."
    if (progress < 75) return "Generating personalized insights..."
    if (progress < 95) return "Preparing your fortune cookie..."
    return "Almost ready!"
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div ref={containerRef} className="w-full max-w-lg mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Your Health Data</h1>
          <p className="text-lg text-gray-600 mb-8">{getProgressMessage(progressValue)}</p>
        </div>

        <div className="card">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span ref={percentageRef} className="text-2xl font-bold text-primary-600">0%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                ref={progressBarRef}
                className="progress-bar h-full w-0 transition-all duration-300 ease-out"
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center space-x-3 ${progressValue >= 25 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${progressValue >= 25 ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                {progressValue >= 25 && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">Health data initialized</span>
            </div>
            
            <div className={`flex items-center space-x-3 ${progressValue >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${progressValue >= 50 ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                {progressValue >= 50 && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">BMI calculations complete</span>
            </div>
            
            <div className={`flex items-center space-x-3 ${progressValue >= 75 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${progressValue >= 75 ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                {progressValue >= 75 && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">Personalized insights generated</span>
            </div>
            
            <div className={`flex items-center space-x-3 ${progressValue >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${progressValue >= 100 ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                {progressValue >= 100 && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">Fortune cookie ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ProgressPage
