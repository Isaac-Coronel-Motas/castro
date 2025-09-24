import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/sucursales - Listar sucursales
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_referencias')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        s.sucursal_id,
        s.nombre,
        s.direccion,
        s.telefono,
        s.email
      FROM sucursales s
      ORDER BY s.nombre
    `;

    const result = await pool.query(query);
    
    const response = {
      success: true,
      message: 'Sucursales obtenidas exitosamente',
      data: result.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
