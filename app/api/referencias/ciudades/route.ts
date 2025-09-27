import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/ciudades - Listar ciudades
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        id,
        nombre
      FROM ciudades
      ORDER BY nombre
    `;

    const result = await pool.query(query);
    
    const response = {
      success: true,
      message: 'Ciudades obtenidas exitosamente',
      data: result.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener ciudades:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
