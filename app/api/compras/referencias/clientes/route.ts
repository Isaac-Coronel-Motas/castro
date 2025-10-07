import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth'

// GET /api/compras/referencias/clientes - Listar clientes para compras
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos de compras
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        cliente_id,
        nombre,
        direccion,
        telefono,
        email,
        ruc
      FROM clientes
      WHERE estado = 'activo'
      ORDER BY nombre
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      message: 'Clientes obtenidos exitosamente',
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
