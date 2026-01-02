/**
 * Session Management Utilities
 * Handles 8-day session storage and validation
 */

const SESSION_DURATION_DAYS = 8
const USER_STORAGE_KEY = 'bmi_user'
const SESSION_EXPIRY_KEY = 'bmi_session_expiry'

/**
 * Save user session with 8-day expiry
 */
export const saveUserSession = (userData) => {
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + SESSION_DURATION_DAYS)
  
  const sessionData = {
    ...userData,
    sessionExpiry: expiryDate.toISOString()
  }
  
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionData))
  localStorage.setItem(SESSION_EXPIRY_KEY, expiryDate.toISOString())
  
  console.log('[SESSION] User session saved, expires on:', expiryDate.toISOString())
}

/**
 * Check if user session is valid (not expired)
 */
export const isSessionValid = () => {
  try {
    const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY)
    if (!expiryStr) {
      return false
    }
    
    const expiryDate = new Date(expiryStr)
    const now = new Date()
    
    if (now > expiryDate) {
      console.log('[SESSION] Session expired')
      clearUserSession()
      return false
    }
    
    return true
  } catch (error) {
    console.error('[SESSION] Error checking session validity:', error)
    return false
  }
}

/**
 * Get user from session if valid
 */
export const getUserFromSession = () => {
  if (!isSessionValid()) {
    return null
  }
  
  try {
    const userStr = localStorage.getItem(USER_STORAGE_KEY)
    if (!userStr) {
      return null
    }
    
    const userData = JSON.parse(userStr)
    // Remove sessionExpiry from userData before returning
    const { sessionExpiry, ...user } = userData
    return user
  } catch (error) {
    console.error('[SESSION] Error getting user from session:', error)
    return null
  }
}

/**
 * Clear user session
 */
export const clearUserSession = () => {
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(SESSION_EXPIRY_KEY)
  localStorage.removeItem('auth_token')
  console.log('[SESSION] User session cleared')
}

/**
 * Get days remaining in session
 */
export const getSessionDaysRemaining = () => {
  try {
    const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY)
    if (!expiryStr) {
      return 0
    }
    
    const expiryDate = new Date(expiryStr)
    const now = new Date()
    const diffTime = expiryDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  } catch (error) {
    return 0
  }
}
