import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { authenticateToken, createAuthErrorResponse } from '@/lib/middleware/auth';
import { ApiResponse } from '@/lib/types/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const { user, error } = authenticateToken(request);
    
    if (error) {
      return createAuthErrorResponse(error);
    }

    if (!user) {
      return createAuthErrorResponse('Usuario no autenticado');
    }

    // Obtener información completa del usuario
    const userQuery = `
      SELECT 
        u.usuario_id,
        u.nombre,
        u.email,
        u.username,
        u.rol_id,
        u.id_empleado,
        u.activo,
        u.created_at,
        u.updated_at,
        u.is_2fa_enabled,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = $1
    `;

    const userResult = await pool.query(userQuery, [user.usuario_id]);
    
    if (userResult.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const userData = userResult.rows[0];

    // Obtener permisos del usuario
    const permissionsQuery = `
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
    `;

    const permissionsResult = await pool.query(permissionsQuery, [user.rol_id]);
    const permisos = permissionsResult.rows.map(row => row.nombre);

    // Obtener sucursales del usuario
    const sucursalesQuery = `
      SELECT s.sucursal_id, s.nombre
      FROM sucursales s
      INNER JOIN usuarios_sucursales us ON s.sucursal_id = us.id_sucursal
      WHERE us.id_usuario = $1
    `;

    const sucursalesResult = await pool.query(sucursalesQuery, [user.usuario_id]);
    const sucursales = sucursalesResult.rows;

    const response: ApiResponse = {
      success: true,
      message: 'Información del usuario obtenida exitosamente',
      data: {
        ...userData,
        permisos,
        sucursales
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
