import apiClient from './api-client';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Business {
  id: string;
  businessName: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    business?: Business;
    token?: string;
    refreshToken?: string;
  };
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
  return response.data;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}

export async function getCurrentUser(): Promise<any> {
  const response = await apiClient.get<{ success: boolean; data: any }>('/api/auth/me');
  return response.data.data;
}

