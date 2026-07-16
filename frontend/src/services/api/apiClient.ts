import axios from 'axios';
import { ENV } from '@config/env';
import { requestInterceptor, responseErrorInterceptor } from '@services/api/interceptors';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Register Axios Interceptors
apiClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
apiClient.interceptors.response.use((response) => response, responseErrorInterceptor);
