import { NextRequest, NextResponse } from 'next/server';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { obtenerEstadisticasAccesos } from '@/lib/utils/security';

// GET /api/security/accesos/estadisticas - Obtener estadísticas de accesos
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos de administrador
    const { authorized, error } = requirePermission('admin.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');
    const dias = parseInt(searchParams.get('dias') || '7');

    if (!usuario_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'usuario_id es requerido' 
      }, { status: 400 });
    }

    const estadisticas = await obtenerEstadisticasAccesos(parseInt(usuario_id), dias);

    return NextResponse.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: estadisticas
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de accesos:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
