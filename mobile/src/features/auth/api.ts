import { apiClient } from '@/api/client';

export type User = {
  id: string;
  email: string;
  name: string | null;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  return data;
}

export async function register(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', {
    email,
    password,
    name,
  });
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/api/auth/forgot-password', { email });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post('/api/auth/reset-password', { email, code, newPassword });
}

export async function googleSignIn(idToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/google', { idToken });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/api/users/me');
  return data;
}
