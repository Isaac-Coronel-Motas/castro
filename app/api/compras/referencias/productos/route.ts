import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth'

// GET /api/compras/referencias/productos - Listar productos para compras
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos de compras
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        p.producto_id,
        p.cod_product,
        p.nombre_producto,
        p.descripcion_producto,
        p.precio_venta,
        p.stock,
        c.nombre_categoria as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.estado = true
      ORDER BY p.nombre_producto
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      message: 'Productos obtenidos exitosamente',
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
