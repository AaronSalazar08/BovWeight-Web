import type { LoginCredentials, LoginResponse, User } from '@/types'
import client from './client'

export const authApi = {
  login: (credentials: LoginCredentials) =>
    client.post<LoginResponse>('/auth/login', credentials),

  logout: () => client.post('/auth/logout'),

  me: () => client.get<User>('/auth/me'),

  forgotPassword: (correo: string) =>
    client.post('/auth/forgot-password', { correo }),

  resetPassword: (payload: { token: string; correo: string; contrasena: string; contrasena_confirmation: string }) =>
    client.post('/auth/reset-password', payload),

  sendOtp: (correo: string) => client.post<{ message: string }>('/auth/otp/send', { correo }),

  verifyOtp: (correo: string, codigo: string) =>
    client.post<{ token: string }>('/auth/otp/verify', { correo, codigo }),
}
