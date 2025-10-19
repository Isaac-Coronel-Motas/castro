import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { VentasApiResponse } from '@/lib/types/ventas';
import { sanitizeForLog } from '@/lib/utils/ventas';

// PUT /api/ventas/apertura-cierre-caja/[id]/cerrar - Cerrar caja
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const aperturaId = parseInt(params.id);

    if (isNaN(aperturaId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de apertura inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();
    const { monto_cierre, observaciones } = body;

    console.log('🔍 Cerrando caja:', {
      aperturaId,
      monto_cierre,
      observaciones
    });

    // Verificar que la apertura existe
    const existingAperturaQuery = 'SELECT apertura_cierre_id, estado FROM apertura_cierre_caja WHERE apertura_cierre_id = $1';
    const existingApertura = await pool.query(existingAperturaQuery, [aperturaId]);
    
    if (existingApertura.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Apertura de caja no encontrada',
        error: 'Apertura no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la caja puede ser cerrada
    if (existingApertura.rows[0].estado !== 'abierta') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden cerrar cajas abiertas',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Validar monto de cierre
    if (monto_cierre === undefined || monto_cierre < 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'El monto de cierre es requerido y debe ser no negativo',
        error: 'Monto inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Cerrar caja
    const now = new Date();
    const updateQuery = `
      UPDATE apertura_cierre_caja 
      SET estado = $1, 
          fecha_cierre = $2, 
          hora_cierre = $3, 
          monto_cierre = $4 
      WHERE apertura_cierre_id = $5
    `;
    
    await pool.query(updateQuery, [
      'cerrada',
      now.toISOString().split('T')[0],
      now.toTimeString().split(' ')[0],
      monto_cierre,
      aperturaId
    ]);

    console.log('✅ Caja cerrada exitosamente:', {
      apertura_cierre_id: aperturaId,
      monto_cierre,
      fecha_cierre: now.toISOString().split('T')[0],
      hora_cierre: now.toTimeString().split(' ')[0]
    });

    const response: VentasApiResponse = {
      success: true,
      message: 'Caja cerrada exitosamente',
      data: {
        apertura_cierre_id: aperturaId,
        estado: 'cerrada',
        fecha_cierre: now.toISOString().split('T')[0],
        hora_cierre: now.toTimeString().split(' ')[0],
        monto_cierre
      }
    };

    // Log de auditoría
    console.log('Caja cerrada:', sanitizeForLog({
      apertura_cierre_id: aperturaId,
      monto_cierre,
      observaciones,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error al cerrar caja:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
