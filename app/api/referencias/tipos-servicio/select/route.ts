import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/tipos-servicio/select - Obtener tipos de servicio para select
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Consulta simplificada para obtener solo tipos activos
    const query = `
      SELECT 
        tipo_serv_id,
        descripcion,
        nombre,
        activo
      FROM tipo_servicio
      WHERE activo = true
      ORDER BY descripcion ASC
    `;

    const result = await pool.query(query);

    const response = {
      success: true,
      data: result.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener tipos de servicio:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

