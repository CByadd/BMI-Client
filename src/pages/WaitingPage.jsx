import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'

function WaitingPage({ onNavigate, data, appVersion }) {
  const { setCurrentPage, fromPlayerAppF2 } = useAppStore()

  useEffect(() => {
    // Auto-progress for F2 flow: Waiting (5 sec) → BMI Result → Fortune/Login QR
    if (fromPlayerAppF2 || appVersion === 'f2') {
      const timer1 = setTimeout(() => {
        console.log('[WAITING] F2 flow - auto-progressing to BMI result (5 sec)')
        setCurrentPage('bmi-result')
        
        const timer2 = setTimeout(() => {
          console.log('[WAITING] F2 flow - auto-progressing to Fortune/Login QR')
          setCurrentPage('fortune')
        }, 5000)
        
        return () => clearTimeout(timer2)
      }, 5000)
      
      return () => clearTimeout(timer1)
    }
  }, [appVersion, fromPlayerAppF2, setCurrentPage])

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }

  const pulseVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: [1, 1.1, 1],
      opacity: 1,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const iconVariants = {
    hidden: { y: 0 },
    visible: {
      y: [-10, 10, -10],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-md mx-auto"
      >
        <div className="relative mb-8">
          <motion.div
            variants={pulseVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6 relative z-10"
          >
            <motion.svg
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              className="w-12 h-12 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </motion.svg>
          </motion.div>
          
          {/* Animated rings */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            <div className="w-32 h-32 border-2 border-primary-200 rounded-full"></div>
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
              ease: "easeOut"
            }}
          >
            <div className="w-40 h-40 border-2 border-primary-100 rounded-full"></div>
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Processing Your BMI Analysis
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 mb-8"
        >
          Our advanced algorithms are calculating your personalized health insights...
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center space-x-2 text-primary-600">
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
          
          <p className="text-sm text-gray-500">This usually takes a few seconds...</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default WaitingPage