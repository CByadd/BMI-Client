import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'

function BMIResultPage({ data, user, onNavigate, appVersion }) {
  const { setCurrentPage } = useAppStore()

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
    // F2 flow: After showing BMI result for 5 seconds, go to Fortune/Login QR
    if (appVersion === 'f2') {
      const timer = setTimeout(() => {
        console.log('[BMI-RESULT] F2 flow - auto-progressing to Fortune/Login QR')
        setCurrentPage('fortune')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [appVersion, setCurrentPage])

  if (!data) return null

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  const bmiValueVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your BMI Results</h1>
          <p className="text-gray-600 text-lg">Here's your comprehensive body mass index analysis</p>
        </motion.div>

        {/* Main BMI Display */}
        <motion.div
          variants={itemVariants}
          className={`card text-center mb-8 border-2 ${getBMIBgColor(data.bmi)}`}
        >
          <div className="mb-4">
            <motion.div
              variants={bmiValueVariants}
              initial="hidden"
              animate="visible"
              className={`text-6xl font-bold ${getBMIColor(data.bmi)} mb-2`}
            >
              {data.bmi?.toFixed?.(1) ?? data.bmi ?? 0}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-semibold text-gray-700 mb-2"
            >
              {data.category}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-gray-600"
            >
              Body Mass Index
            </motion.div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {[
            { icon: '↑', label: 'Height', value: `${data.height} cm`, color: 'primary' },
            { icon: '⚖', label: 'Weight', value: `${data.weight} kg`, color: 'accent' },
            { icon: '👤', label: 'User', value: user?.name || 'N/A', color: 'green' },
            { icon: '🕒', label: 'Analyzed', value: new Date(data.timestamp).toLocaleDateString(), color: 'blue' }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              className="card"
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center mr-3`}>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{item.label}</div>
                  <div className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <motion.div
              className="w-2 h-2 bg-primary-600 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span>Generating personalized insights...</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default BMIResultPage