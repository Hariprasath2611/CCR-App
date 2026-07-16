import AsyncStorage from '@react-native-async-storage/async-storage';
import { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { ENV } from '@config/env';
import axios from 'axios';

export const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
  const customUrl = await AsyncStorage.getItem('CUSTOM_API_URL');
  if (customUrl) {
    config.baseURL = customUrl;
  }
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const responseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
    originalRequest._retry = true;
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Fetch dynamic API URL
      const customUrl = await AsyncStorage.getItem('CUSTOM_API_URL');
      const apiBaseUrl = customUrl || ENV.API_URL;

      // Fetch fresh tokens
      const response = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${apiBaseUrl}/auth/refresh`,
        { token: refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Update state
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);

      // Re-issue network request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      
      // Perform request with fresh access tokens
      return axios(originalRequest);
    } catch (refreshError) {
      // Refresh failed, prompt logout
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};
