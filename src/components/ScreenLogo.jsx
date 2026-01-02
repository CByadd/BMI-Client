import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useApiStore } from '../stores/apiStore'

function ScreenLogo({ screenId, serverBase, className = '' }) {
  const [logoUrl, setLogoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogo, setShowLogo] = useState(true)

  useEffect(() => {
    // Check dev panel setting for logo visibility
    const checkDevSetting = () => {
      const devShowLogo = localStorage.getItem('dev_show_logo')
      if (devShowLogo !== null) {
        setShowLogo(devShowLogo === 'true')
      } else {
        setShowLogo(true) // Default to showing logo
      }
    }

    checkDevSetting()

    if (!screenId || !serverBase) {
      setLoading(false)
      return
    }

    const fetchLogo = async () => {
      try {
        // Update server base if needed
        if (serverBase) {
          useApiStore.getState().setServerBase(serverBase)
        }
        
        // Note: The API endpoint returns JSON with logoUrl, not a blob
        const response = await api.getPlayer(screenId)
        
        if (response.ok && response.player && response.player.logoUrl) {
          setLogoUrl(response.player.logoUrl)
          console.log('[ScreenLogo] Logo loaded successfully:', response.player.logoUrl)
        } else {
          console.log('[ScreenLogo] No logo URL in response')
        }
      } catch (error) {
        if (error?.status === 404) {
          console.log('[ScreenLogo] No logo found for screen:', screenId)
        } else {
          console.error('[ScreenLogo] Error fetching logo:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [screenId, serverBase])

  // Listen for changes to dev panel setting
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'dev_show_logo') {
        setShowLogo(e.newValue === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically (for same-tab changes)
    const interval = setInterval(() => {
      const devShowLogo = localStorage.getItem('dev_show_logo')
      if (devShowLogo !== null) {
        setShowLogo(devShowLogo === 'true')
      }
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (loading || !showLogo || !logoUrl) {
    return null
  }

  return (
    <div className={`flex justify-center mb-4 ${className}`}>
      <img 
        src={logoUrl} 
        alt="Screen Logo" 
        className="max-h-20 max-w-full object-contain"
        onError={(e) => {
          console.error('Error loading logo image:', e)
          e.target.style.display = 'none'
        }}
      />
    </div>
  )
}

export default ScreenLogo

