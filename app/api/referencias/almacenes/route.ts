import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/almacenes - Listar almacenes
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_referencias')(request);
    
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
    
    const response = {
      success: true,
      message: 'Almacenes obtenidos exitosamente',
      data: result.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener almacenes:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
