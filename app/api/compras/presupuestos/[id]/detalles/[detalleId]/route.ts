import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { ComprasApiResponse } from '@/lib/types/compras';

// ===== PUT - Actualizar detalle de presupuesto =====
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; detalleId: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.editar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const presupuestoId = parseInt(params.id);
    const detalleId = parseInt(params.detalleId);
    const body = await request.json();

    if (isNaN(presupuestoId) || isNaN(detalleId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de presupuesto o detalle inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el detalle pertenece al presupuesto
    const verifyQuery = `
      SELECT detalle_presup_id FROM detalle_presupuesto 
      WHERE detalle_presup_id = $1 AND presu_prov_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [detalleId, presupuestoId]);

    if (verifyResult.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Detalle no encontrado o no pertenece al presupuesto',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.producto_id !== undefined) {
      paramCount++;
      updateFields.push(`producto_id = $${paramCount}`);
      updateValues.push(body.producto_id);
    }

    if (body.cantidad !== undefined) {
      paramCount++;
      updateFields.push(`cantidad = $${paramCount}`);
      updateValues.push(body.cantidad);
    }

    if (body.precio_unitario !== undefined) {
      paramCount++;
      updateFields.push(`precio_unitario = $${paramCount}`);
      updateValues.push(body.precio_unitario);
    }

    if (updateFields.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar detalle
    paramCount++;
    updateValues.push(detalleId);

    const updateQuery = `
      UPDATE detalle_presupuesto 
      SET ${updateFields.join(', ')}
      WHERE detalle_presup_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener detalle actualizado
    const getDetalleQuery = `
      SELECT 
        dp.detalle_presup_id,
        dp.presu_prov_id,
        dp.producto_id,
        dp.cantidad,
        dp.precio_unitario,
        p.nombre_producto,
        p.cod_product,
        p.descripcion_producto,
        (dp.cantidad * dp.precio_unitario) as subtotal
      FROM detalle_presupuesto dp
      LEFT JOIN productos p ON dp.producto_id = p.producto_id
      WHERE dp.detalle_presup_id = $1
    `;

    const detalleData = await pool.query(getDetalleQuery, [detalleId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Detalle de presupuesto actualizado exitosamente',
      data: detalleData.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error actualizando detalle de presupuesto:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error actualizando detalle de presupuesto'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// ===== DELETE - Eliminar detalle de presupuesto =====
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; detalleId: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const presupuestoId = parseInt(params.id);
    const detalleId = parseInt(params.detalleId);

    if (isNaN(presupuestoId) || isNaN(detalleId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de presupuesto o detalle inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el detalle pertenece al presupuesto
    const verifyQuery = `
      SELECT detalle_presup_id FROM detalle_presupuesto 
      WHERE detalle_presup_id = $1 AND presu_prov_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [detalleId, presupuestoId]);

    if (verifyResult.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Detalle no encontrado o no pertenece al presupuesto',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Eliminar detalle
    await pool.query('DELETE FROM detalle_presupuesto WHERE detalle_presup_id = $1', [detalleId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Detalle de presupuesto eliminado exitosamente'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error eliminando detalle de presupuesto:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error eliminando detalle de presupuesto'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
