import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validatePresupuestoProveedorData, 
  canApprovePresupuesto,
  sanitizeForLog 
} from '@/lib/utils/compras';
import { 
  UpdatePresupuestoProveedorRequest, 
  ComprasApiResponse 
} from '@/lib/types/compras';

// GET /api/compras/presupuestos/[id] - Obtener presupuesto proveedor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('leer_presupuestos_proveedor')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener presupuesto con información completa
    const presupuestoQuery = `
      SELECT 
        pp.presu_prov_id,
        pp.usuario_id,
        pp.fecha_presupuesto,
        pp.estado,
        pp.observaciones,
        pp.monto_presu_prov,
        pp.nro_comprobante,
        pp.pedido_prov_id,
        pp.proveedor_id,
        u.nombre as usuario_nombre,
        p.nombre_proveedor as proveedor_nombre,
        (pp.fecha_presupuesto + INTERVAL '30 days') as fecha_vencimiento,
        CASE 
          WHEN (pp.fecha_presupuesto + INTERVAL '30 days') < CURRENT_DATE THEN 'vencido'
          WHEN (pp.fecha_presupuesto + INTERVAL '7 days') < CURRENT_DATE THEN 'por_vencer'
          ELSE 'vigente'
        END as estado_vencimiento,
        CASE 
          WHEN (pp.fecha_presupuesto + INTERVAL '30 days') < CURRENT_DATE THEN 'alta'
          WHEN (pp.fecha_presupuesto + INTERVAL '7 days') < CURRENT_DATE THEN 'media'
          ELSE 'baja'
        END as prioridad
      FROM presupuesto_proveedor pp
      LEFT JOIN usuarios u ON pp.usuario_id = u.usuario_id
      LEFT JOIN proveedores p ON pp.proveedor_id = p.proveedor_id
      WHERE pp.presu_prov_id = $1
    `;

    const presupuestoResult = await pool.query(presupuestoQuery, [presupuestoId]);
    
    if (presupuestoResult.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Presupuesto proveedor no encontrado',
        error: 'Presupuesto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Obtener items del presupuesto
    const itemsQuery = `
      SELECT 
        dpp.det_pres_prov_id,
        dpp.presu_prov_id,
        dpp.producto_id,
        dpp.cantidad,
        dpp.precio_unitario,
        p.nombre_producto as producto_nombre,
        p.cod_product as producto_codigo,
        (dpp.cantidad * dpp.precio_unitario) as subtotal
      FROM presupuesto_proveedor_detalle dpp
      LEFT JOIN productos p ON dpp.producto_id = p.producto_id
      WHERE dpp.presu_prov_id = $1
    `;

    const itemsResult = await pool.query(itemsQuery, [presupuestoId]);

    // Calcular totales
    const totalItems = itemsResult.rows.length;
    const montoTotal = itemsResult.rows.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);

    const presupuesto = {
      ...presupuestoResult.rows[0],
      items: itemsResult.rows,
      total_items: totalItems,
      monto_total: montoTotal
    };

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuesto proveedor obtenido exitosamente',
      data: presupuesto
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener presupuesto proveedor:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/compras/presupuestos/[id] - Actualizar presupuesto proveedor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('actualizar_presupuestos_proveedor')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdatePresupuestoProveedorRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
      const validation = validatePresupuestoProveedorData(body as any);
      if (!validation.valid) {
        const response: ComprasApiResponse = {
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'Validación fallida',
          data: validation.errors
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el presupuesto existe
    const existingPresupuestoQuery = 'SELECT presu_prov_id, estado FROM presupuesto_proveedor WHERE presu_prov_id = $1';
    const existingPresupuesto = await pool.query(existingPresupuestoQuery, [presupuestoId]);
    
    if (existingPresupuesto.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Presupuesto proveedor no encontrado',
        error: 'Presupuesto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el presupuesto puede ser modificado
    if (body.estado && !canApprovePresupuesto(existingPresupuesto.rows[0].estado)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No se puede modificar un presupuesto que ya ha sido aprobado o rechazado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Verificar que el proveedor existe si se proporciona
    if (body.proveedor_id) {
      const proveedorQuery = 'SELECT proveedor_id FROM proveedores WHERE proveedor_id = $1';
      const proveedorResult = await pool.query(proveedorQuery, [body.proveedor_id]);
      
      if (proveedorResult.rows.length === 0) {
        const response: ComprasApiResponse = {
          success: false,
          message: 'El proveedor especificado no existe',
          error: 'Proveedor inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.usuario_id !== undefined) {
      paramCount++;
      updateFields.push(`usuario_id = $${paramCount}`);
      updateValues.push(body.usuario_id);
    }

    if (body.fecha_presupuesto !== undefined) {
      paramCount++;
      updateFields.push(`fecha_presupuesto = $${paramCount}`);
      updateValues.push(body.fecha_presupuesto);
    }

    if (body.estado !== undefined) {
      paramCount++;
      updateFields.push(`estado = $${paramCount}`);
      updateValues.push(body.estado);
    }

    if (body.observaciones !== undefined) {
      paramCount++;
      updateFields.push(`observaciones = $${paramCount}`);
      updateValues.push(body.observaciones);
    }

    if (body.monto_presu_prov !== undefined) {
      paramCount++;
      updateFields.push(`monto_presu_prov = $${paramCount}`);
      updateValues.push(body.monto_presu_prov);
    }

    if (body.nro_comprobante !== undefined) {
      paramCount++;
      updateFields.push(`nro_comprobante = $${paramCount}`);
      updateValues.push(body.nro_comprobante);
    }

    if (body.pedido_prov_id !== undefined) {
      paramCount++;
      updateFields.push(`pedido_prov_id = $${paramCount}`);
      updateValues.push(body.pedido_prov_id);
    }

    if (body.proveedor_id !== undefined) {
      paramCount++;
      updateFields.push(`proveedor_id = $${paramCount}`);
      updateValues.push(body.proveedor_id);
    }

    if (updateFields.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar presupuesto
    paramCount++;
    updateValues.push(presupuestoId);

    const updateQuery = `
      UPDATE presupuesto_proveedor 
      SET ${updateFields.join(', ')}
      WHERE presu_prov_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Actualizar items si se proporcionan
    if (body.items) {
      // Eliminar items existentes
      await pool.query('DELETE FROM presupuesto_proveedor_detalle WHERE presu_prov_id = $1', [presupuestoId]);
      
      // Insertar nuevos items
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO presupuesto_proveedor_detalle (presu_prov_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [presupuestoId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }

      // Recalcular monto total
      const montoTotal = body.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
      await pool.query(
        'UPDATE presupuesto_proveedor SET monto_presu_prov = $1 WHERE presu_prov_id = $2',
        [montoTotal, presupuestoId]
      );
    }

    // Obtener presupuesto actualizado
    const getPresupuestoQuery = `
      SELECT 
        pp.presu_prov_id,
        pp.usuario_id,
        pp.fecha_presupuesto,
        pp.estado,
        pp.observaciones,
        pp.monto_presu_prov,
        pp.nro_comprobante,
        pp.pedido_prov_id,
        pp.proveedor_id,
        u.nombre as usuario_nombre,
        p.nombre_proveedor as proveedor_nombre,
        (pp.fecha_presupuesto + INTERVAL '30 days') as fecha_vencimiento,
        CASE 
          WHEN (pp.fecha_presupuesto + INTERVAL '30 days') < CURRENT_DATE THEN 'vencido'
          WHEN (pp.fecha_presupuesto + INTERVAL '7 days') < CURRENT_DATE THEN 'por_vencer'
          ELSE 'vigente'
        END as estado_vencimiento,
        CASE 
          WHEN (pp.fecha_presupuesto + INTERVAL '30 days') < CURRENT_DATE THEN 'alta'
          WHEN (pp.fecha_presupuesto + INTERVAL '7 days') < CURRENT_DATE THEN 'media'
          ELSE 'baja'
        END as prioridad
      FROM presupuesto_proveedor pp
      LEFT JOIN usuarios u ON pp.usuario_id = u.usuario_id
      LEFT JOIN proveedores p ON pp.proveedor_id = p.proveedor_id
      WHERE pp.presu_prov_id = $1
    `;

    const presupuestoData = await pool.query(getPresupuestoQuery, [presupuestoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuesto proveedor actualizado exitosamente',
      data: presupuestoData.rows[0]
    };

    // Log de auditoría
    console.log('Presupuesto proveedor actualizado:', sanitizeForLog({
      presu_prov_id: presupuestoId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar presupuesto proveedor:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/compras/presupuestos/[id] - Eliminar presupuesto proveedor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('eliminar_presupuestos_proveedor')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el presupuesto existe
    const existingPresupuestoQuery = 'SELECT presu_prov_id, estado, nro_comprobante FROM presupuesto_proveedor WHERE presu_prov_id = $1';
    const existingPresupuesto = await pool.query(existingPresupuestoQuery, [presupuestoId]);
    
    if (existingPresupuesto.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Presupuesto proveedor no encontrado',
        error: 'Presupuesto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el presupuesto puede ser eliminado
    if (!canApprovePresupuesto(existingPresupuesto.rows[0].estado)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No se puede eliminar un presupuesto que ya ha sido aprobado o rechazado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar en cascada: detalles y finalmente el presupuesto
    await pool.query('DELETE FROM presupuesto_proveedor_detalle WHERE presu_prov_id = $1', [presupuestoId]);
    await pool.query('DELETE FROM presupuesto_proveedor WHERE presu_prov_id = $1', [presupuestoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuesto proveedor eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Presupuesto proveedor eliminado:', sanitizeForLog({
      presu_prov_id: presupuestoId,
      nro_comprobante: existingPresupuesto.rows[0].nro_comprobante,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar presupuesto proveedor:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/compras/presupuestos/[id]/aprobar - Aprobar presupuesto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('aprobar_presupuestos_proveedor')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el presupuesto existe
    const existingPresupuestoQuery = 'SELECT presu_prov_id, estado FROM presupuesto_proveedor WHERE presu_prov_id = $1';
    const existingPresupuesto = await pool.query(existingPresupuestoQuery, [presupuestoId]);
    
    if (existingPresupuesto.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Presupuesto proveedor no encontrado',
        error: 'Presupuesto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el presupuesto puede ser aprobado
    if (!canApprovePresupuesto(existingPresupuesto.rows[0].estado)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No se puede aprobar un presupuesto que ya ha sido aprobado o rechazado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Aprobar presupuesto
    await pool.query(
      'UPDATE presupuesto_proveedor SET estado = $1 WHERE presu_prov_id = $2',
      ['aprobado', presupuestoId]
    );

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuesto proveedor aprobado exitosamente'
    };

    // Log de auditoría
    console.log('Presupuesto proveedor aprobado:', sanitizeForLog({
      presu_prov_id: presupuestoId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al aprobar presupuesto proveedor:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
