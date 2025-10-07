import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JwtPayload } from '@/lib/utils/auth';
import { ApiResponse } from '@/lib/types/auth';

/**
 * Middleware de autenticación
 */
export function authenticateToken(request: NextRequest): { user: JwtPayload | null; error: string | null } {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return { user: null, error: 'Token de acceso requerido' };
  }

  const user = verifyToken(token);
  if (!user) {
    return { user: null, error: 'Token inválido o expirado' };
  }

  return { user, error: null };
}

/**
 * Verifica si el usuario es administrador basado en su rol
 */
export function isAdmin(user: JwtPayload): boolean {
  // Verificar si tiene permisos de administrador
  const adminPermissions = [
    'administracion.crear', 'administracion.leer', 'administracion.actualizar', 'administracion.eliminar',
    'crear_administracion', 'leer_administracion', 'actualizar_administracion', 'eliminar_administracion',
    'usuarios.crear', 'usuarios.leer', 'usuarios.actualizar', 'usuarios.eliminar',
    'crear_usuarios', 'leer_usuarios', 'actualizar_usuarios', 'eliminar_usuarios'
  ];
  
  return adminPermissions.some(adminPerm => user.permisos.includes(adminPerm));
}

/**
 * Middleware de autorización por permisos simplificados
 * Soporta tanto permisos específicos como permisos por módulo
 */
export function requirePermission(permission: string) {
  return function(request: NextRequest): { authorized: boolean; error: string | null } {
    const { user, error } = authenticateToken(request);
    
    if (error) {
      return { authorized: false, error };
    }

    if (!user) {
      return { authorized: false, error: 'Usuario no autenticado' };
    }

    // Verificar permiso específico exacto
    if (user.permisos.includes(permission)) {
      return { authorized: true, error: null };
    }

    // Si el permiso está en formato módulo.acción (ej: ventas.leer)
    if (permission.includes('.')) {
      const [module, action] = permission.split('.');
      
      // Convertir a formato accion_modulo (ej: leer_ventas)
      const convertedPermission = `${action}_${module}`;
      
      if (user.permisos.includes(convertedPermission)) {
        return { authorized: true, error: null };
      }
    }

    // Si el permiso está en formato accion_modulo (ej: leer_ventas)
    if (permission.includes('_')) {
      const [action, module] = permission.split('_');
      
      // Convertir a formato módulo.acción (ej: ventas.leer)
      const convertedPermission = `${module}.${action}`;
      
      if (user.permisos.includes(convertedPermission)) {
        return { authorized: true, error: null };
      }
    }

    // Verificar si es administrador (acceso completo)
    if (isAdmin(user)) {
      return { authorized: true, error: null };
    }

    return { authorized: false, error: 'No tiene permisos para realizar esta acción' };
  };
}

/**
 * Middleware de autorización por rol
 */
export function requireRole(roleId: number) {
  return function(request: NextRequest): { authorized: boolean; error: string | null } {
    const { user, error } = authenticateToken(request);
    
    if (error) {
      return { authorized: false, error };
    }

    if (!user) {
      return { authorized: false, error: 'Usuario no autenticado' };
    }

    if (user.rol_id !== roleId) {
      return { authorized: false, error: 'No tiene el rol requerido para realizar esta acción' };
    }

    return { authorized: true, error: null };
  };
}

/**
 * Middleware para verificar si el usuario es administrador
 */
export function requireAdmin(request: NextRequest): { authorized: boolean; error: string | null } {
  const { user, error } = authenticateToken(request);
  
  if (error) {
    return { authorized: false, error };
  }

  if (!user) {
    return { authorized: false, error: 'Usuario no autenticado' };
  }

  // Verificar si tiene permisos de administrador
  const adminPermissions = ['acceso_administrador', 'acceso_super_administrador'];
  const hasAdminPermission = user.permisos.some(permission => adminPermissions.includes(permission));

  if (!hasAdminPermission) {
    return { authorized: false, error: 'Se requieren permisos de administrador' };
  }

  return { authorized: true, error: null };
}

/**
 * Middleware para verificar si el usuario es super administrador
 */
export function requireSuperAdmin(request: NextRequest): { authorized: boolean; error: string | null } {
  const { user, error } = authenticateToken(request);
  
  if (error) {
    return { authorized: false, error };
  }

  if (!user) {
    return { authorized: false, error: 'Usuario no autenticado' };
  }

  if (!user.permisos.includes('acceso_super_administrador')) {
    return { authorized: false, error: 'Se requieren permisos de super administrador' };
  }

  return { authorized: true, error: null };
}

/**
 * Función helper para crear respuestas de error de autenticación
 */
export function createAuthErrorResponse(message: string, status: number = 401): NextResponse {
  const response: ApiResponse = {
    success: false,
    message,
    error: message
  };

  return NextResponse.json(response, { status });
}

/**
 * Función helper para crear respuestas de error de autorización
 */
export function createAuthzErrorResponse(message: string, status: number = 403): NextResponse {
  const response: ApiResponse = {
    success: false,
    message,
    error: message
  };

  return NextResponse.json(response, { status });
}

/**
 * Middleware para verificar si el usuario puede modificar su propio perfil
 */
export function canModifyUser(targetUserId: number, request: NextRequest): { authorized: boolean; error: string | null } {
  const { user, error } = authenticateToken(request);
  
  if (error) {
    return { authorized: false, error };
  }

  if (!user) {
    return { authorized: false, error: 'Usuario no autenticado' };
  }

  // El usuario puede modificar su propio perfil
  if (user.usuario_id === targetUserId) {
    return { authorized: true, error: null };
  }

  // O si tiene permisos de administrador
  const adminPermissions = ['actualizar_usuarios', 'acceso_administrador', 'acceso_super_administrador'];
  const hasAdminPermission = user.permisos.some(permission => adminPermissions.includes(permission));

  if (hasAdminPermission) {
    return { authorized: true, error: null };
  }

  return { authorized: false, error: 'No tiene permisos para modificar este usuario' };
}

/**
 * Middleware para verificar si el usuario puede eliminar usuarios
 */
export function canDeleteUser(targetUserId: number, request: NextRequest): { authorized: boolean; error: string | null } {
  const { user, error } = authenticateToken(request);
  
  if (error) {
    return { authorized: false, error };
  }

  if (!user) {
    return { authorized: false, error: 'Usuario no autenticado' };
  }

  // No se puede eliminar a sí mismo
  if (user.usuario_id === targetUserId) {
    return { authorized: false, error: 'No puede eliminarse a sí mismo' };
  }

  // Solo super administradores pueden eliminar usuarios
  if (!user.permisos.includes('acceso_super_administrador')) {
    return { authorized: false, error: 'Solo super administradores pueden eliminar usuarios' };
  }

  return { authorized: true, error: null };
}
