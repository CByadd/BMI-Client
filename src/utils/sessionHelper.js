/**
 * Simple Session Helper - Synchronous localStorage check
 * Use this for immediate session validation on page load
 */

const SESSION_KEY = 'bmi-user-session'
const SESSION_DURATION_DAYS = 8

/**
 * Get user from localStorage synchronously (for initial load)
 */
export const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored)
    const state = parsed?.state

    if (!state || !state.user || !state.sessionExpiry) {
      return null
    }

    // Check if session is still valid
    const expiryDate = new Date(state.sessionExpiry)
    const now = new Date()

    if (now > expiryDate) {
      // Session expired, clear it
      localStorage.removeItem(SESSION_KEY)
      return null
    }

    return state.user
  } catch (error) {
    console.error('[SESSION] Error reading from localStorage:', error)
    return null
  }
}

/**
 * Check if session is valid (synchronous)
 */
export const isSessionValidSync = () => {
  const user = getUserFromStorage()
  return user !== null && user.userId !== undefined
}
