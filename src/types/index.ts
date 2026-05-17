export interface User {
  id: number
  nombre: string
  correo: string
  tipo: string
  creado_en: string
}

export interface SolicitudRegistro {
  id: number
  nombre: string
  apellidos: string
  correo: string
  numero_celular: string
  archivo_cedula: string | null
  archivo_certificado: string | null
  motivo_rechazo: string | null
  estado: string
  creado_en: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface LoginCredentials {
  correo: string
  contrasena: string
}

export interface LoginResponse {
  token: string
  usuario: User
  message: string
}

export interface CreateUserPayload {
  nombre: string
  correo: string
  contrasena: string
  tipo_nombre: string
}

export interface UpdateUserPayload {
  nombre?: string
  correo?: string
  tipo_nombre?: string
}

export interface ReviewSolicitudPayload {
  decision: 'aprobar' | 'rechazar'
  tipo_usuario?: string
  motivo?: string
}

export type NotificationType = 'success' | 'danger' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
}
