import type { SolicitudVeterinario } from '@/types'
import client from './client'

export const solicitudesVetApi = {
  list: () => client.get<SolicitudVeterinario[]>('/solicitudes-veterinario'),

  pendientes: () => client.get<SolicitudVeterinario[]>('/solicitudes-veterinario/pendientes'),

  show: (id: number) => client.get<SolicitudVeterinario>(`/solicitudes-veterinario/${id}`),

  revisar: (id: number, decision: 'aprobar' | 'rechazar') =>
    client.put<{ message: string }>(`/solicitudes-veterinario/${id}/revisar`, { decision }),
}
