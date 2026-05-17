import type { ReviewSolicitudPayload, SolicitudRegistro } from '@/types'
import client from './client'

export const solicitudesApi = {
  list: () => client.get<SolicitudRegistro[]>('/solicitudes'),

  pendientes: () => client.get<SolicitudRegistro[]>('/solicitudes/pendientes'),

  show: (id: number) => client.get<SolicitudRegistro>(`/solicitudes/${id}`),

  revisar: (id: number, payload: ReviewSolicitudPayload) =>
    client.put<{ message: string }>(`/solicitudes/${id}/revisar`, payload),
}
