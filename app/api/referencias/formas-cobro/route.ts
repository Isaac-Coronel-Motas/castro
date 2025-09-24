import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/formas-cobro - Listar formas de cobro
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Consulta principal
    const query = `
      SELECT 
        fc.forma_cobro_id,
        fc.nombre,
        fc.descripcion,
        fc.activo,
        fc.requiere_autorizacion,
        fc.comision_porcentaje
      FROM formas_cobro fc
      ORDER BY fc.nombre
    `;

    const result = await pool.query(query);
    const formasCobro = result.rows;

    const response = {
      success: true,
      message: 'Formas de cobro obtenidas exitosamente',
      data: formasCobro
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener formas de cobro:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
