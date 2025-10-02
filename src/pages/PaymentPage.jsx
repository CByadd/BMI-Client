import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

function PaymentPage({ user, onPaymentSuccess }) {
  const [processing, setProcessing] = useState(false)
  const containerRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    if (containerRef.current && cardRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      )
      
      gsap.fromTo(cardRef.current.children,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: "power2.out" }
      )
    }
  }, [])

  const handlePayment = async () => {
    setProcessing(true)
    
    // Animate button
    gsap.to('.payment-btn', {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    })
    
    // Simulate payment processing with loading animation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProcessing(false)
    
    // Success animation
    gsap.to(containerRef.current, {
      scale: 1.05,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: onPaymentSuccess
    })
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div ref={containerRef} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Payment</h1>
          <p className="text-gray-600">Complete your purchase to access your BMI analysis</p>
        </div>

        <div ref={cardRef} className="space-y-6">
          {/* User Info Card */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mobile:</span>
                <span className="font-medium text-gray-900">{user?.mobile}</span>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="card border-2 border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Well2Day BMI Analysis</h3>
                <p className="text-gray-600 text-sm">Complete health assessment</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">₹9</div>
                {/* <div className="text-sm text-gray-500 line-through">₹199</div> */}
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Detailed BMI calculation & analysis
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Personalized health recommendations
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-powered fortune cookie message
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className={`payment-btn w-full ${processing ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner w-5 h-5 mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                'Pay ₹9 - Secure Payment'
              )}
            </button>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secured by 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default PaymentPage
