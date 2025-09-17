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
 * Middleware de autorización por permisos
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

    if (!user.permisos.includes(permission)) {
      return { authorized: false, error: 'No tiene permisos para realizar esta acción' };
    }

    return { authorized: true, error: null };
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
