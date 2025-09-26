import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/productos - Listar productos
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const categoria_id = searchParams.get('categoria_id');

    // Construir consulta de búsqueda
    const searchFields = ['p.nombre_producto', 'p.cod_product', 'p.descripcion_producto'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    // Solo productos activos
    additionalConditions.push(`p.estado = true`);

    if (categoria_id) {
      paramCount++;
      additionalConditions.push(`p.categoria_id = $${paramCount}`);
      queryParams.push(parseInt(categoria_id));
    }

    let whereClause = '';
    if (search) {
      const searchConditions = searchFields.map(field => 
        `${field} ILIKE $${++paramCount}`
      ).join(' OR ');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      whereClause = `WHERE (${searchConditions}) AND ${additionalConditions.join(' AND ')}`;
    } else {
      whereClause = `WHERE ${additionalConditions.join(' AND ')}`;
    }

    // Consulta principal
    const query = `
      SELECT 
        p.producto_id,
        p.nombre_producto,
        p.cod_product,
        p.descripcion_producto,
        p.precio_costo,
        p.precio_venta,
        p.stock,
        p.stock_minimo,
        p.estado,
        c.nombre_categoria as categoria_nombre,
        m.descripcion as marca_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN marcas m ON p.marca_id = m.marca_id
      ${whereClause}
      ORDER BY p.nombre_producto
      LIMIT $${paramCount + 1}
    `;

    const allParams = [...queryParams, limit];
    const result = await pool.query(query, allParams);
    const productos = result.rows;

    const response = {
      success: true,
      message: 'Productos obtenidos exitosamente',
      data: productos
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener productos:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}