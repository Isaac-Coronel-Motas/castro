import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth'

// GET /api/compras/referencias/almacenes - Listar almacenes para compras
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos de compras
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        a.almacen_id,
        a.nombre,
        a.descripcion,
        a.almacen_principal,
        s.nombre as sucursal_nombre
      FROM almacenes a
      LEFT JOIN sucursales s ON a.id_sucursal = s.sucursal_id
      ORDER BY a.nombre
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      message: 'Almacenes obtenidos exitosamente',
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener almacenes:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
