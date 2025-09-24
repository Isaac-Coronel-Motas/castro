import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/ventas/notas-remision/[id]/detalles - Obtener detalles de una nota de remisión
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const remisionId = parseInt(params.id);

    if (isNaN(remisionId)) {
      const response = {
        success: false,
        message: 'ID de nota de remisión inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('leer_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Consulta para obtener detalles
    const query = `
      SELECT 
        nrd.detalle_id,
        nrd.remision_id,
        nrd.producto_id,
        nrd.cantidad,
        p.nombre as producto_nombre,
        p.codigo as producto_codigo,
        p.precio as producto_precio,
        (nrd.cantidad * p.precio) as subtotal
      FROM nota_remision_detalle nrd
      LEFT JOIN productos p ON nrd.producto_id = p.producto_id
      WHERE nrd.remision_id = $1
      ORDER BY nrd.detalle_id
    `;

    const result = await pool.query(query, [remisionId]);

    const response = {
      success: true,
      message: 'Detalles de nota de remisión obtenidos exitosamente',
      data: result.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener detalles de nota de remisión:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
