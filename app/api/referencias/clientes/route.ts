import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/clientes - Listar clientes
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construir consulta de búsqueda
    const searchFields = ['c.nombre', 'c.telefono', 'c.ruc', 'c.email'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    // Solo clientes activos
    additionalConditions.push(`c.estado = 'activo'`);

    let whereClause = '';
    if (search) {
      const searchConditions = searchFields.map(field => 
        `${field} ILIKE $${++paramCount}`
      ).join(' OR ');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      whereClause = `WHERE (${searchConditions}) AND ${additionalConditions.join(' AND ')}`;
    } else {
      whereClause = `WHERE ${additionalConditions.join(' AND ')}`;
    }

    // Consulta principal
    const query = `
      SELECT 
        c.cliente_id,
        c.nombre,
        c.direccion,
        c.ruc,
        c.telefono,
        c.email,
        c.estado,
        ci.nombre as ciudad_nombre
      FROM clientes c
      LEFT JOIN ciudades ci ON c.ciudad_id = ci.ciudad_id
      ${whereClause}
      ORDER BY c.nombre
      LIMIT $${paramCount + 1}
    `;

    const allParams = [...queryParams, limit];
    const result = await pool.query(query, allParams);
    const clientes = result.rows;

    const response = {
      success: true,
      message: 'Clientes obtenidos exitosamente',
      data: clientes
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}