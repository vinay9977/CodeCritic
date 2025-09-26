import axios from 'axios';
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GitHub OAuth
export const githubLogin = async () => {
  const response = await api.get('/api/v1/auth/github/login');
  return response.data;
};

export const githubCallback = async (code: string, state?: string) => {
  const response = await api.post('/api/v1/auth/github/callback', {
    code,
    state,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/v1/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/v1/auth/logout');
  return response.data;
};