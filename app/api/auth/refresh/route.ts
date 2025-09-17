import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyRefreshToken, generateToken } from '@/lib/utils/auth';
import { ApiResponse } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      const response: ApiResponse = {
        success: false,
        message: 'Refresh token es requerido',
        error: 'Token faltante'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refresh_token);
    
    if (!decoded) {
      const response: ApiResponse = {
        success: false,
        message: 'Refresh token inválido o expirado',
        error: 'Token inválido'
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Buscar usuario
    const userQuery = `
      SELECT 
        u.*,
        r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = $1 
        AND u.activo = true 
        AND u.is_deleted = false
    `;

    const userResult = await pool.query(userQuery, [decoded.usuario_id]);
    
    if (userResult.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuario no encontrado',
        error: 'Usuario inválido'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const user = userResult.rows[0];

    // Obtener permisos del usuario
    const permissionsQuery = `
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
    `;

    const permissionsResult = await pool.query(permissionsQuery, [user.rol_id]);
    const permisos = permissionsResult.rows.map(row => row.nombre);

    // Generar nuevo token
    const tokenPayload = {
      usuario_id: user.usuario_id,
      username: user.username,
      email: user.email,
      rol_id: user.rol_id,
      permisos
    };

    const newToken = generateToken(tokenPayload);

    const response: ApiResponse = {
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token: newToken,
        expires_in: 60 * 60 // 1 hora
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en refresh token:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
