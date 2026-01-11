/**
 * Unified API Functions for Client App using Axios
 */
import axiosInstance from './axios';
import { useApiStore } from '../stores/apiStore';

/**
 * API Functions
 */
export const api = {
  // BMI
  getBMI: async (bmiId: string) => {
    const { setLoading, setError } = useApiStore.getState();
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/api/bmi/${encodeURIComponent(bmiId)}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch BMI data';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // OTP
  generateOTP: async (mobile: string) => {
    // Don't use global loading for OTP - let components handle their own loading state
    try {
      const response = await axiosInstance.post('/api/otp/generate', { mobile });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send OTP';
      throw new Error(errorMessage);
    }
  },

  verifyOTP: async (mobile: string, otp: string, name?: string) => {
    // Don't use global loading for OTP verification - let components handle their own loading state
    try {
      const payload: any = { mobile, otp };
      if (name) payload.name = name;
      const response = await axiosInstance.post('/api/otp/verify', payload);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to verify OTP';
      throw new Error(errorMessage);
    }
  },

  // User
  createUser: async (name: string, gender: string, age: number, mobile: string) => {
    const { setLoading, setError } = useApiStore.getState();
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.post('/api/user', { name, gender, age, mobile });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create user';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },

  loginUser: async (mobile: string) => {
    const { setLoading, setError } = useApiStore.getState();
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.post('/api/user/login', { mobile });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to login';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // BMI Link User
  linkUserToBMI: async (bmiId: string, userId: string) => {
    try {
      const response = await axiosInstance.post(`/api/bmi/${bmiId}/link-user`, { userId });
      return response.data;
    } catch (error: any) {
      console.error('Link user error:', error);
      throw error;
    }
  },

  // Payment
  getPaymentKey: async () => {
    try {
      const response = await axiosInstance.get('/api/payment/key');
      return response.data;
    } catch (error: any) {
      console.error('Get payment key error:', error);
      throw error;
    }
  },

  getPlayer: async (screenId: string) => {
    try {
      const response = await axiosInstance.get(`/api/adscape/player/${screenId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get player error:', error);
      throw error;
    }
  },

  createPaymentOrder: async (data: any) => {
    try {
      const response = await axiosInstance.post('/api/payment/create-order', data);
      return response.data;
    } catch (error: any) {
      console.error('Create payment order error:', error);
      throw error;
    }
  },

  verifyPayment: async (data: any) => {
    try {
      const response = await axiosInstance.post('/api/payment/verify', data);
      return response.data;
    } catch (error: any) {
      console.error('Verify payment error:', error);
      throw error;
    }
  },

  notifyPaymentSuccess: async (userId: string | undefined, bmiId: string, appVersion: string, paymentToken?: string, paymentAmount?: number) => {
    try {
      const payload: any = { userId, bmiId, appVersion };
      if (paymentToken) {
        payload.paymentToken = paymentToken;
        console.log('[PAYMENT] Including payment token in payment success notification');
      }
      if (paymentAmount !== null && paymentAmount !== undefined) {
        payload.paymentAmount = paymentAmount;
        console.log('[PAYMENT] Including payment amount in payment success notification:', paymentAmount);
      }
      await axiosInstance.post('/api/payment-success', payload);
    } catch (error: any) {
      console.error('Payment success notification error:', error);
      // Don't throw - this is a fire-and-forget notification
    }
  },

  notifyProgressStart: async (bmiId: string) => {
    try {
      await axiosInstance.post('/api/progress-start', { bmiId });
    } catch (error: any) {
      console.error('Progress start notification error:', error);
      // Don't throw - this is a fire-and-forget notification
    }
  },

  notifyFortuneGenerate: async (bmiId: string, appVersion: string) => {
    try {
      const response = await axiosInstance.post('/api/fortune-generate', { bmiId, appVersion });
      return response.data;
    } catch (error: any) {
      console.error('Fortune generate error:', error);
      throw error;
    }
  },

  // Analytics
  getUserAnalytics: async (userId: string) => {
    const { setLoading, setError } = useApiStore.getState();
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/api/user/${userId}/analytics`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch analytics';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Session
  claimSession: async (token: string) => {
    try {
      await axiosInstance.post('/api/session/claim', {}, {
        headers: {
          'x-bmi-token': token
        }
      });
    } catch (error: any) {
      console.error('Claim session error:', error);
      // Don't throw - this is a fire-and-forget notification
    }
  },

  getSessionStatus: async (token: string) => {
    try {
      const response = await axiosInstance.get('/api/session/status', {
        headers: {
          'x-bmi-token': token
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get session status error:', error);
      throw error;
    }
  },

  // Debug
  getDebugConnections: async () => {
    try {
      const response = await axiosInstance.get('/api/debug/connections');
      return response.data;
    } catch (error: any) {
      console.error('Get debug connections error:', error);
      throw error;
    }
  },

};

export default api;
