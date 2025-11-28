import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import QRCode from 'qrcode'
import { useAppStore } from '../stores/useAppStore'

function FortunePage({ message, data, onNavigate }) {
  const { fortuneMessage, fromPlayerAppF2, setCurrentPage } = useAppStore()
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const displayMessage = message || fortuneMessage || "Your health journey is just beginning! Every step forward is progress worth celebrating."

  // Generate QR code
  useEffect(() => {
    if (data?.webUrl) {
      QRCode.toDataURL(data.webUrl, { width: 200, margin: 2 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR Code generation failed:', err))
    }
  }, [data])

  // Auto-navigation logic
  useEffect(() => {
    if (fromPlayerAppF2) {
      const savedUser = localStorage.getItem('bmi_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          if (userData.userId) {
            const timer = setTimeout(() => {
              console.log('[FORTUNE] F2: User cache exists, going to BMI calculation')
              setCurrentPage('bmi-result')
            }, 3000)
            return () => clearTimeout(timer)
          }
        } catch (e) {
          console.error('[FORTUNE] Error parsing saved user:', e)
        }
      }
      // Stay on fortune/login QR screen for 15 seconds
      const timer = setTimeout(() => {
        console.log('[FORTUNE] F2: 15 seconds elapsed, navigating to dashboard')
        setCurrentPage('dashboard')
      }, 15000)
      return () => clearTimeout(timer)
    } else {
      // F1: Auto-redirect to dashboard after 7 seconds
      const timer = setTimeout(() => {
        console.log('[FORTUNE] F1: 7 seconds elapsed, navigating to dashboard')
        setCurrentPage('dashboard')
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [fromPlayerAppF2, setCurrentPage])

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.2
      }
    }
  }

  const cookieVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3
      }
    }
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 1,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl mx-auto text-center"
      >
        <div className="mb-8">
          <motion.div
            variants={cookieVariants}
            initial="hidden"
            animate="visible"
            className="text-8xl mb-6"
          >
            <motion.span
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🥠
            </motion.span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Your Fortune Cookie
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-600"
          >
            A personalized message for your health journey
          </motion.p>
        </div>

        <motion.div
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          className="card border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-primary-50 mb-8"
        >
          <div className="relative">
            <div className="absolute -top-2 -left-2 text-4xl text-accent-300">"</div>
            <div className="absolute -bottom-6 -right-2 text-4xl text-accent-300">"</div>
            
            <div className="px-8 py-4">
              <p className="text-xl leading-relaxed text-gray-800 font-medium">
                {displayMessage}
              </p>
            </div>
          </div>
        </motion.div>

        {qrCodeUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            className="card border-2 border-primary-200 bg-white mb-8"
          >
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {fromPlayerAppF2 ? 'Login To Track Your Progress' : 'Scan to continue on mobile'}
              </h3>
              <motion.div
                className="flex justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 border-2 border-gray-200 rounded-lg shadow-lg"
                />
              </motion.div>
              <p className="text-sm text-gray-600 mt-3">
                {fromPlayerAppF2 ? 'Scan with your mobile device to login' : 'Use your mobile device to scan this QR code'}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center space-x-2 text-primary-600">
            <motion.svg
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </motion.svg>
            <span className="font-medium">Thank you for choosing BMI Pro</span>
          </div>
          
          <p className="text-sm text-gray-500">
            {fromPlayerAppF2 
              ? 'Staying on this screen for 15 seconds...' 
              : 'Redirecting to your dashboard in 7 seconds...'}
          </p>
          
          <div className="flex items-center justify-center space-x-1">
            {[0, 0.1, 0.2].map((delay) => (
              <motion.div
                key={delay}
                className="w-2 h-2 bg-primary-600 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default FortunePage