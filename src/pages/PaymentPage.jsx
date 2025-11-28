import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'

function PaymentPage({ user, onPaymentSuccess }) {
  const [processing, setProcessing] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 200,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const handlePayment = async () => {
    setProcessing(true)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProcessing(false)
    
    onPaymentSuccess()
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4"
          >
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Payment</h1>
          <p className="text-gray-600">Complete your purchase to access your BMI analysis</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="card"
          >
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
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="card border-2 border-primary-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Well2Day BMI Analysis</h3>
                <p className="text-gray-600 text-sm">Complete health assessment</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-right"
              >
                <div className="text-3xl font-bold text-primary-600">₹9</div>
              </motion.div>
            </div>
            
            <div className="space-y-2 mb-6">
              {[
                "Detailed BMI calculation & analysis",
                "Personalized health recommendations",
                "AI-powered fortune cookie message"
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center text-sm text-gray-600"
                >
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={handlePayment}
              disabled={processing}
              whileHover={!processing ? { scale: 1.02 } : {}}
              whileTap={!processing ? { scale: 0.98 } : {}}
              className={`payment-btn w-full ${processing ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Processing Payment...
                </div>
              ) : (
                'Pay ₹9 - Secure Payment'
              )}
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-2 text-sm text-gray-500"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secured by 256-bit SSL encryption</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default PaymentPage