import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/usuarios - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const activo = searchParams.get('activo');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Construir consulta
    let whereClause = '';
    const queryParams: any[] = [];
    let paramCount = 0;

    const conditions: string[] = [];

    if (search) {
      paramCount++;
      conditions.push(`(u.nombre ILIKE $${paramCount} OR u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    if (activo !== null && activo !== undefined) {
      paramCount++;
      conditions.push(`u.activo = $${paramCount}`);
      queryParams.push(activo === 'true');
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // Consulta principal
    const query = `
      SELECT 
        u.usuario_id,
        u.username,
        u.nombre,
        u.email,
        u.activo,
        u.created_at,
        u.updated_at,
        r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      ${whereClause}
      ORDER BY u.nombre ASC
      LIMIT $${paramCount + 1}
    `;

    const allParams = [...queryParams, limit];
    const result = await pool.query(query, allParams);
    const usuarios = result.rows;

    const response = {
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: usuarios
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}