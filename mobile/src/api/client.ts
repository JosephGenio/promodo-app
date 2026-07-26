import axios from 'axios';
import { config } from '@/constants/config';
import { emitUnauthorized } from '@/api/authEvents';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
});

let currentToken: string | null = null;

export function setClientToken(token: string | null): void {
  currentToken = token;
}

apiClient.interceptors.request.use((requestConfig) => {
  if (currentToken) {
    requestConfig.headers.Authorization = `Bearer ${currentToken}`;
  }
  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      emitUnauthorized();
    }
    return Promise.reject(error);
  },
);
