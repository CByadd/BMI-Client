/**
 * Unified Axios Instance for Client App
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useApiStore } from '../stores/apiStore';
import { getApiBaseUrl, apiConfig } from '../config/api.config';

/**
 * Get server base URL - checks store first, then falls back to config
 */
const getServerBase = (): string => {
  // First check zustand store (for runtime updates)
  const storeBase = useApiStore.getState().serverBase;
  if (storeBase && storeBase.trim()) {
    return storeBase.trim();
  }
  
  // Fall back to config (which checks URL params, env vars, or default)
  return getApiBaseUrl();
};

/**
 * Create axios instance
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getServerBase(),
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
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
