import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateAjusteInventarioData,
  sanitizeForLog 
} from '@/lib/utils/compras-adicionales';
import { 
  CreateAjusteInventarioRequest, 
  UpdateAjusteInventarioRequest,
  ComprasAdicionalesApiResponse 
} from '@/lib/types/compras-adicionales';

// GET /api/compras/ajustes-inventario/[id] - Obtener un ajuste específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const ajusteId = parseInt(params.id);
    if (isNaN(ajusteId)) {
      return NextResponse.json({
        success: false,
        message: 'ID de ajuste inválido',
        error: 'ID inválido'
      }, { status: 400 });
    }

    const query = `
      SELECT 
        ai.ajuste_id,
        ai.fecha,
        ai.usuario_id,
        ai.motivo_id,
        ai.observaciones,
        ai.almacen_id,
        ai.estado,
        u.nombre as usuario_nombre,
        ma.descripcion as motivo_descripcion,
        a.nombre as almacen_nombre,
        CONCAT('AJ-', LPAD(ai.ajuste_id::text, 3, '0')) as codigo_ajuste,
        COUNT(aid.detalle_id) as total_productos,
        COALESCE(SUM(ABS(aid.cantidad_ajustada) * COALESCE(p.precio_costo, 0)), 0) as valor_total
      FROM ajustes_inventario ai
      LEFT JOIN usuarios u ON ai.usuario_id = u.usuario_id
      LEFT JOIN motivo_ajuste ma ON ai.motivo_id = ma.motivo_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      LEFT JOIN ajustes_inventario_detalle aid ON ai.ajuste_id = aid.ajuste_id
      LEFT JOIN productos p ON aid.producto_id = p.producto_id
      WHERE ai.ajuste_id = $1
      GROUP BY ai.ajuste_id, ai.fecha, ai.usuario_id, ai.motivo_id, 
               ai.observaciones, ai.almacen_id, ai.estado, u.nombre, 
               ma.descripcion, a.nombre
    `;

    const result = await pool.query(query, [ajusteId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Ajuste no encontrado',
        error: 'No encontrado'
      }, { status: 404 });
    }

    const ajuste = result.rows[0];

    // Obtener detalles del ajuste
    const detallesQuery = `
      SELECT 
        aid.detalle_id,
        aid.ajuste_id,
        aid.producto_id,
        aid.cantidad_ajustada,
        aid.comentario,
        p.nombre_producto as producto_nombre,
        p.cod_product as producto_codigo,
        p.precio_costo,
        p.stock as stock_actual,
        CASE 
          WHEN aid.cantidad_ajustada > 0 THEN 'entrada'
          WHEN aid.cantidad_ajustada < 0 THEN 'salida'
          ELSE 'correccion'
        END as tipo_movimiento
      FROM ajustes_inventario_detalle aid
      LEFT JOIN productos p ON aid.producto_id = p.producto_id
      WHERE aid.ajuste_id = $1
      ORDER BY aid.detalle_id
    `;

    const detallesResult = await pool.query(detallesQuery, [ajusteId]);
    ajuste.detalles = detallesResult.rows;

    return NextResponse.json({
      success: true,
      message: 'Ajuste obtenido exitosamente',
      data: ajuste
    });

  } catch (error) {
    console.error('Error al obtener ajuste:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}

// PUT /api/compras/ajustes-inventario/[id] - Actualizar un ajuste
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const ajusteId = parseInt(params.id);
    if (isNaN(ajusteId)) {
      return NextResponse.json({
        success: false,
        message: 'ID de ajuste inválido',
        error: 'ID inválido'
      }, { status: 400 });
    }

    const body: UpdateAjusteInventarioRequest = await request.json();

    // Verificar que el ajuste existe
    const checkQuery = 'SELECT ajuste_id, estado FROM ajustes_inventario WHERE ajuste_id = $1';
    const checkResult = await pool.query(checkQuery, [ajusteId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'El ajuste especificado no existe',
        error: 'Ajuste no encontrado'
      }, { status: 404 });
    }

    const ajusteActual = checkResult.rows[0];

    // Solo permitir edición si está en estado borrador
    if (ajusteActual.estado !== 'borrador') {
      return NextResponse.json({
        success: false,
        message: 'Solo se pueden editar ajustes en estado borrador',
        error: 'Estado inválido'
      }, { status: 400 });
    }

    // Actualizar ajuste
    const updateQuery = `
      UPDATE ajustes_inventario SET
        motivo_id = $1,
        observaciones = $2,
        almacen_id = $3,
        estado = $4
      WHERE ajuste_id = $5
      RETURNING ajuste_id
    `;

    await pool.query(updateQuery, [
      body.motivo_id || null,
      body.observaciones || null,
      body.almacen_id || null,
      body.estado || 'borrador',
      ajusteId
    ]);

    // Si se proporcionan nuevos items, actualizar detalles
    if (body.items && body.items.length > 0) {
      // Eliminar detalles existentes
      await pool.query('DELETE FROM ajustes_inventario_detalle WHERE ajuste_id = $1', [ajusteId]);

      // Crear nuevos detalles
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO ajustes_inventario_detalle (ajuste_id, producto_id, cantidad_ajustada, comentario) VALUES ($1, $2, $3, $4)',
          [ajusteId, item.producto_id, item.cantidad_ajustada, item.comentario || null]
        );
      }
    }

    // Obtener el ajuste actualizado
    const getUpdatedQuery = `
      SELECT 
        ai.ajuste_id,
        ai.fecha,
        ai.usuario_id,
        ai.motivo_id,
        ai.observaciones,
        ai.almacen_id,
        ai.estado,
        u.nombre as usuario_nombre,
        ma.descripcion as motivo_descripcion,
        a.nombre as almacen_nombre,
        CONCAT('AJ-', LPAD(ai.ajuste_id::text, 3, '0')) as codigo_ajuste
      FROM ajustes_inventario ai
      LEFT JOIN usuarios u ON ai.usuario_id = u.usuario_id
      LEFT JOIN motivo_ajuste ma ON ai.motivo_id = ma.motivo_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      WHERE ai.ajuste_id = $1
    `;

    const updatedResult = await pool.query(getUpdatedQuery, [ajusteId]);
    const updatedAjuste = updatedResult.rows[0];

    // Log de auditoría
    console.log('Ajuste actualizado:', sanitizeForLog({
      ajuste_id: ajusteId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      message: 'Ajuste actualizado exitosamente',
      data: updatedAjuste
    });

  } catch (error) {
    console.error('Error al actualizar ajuste:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}

// DELETE /api/compras/ajustes-inventario/[id] - Eliminar un ajuste
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const ajusteId = parseInt(params.id);
    if (isNaN(ajusteId)) {
      return NextResponse.json({
        success: false,
        message: 'ID de ajuste inválido',
        error: 'ID inválido'
      }, { status: 400 });
    }

    // Verificar que el ajuste existe
    const checkQuery = 'SELECT ajuste_id, estado FROM ajustes_inventario WHERE ajuste_id = $1';
    const checkResult = await pool.query(checkQuery, [ajusteId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'El ajuste especificado no existe',
        error: 'Ajuste no encontrado'
      }, { status: 404 });
    }

    const ajusteActual = checkResult.rows[0];

    // Solo permitir eliminación si está en estado borrador
    if (ajusteActual.estado !== 'borrador') {
      return NextResponse.json({
        success: false,
        message: 'Solo se pueden eliminar ajustes en estado borrador',
        error: 'Estado inválido'
      }, { status: 400 });
    }

    // Eliminar ajuste (los detalles se eliminan automáticamente por CASCADE)
    const deleteQuery = 'DELETE FROM ajustes_inventario WHERE ajuste_id = $1';
    await pool.query(deleteQuery, [ajusteId]);

    // Log de auditoría
    console.log('Ajuste eliminado:', sanitizeForLog({
      ajuste_id: ajusteId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      message: 'Ajuste eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar ajuste:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
