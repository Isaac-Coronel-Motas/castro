import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth';

interface VentasApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// GET /api/ventas/productos-disponibles - Obtener productos disponibles para ventas
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('productos.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoria_id = searchParams.get('categoria_id') || '';

    // Construir consulta con filtros
    let whereClause = 'WHERE p.estado = true';
    const queryParams: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (p.nombre ILIKE $${paramCount} OR p.codigo ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (categoria_id) {
      paramCount++;
      whereClause += ` AND p.categoria_id = $${paramCount}`;
      queryParams.push(parseInt(categoria_id));
    }

    const query = `
      SELECT 
        p.producto_id,
        p.nombre,
        p.descripcion,
        p.codigo,
        p.precio_venta,
        p.stock,
        p.stock_minimo,
        p.categoria_id,
        c.nombre_categoria,
        CASE 
          WHEN p.stock <= p.stock_minimo THEN 'Bajo'
          WHEN p.stock = 0 THEN 'Sin Stock'
          ELSE 'Disponible'
        END as estado_stock,
        CASE 
          WHEN p.stock <= p.stock_minimo THEN 'warning'
          WHEN p.stock = 0 THEN 'destructive'
          ELSE 'default'
        END as estado_color
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      ${whereClause}
      ORDER BY p.nombre
      LIMIT 100
    `;

    const result = await pool.query(query, queryParams);

    const response: VentasApiResponse = {
      success: true,
      message: 'Productos obtenidos exitosamente',
      data: result.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener productos:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
