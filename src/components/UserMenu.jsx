import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useUserSessionStore } from '../stores/userSessionStore'

function UserMenu({ user, onLogout }) {
  const { clearUser, getSessionDaysRemaining } = useUserSessionStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const dropdownRef = useRef(null)
  const [daysRemaining, setDaysRemaining] = useState(0)

  useEffect(() => {
    setDaysRemaining(getSessionDaysRemaining())
  }, [getSessionDaysRemaining])

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      gsap.fromTo(dropdownRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
      )
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    clearUser()
    if (onLogout) {
      onLogout()
    } else {
      window.location.href = '/'
    }
  }

  if (!user) {
    return null
  }

  return (
    <div ref={menuRef} className="relative">
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">{user.name || 'User'}</div>
          <div className="text-xs text-gray-500">{user.mobile || ''}</div>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.mobile || 'No mobile'}
                </p>
                {user.userId && (
                  <p className="text-xs text-gray-400 truncate mt-1">
                    ID: {user.userId.substring(0, 8)}...
                  </p>
                )}
              </div>
            </div>
            {daysRemaining > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Session expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                </p>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                // You can add navigation to user profile/details page here
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>User Details</span>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false)
                window.location.href = '/dashboard'
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-200 pt-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
