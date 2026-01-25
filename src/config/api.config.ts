/**
 * API Configuration - Single Point of Truth for API Base URL
 */

// Default API base URL - can be overridden by environment variables or URL hash
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.REACT_APP_API_URL || 
  // 'https://relieved-sparrow-fairly.ngrok-free.app';
  'https://api.well2day.in';

/**
 * Get API base URL from various sources (in priority order):
 * 1. URL hash parameter (?server=... or #server=...)
 * 2. Environment variable (VITE_API_URL or REACT_APP_API_URL)
 * 3. Default constant (API_BASE_URL)
 */
export const getApiBaseUrl = (): string => {
  // Check URL hash for server override
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const fromHash = hash.get('server');
  if (fromHash) {
    return fromHash;
  }
  
  // Check URL search params
  const params = new URLSearchParams(window.location.search);
  const fromParams = params.get('server');
  if (fromParams) {
    return fromParams;
  }
  
  // Use environment variable or default
  return API_BASE_URL;
};

/**
 * API Configuration object
 */
export const apiConfig = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
};
