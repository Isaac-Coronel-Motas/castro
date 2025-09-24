import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/ventas/cajas - Listar cajas disponibles
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Consulta para obtener cajas activas
    const query = `
      SELECT 
        c.caja_id,
        c.nro_caja,
        s.nombre as sucursal_nombre,
        c.activo,
        CASE 
          WHEN acc.estado = 'abierta' THEN true
          ELSE false
        END as tiene_apertura_activa
      FROM cajas c
      LEFT JOIN sucursales s ON c.sucursal_id = s.sucursal_id
      LEFT JOIN apertura_cierre_caja acc ON c.caja_id = acc.caja_id AND acc.estado = 'abierta'
      WHERE c.activo = true
      ORDER BY c.nro_caja
    `;

    const result = await pool.query(query);
    const cajas = result.rows;

    const response = {
      success: true,
      message: 'Cajas obtenidas exitosamente',
      data: cajas
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener cajas:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
