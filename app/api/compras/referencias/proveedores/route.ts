import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth'

// GET /api/compras/referencias/proveedores - Listar proveedores para compras
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos de compras
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        proveedor_id,
        nombre_proveedor,
        correo,
        telefono,
        ruc,
        direccion
      FROM proveedores
      ORDER BY nombre_proveedor
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      message: 'Proveedores obtenidos exitosamente',
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
