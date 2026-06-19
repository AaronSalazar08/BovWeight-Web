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

export interface UsuarioCatalogo {
  id: number
  nombre: string
  correo: string
}

export interface Finca {
  id: number
  nombre: string
  ubicacion: string
  area: number
  numero_finca: string
  ganadero: UsuarioCatalogo | null
  veterinario: UsuarioCatalogo | null
  total_ganado: number
  creado_en: string
}

export interface CreateFincaPayload {
  usuario_id: number | null
  nombre: string
  ubicacion: string
  area: number
  numero_finca: string
}

export interface UpdateFincaPayload {
  usuario_id?: number | null
  nombre?: string
  ubicacion?: string
  area?: number
  numero_finca?: string
}

export interface SolicitudVeterinario {
  id: number
  finca: { id: number; nombre: string } | null
  ganadero: { id: number; nombre: string; correo: string } | null
  veterinario: { id: number; nombre: string; correo: string } | null
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  aprobado_en: string | null
  aprobador: { id: number; nombre: string } | null
  creado_en: string
}

export interface Catalogo {
  id: number
  nombre: string
}

export interface GanadoFinca {
  id: number
  nombre: string
  ubicacion: string
  area: number
  numero_finca: string
  usuario_id: number | null
  veterinario_id: number | null
}

export interface Ganado {
  id: number
  finca_id: number
  estado_salud_id: number
  estado_comercial_id: number
  arete: string
  nombre: string | null
  sexo: 'Macho' | 'Hembra' | null
  raza: string
  imagen: string | null
  peso_kg: number | null
  estado_salud?: Catalogo
  estado_comercial?: Catalogo
  finca?: GanadoFinca
}

export type NotificationType = 'success' | 'danger' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
}
