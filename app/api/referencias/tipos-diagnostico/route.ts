import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/tipos-diagnostico - Listar tipos de diagnóstico
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        tipo_diag_id,
        nombre,
        descripcion,
        activo
      FROM tipo_diagnosticos
      WHERE activo = true
      ORDER BY nombre
    `;

    const result = await pool.query(query);
    
    const response = {
      success: true,
      message: 'Tipos de diagnóstico obtenidos exitosamente',
      data: result.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener tipos de diagnóstico:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
