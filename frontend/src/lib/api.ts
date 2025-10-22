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

// Add these functions to your existing frontend/src/lib/api.ts file

// Repository API functions
export const syncRepositories = async () => {
  const response = await api.post('/api/v1/repositories/sync');
  return response.data;
};

export const listRepositories = async (skip: number = 0, limit: number = 100) => {
  const response = await api.get('/api/v1/repositories/list', {
    params: { skip, limit }
  });
  return response.data;
};

export const getRepository = async (repoId: number) => {
  const response = await api.get(`/api/v1/repositories/${repoId}`);
  return response.data;
};

export const deleteRepository = async (repoId: number) => {
  const response = await api.delete(`/api/v1/repositories/${repoId}`);
  return response.data;
};

export const getRepositoryStats = async () => {
  const response = await api.get('/api/v1/repositories/stats/summary');
  return response.data;
};

// Add these functions to your existing frontend/src/lib/api.ts file

// Analysis API functions
export const startAnalysis = async (repositoryId: number) => {
  const response = await api.post(`/api/v1/analysis/analyze/${repositoryId}`);
  return response.data;
};

export const listAnalyses = async (skip: number = 0, limit: number = 50) => {
  const response = await api.get('/api/v1/analysis/list', {
    params: { skip, limit }
  });
  return response.data;
};

export const getRepositoryAnalyses = async (repositoryId: number) => {
  const response = await api.get(`/api/v1/analysis/repository/${repositoryId}`);
  return response.data;
};

export const getAnalysis = async (analysisId: number) => {
  const response = await api.get(`/api/v1/analysis/${analysisId}`);
  return response.data;
};

export const getAnalysisIssues = async (analysisId: number, severity?: string) => {
  const response = await api.get(`/api/v1/analysis/${analysisId}/issues`, {
    params: severity ? { severity } : {}
  });
  return response.data;
};

export const getLatestAnalysis = async (repositoryId: number) => {
  const response = await api.get(`/api/v1/analysis/repository/${repositoryId}/latest`);
  return response.data;
};

export const deleteAnalysis = async (analysisId: number) => {
  const response = await api.delete(`/api/v1/analysis/${analysisId}`);
  return response.data;
};