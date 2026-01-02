/**
 * Unified Axios Instance for Client App
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useApiStore } from '../stores/apiStore';

// Default server base URL
const DEFAULT_SERVER_BASE = 'https://bmi-server-eight.vercel.app';

/**
 * Get server base URL from store or environment
 */
const getServerBase = (): string => {
  // First check zustand store
  const storeBase = useApiStore.getState().serverBase;
  if (storeBase) {
    return storeBase;
  }
  
  // Check URL hash for server override
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const fromHash = hash.get('server');
  if (fromHash) {
    return fromHash;
  }
  
  // Use environment variable or default
  return import.meta.env.VITE_API_URL || 
         import.meta.env.REACT_APP_API_URL || 
         DEFAULT_SERVER_BASE;
};

/**
 * Create axios instance
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getServerBase(),
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor - Update base URL from store
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Update baseURL from store
    const serverBase = getServerBase();
    config.baseURL = serverBase;
    
    // Add ngrok skip header
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data as any;
      const errorMessage = errorData?.error || error.message || `HTTP error! status: ${status}`;
      
      // Create error with status and message
      const apiError = new Error(errorMessage);
      (apiError as any).status = status;
      (apiError as any).response = error.response;
      return Promise.reject(apiError);
    }
    
    // Network errors
    if (error.request) {
      const networkError = new Error('Network error. Please check your connection.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Update base URL dynamically
 */
export const updateBaseURL = (newBaseURL: string) => {
  useApiStore.getState().setServerBase(newBaseURL);
  axiosInstance.defaults.baseURL = newBaseURL;
};

export default axiosInstance;
