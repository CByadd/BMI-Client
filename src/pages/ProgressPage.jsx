import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'

function ProgressPage({ onProgressStart }) {
  const { progressValue } = useAppStore()

  useEffect(() => {
    if (onProgressStart) {
      onProgressStart()
    }
  }, [onProgressStart])

  const getProgressMessage = (progress) => {
    if (progress < 25) return "Initializing health analysis..."
    if (progress < 50) return "Processing BMI calculations..."
    if (progress < 75) return "Generating personalized insights..."
    if (progress < 95) return "Preparing your fortune cookie..."
    return "Almost ready!"
  }

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

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  }

  const progressBarVariants = {
    hidden: { width: 0 },
    visible: {
      width: `${progressValue}%`,
      transition: {
        duration: 0.3,
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
        className="w-full max-w-lg mx-auto text-center"
      >
        <div className="mb-8">
          <motion.div
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6"
          >
            <motion.svg
              className="w-10 h-10 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </motion.svg>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Analyzing Your Health Data
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-600 mb-8"
          >
            {getProgressMessage(progressValue)}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <motion.span
                key={progressValue}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary-600"
              >
                {progressValue}%
              </motion.span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                variants={progressBarVariants}
                initial="hidden"
                animate="visible"
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {[
              { progress: 25, label: "Health data initialized" },
              { progress: 50, label: "BMI calculations complete" },
              { progress: 75, label: "Personalized insights generated" },
              { progress: 100, label: "Fortune cookie ready" }
            ].map((item, index) => (
              <motion.div
                key={item.progress}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: progressValue >= item.progress ? 1 : 0.4,
                  x: 0
                }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`flex items-center space-x-3 ${progressValue >= item.progress ? 'text-green-600' : 'text-gray-400'}`}
              >
                <motion.div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    progressValue >= item.progress
                      ? 'border-green-600 bg-green-600'
                      : 'border-gray-300'
                  }`}
                  animate={{
                    scale: progressValue >= item.progress ? [1, 1.2, 1] : 1
                  }}
                  transition={{
                    duration: 0.3,
                    delay: progressValue >= item.progress ? 0 : 0
                  }}
                >
                  {progressValue >= item.progress && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </motion.svg>
                  )}
                </motion.div>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ProgressPage