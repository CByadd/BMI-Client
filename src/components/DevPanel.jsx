import { useState, useEffect } from 'react'

function DevPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogo, setShowLogo] = useState(() => {
    const saved = localStorage.getItem('dev_show_logo')
    return saved !== null ? saved === 'true' : true
  })

  useEffect(() => {
    // Save to localStorage when changed
    localStorage.setItem('dev_show_logo', showLogo.toString())
  }, [showLogo])

  // Toggle panel with 'D' key (when not in input/textarea)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        // Check if user is typing in an input/textarea
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'
        if (!isTyping) {
          setIsOpen(prev => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-700 z-50 shadow-lg"
        title="Dev Panel (Press D)"
      >
        Dev
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 z-50 min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Dev Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 text-lg leading-none"
          title="Close (Press D)"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="show-logo" className="text-sm text-gray-700 cursor-pointer">
            Show Logo
          </label>
          <button
            id="show-logo"
            onClick={() => setShowLogo(!showLogo)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showLogo ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showLogo ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">D</kbd> to toggle
        </p>
      </div>
    </div>
  )
}

export default DevPanel

