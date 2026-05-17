import type { CreateUserPayload, UpdateUserPayload, User } from '@/types'
import client from './client'

export const usersApi = {
  list: (search?: string) =>
    client.get<User[]>('/usuarios', { params: search ? { buscar: search } : {} }),

  show: (id: number) => client.get<User>(`/usuarios/${id}`),

  create: (payload: CreateUserPayload) => client.post<User>('/usuarios', payload),

  update: (id: number, payload: UpdateUserPayload) =>
    client.put<User>(`/usuarios/${id}`, payload),

  destroy: (id: number) => client.delete(`/usuarios/${id}`),
}
