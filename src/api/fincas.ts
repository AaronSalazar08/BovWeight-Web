import type { CreateFincaPayload, Finca, UpdateFincaPayload } from '@/types'
import client from './client'

export const fincasApi = {
  list: () => client.get<Finca[]>('/fincas'),

  show: (id: number) => client.get<Finca>(`/fincas/${id}`),

  create: (payload: CreateFincaPayload) => client.post<{ message: string; data: Finca }>('/fincas', payload),

  update: (id: number, payload: UpdateFincaPayload) =>
    client.put<{ message: string; data: Finca }>(`/fincas/${id}`, payload),

  destroy: (id: number) => client.delete(`/fincas/${id}`),

  asignarGanadero: (id: number, usuario_id: number) =>
    client.put<{ message: string; data: Finca }>(`/fincas/${id}/ganadero`, { usuario_id }),

  removerGanadero: (id: number) =>
    client.delete<{ message: string; data: Finca }>(`/fincas/${id}/ganadero`),

  asignarVeterinario: (id: number, usuario_id: number) =>
    client.put<{ message: string; data: Finca }>(`/fincas/${id}/veterinario`, { usuario_id }),

  removerVeterinario: (id: number) =>
    client.delete<{ message: string; data: Finca }>(`/fincas/${id}/veterinario`),
}
