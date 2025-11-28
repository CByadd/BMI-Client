import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'

function AuthPage({ onAuth, screenId, serverBase, bmiId }) {
  const { user, loadUserFromStorage } = useAppStore()
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [isSignup, setIsSignup] = useState(false)

  useEffect(() => {
    loadUserFromStorage()
    if (user) {
      setName(user.name || '')
      setMobile(user.mobile || '')
      setIsSignup(false)
    }
    
    const isDirectVisit = !screenId && !bmiId
    if (isDirectVisit) {
      setIsSignup(false)
    }
  }, [screenId, bmiId, user, loadUserFromStorage])

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !mobile.trim()) return
    
    onAuth({ name: name.trim(), mobile: mobile.trim(), isSignup })
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
            className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4"
          >
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignup 
              ? 'Join to access your BMI analytics dashboard'
              : 'Login to view your health analytics and trends'
            }
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="card"
        >
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="input-field"
                required
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
                className="input-field"
                required
              />
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary"
            >
              {isSignup ? 'Create Account' : 'Login to Dashboard'}
            </motion.button>

            <div className="flex flex-col space-y-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                {isSignup ? 'Already have an account? Sign in' : 'New? Create an account'}
              </motion.button>
              
              {!screenId && !bmiId && localStorage.getItem('bmi_user') && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-accent-600 hover:text-accent-700 font-medium text-sm transition-colors"
                >
                  View My Dashboard →
                </motion.button>
              )}
            </div>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AuthPage