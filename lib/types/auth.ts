// Tipos para autenticación y usuarios del sistema

export interface Usuario {
  usuario_id: number;
  nombre: string;
  email: string;
  username: string;
  password?: string; // Solo para creación/actualización
  fecha_creacion: string;
  rol_id: number;
  id_empleado?: number;
  activo: boolean;
  created_at: string;
  created_by?: number;
  updated_at: string;
  updated_by?: number;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: number;
  audit_data?: any;
  failed_attempts: number;
  locked_until?: string;
  last_login_attempt?: string;
  password_changed_at: string;
  totp_secret?: string;
  is_2fa_enabled: boolean;
}

export interface Rol {
  rol_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at?: string;
  id: number;
}

export interface Permiso {
  permiso_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at?: string;
  id: number;
}

export interface RolPermiso {
  rol_id: number;
  permiso_id: number;
  created_at: string;
}

export interface UsuarioSucursal {
  id: number;
  id_usuario: number;
  id_sucursal: number;
}

// Tipos para requests de API
export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    usuario: Usuario;
    token: string;
    refresh_token: string;
    expires_in: number;
    permisos: string[];
  };
}

export interface CreateUsuarioRequest {
  nombre: string;
  email: string;
  username: string;
  password: string;
  rol_id: number;
  id_empleado?: number;
  sucursales?: number[];
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  email?: string;
  username?: string;
  password?: string;
  rol_id?: number;
  id_empleado?: number;
  activo?: boolean;
  sucursales?: number[];
}

export interface CreateRolRequest {
  nombre: string;
  descripcion?: string;
  permisos: number[];
}

export interface UpdateRolRequest {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  permisos?: number[];
}

export interface CreatePermisoRequest {
  nombre: string;
  descripcion?: string;
}

export interface UpdatePermisoRequest {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Tipos para JWT
export interface JwtPayload {
  usuario_id: number;
  username: string;
  email: string;
  rol_id: number;
  permisos: string[];
  iat: number;
  exp: number;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
