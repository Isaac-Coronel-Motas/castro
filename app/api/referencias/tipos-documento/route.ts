import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/tipos-documento - Listar tipos de documento
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        tipo_doc_id,
        descripcion
      FROM tipo_documento
      ORDER BY descripcion ASC
    `;

    const result = await pool.query(query);
    const tiposDocumento = result.rows;

    return NextResponse.json({
      success: true,
      message: 'Tipos de documento obtenidos exitosamente',
      data: tiposDocumento
    });

  } catch (error) {
    console.error('Error al obtener tipos de documento:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
