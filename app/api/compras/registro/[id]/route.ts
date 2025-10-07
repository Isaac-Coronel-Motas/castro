import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateRegistroCompraData,
  sanitizeForLog 
} from '@/lib/utils/compras-adicionales';
import { 
  CreateRegistroCompraRequest, 
  ComprasAdicionalesApiResponse 
} from '@/lib/types/compras-adicionales';

// GET /api/compras/registro/[id] - Obtener una compra específica
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

    const compraId = parseInt(params.id);
    if (isNaN(compraId)) {
      return NextResponse.json({
        success: false,
        message: 'ID de compra inválido',
        error: 'ID inválido'
      }, { status: 400 });
    }

    const query = `
      SELECT 
        cc.compra_id,
        cc.proveedor_id,
        cc.usuario_id,
        cc.fecha_compra,
        cc.monto_compra,
        cc.estado,
        cc.observaciones,
        cc.almacen_id,
        cc.orden_compra_id,
        cc.sucursal_id,
        cc.condicion_pago,
        cc.timbrado,
        cc.nro_factura,
        cc.fecha_comprobante,
        cc.tipo_doc_id,
        cc.monto_gravada_5,
        cc.monto_gravada_10,
        cc.monto_exenta,
        cc.monto_iva,
        p.nombre_proveedor as proveedor_nombre,
        u.nombre as usuario_nombre,
        a.nombre as almacen_nombre,
        s.nombre as sucursal_nombre,
        td.descripcion as tipo_documento_nombre,
        COUNT(dc.detalle_compra_id) as total_items,
        COALESCE(SUM(dc.cantidad * dc.precio_unitario), 0) as monto_total_items,
        cpp.cuenta_pagar_id,
        cpp.fecha_emision as fecha_emision_cuenta,
        cpp.fecha_vencimiento,
        cpp.monto_adeudado,
        cpp.saldo_pendiente,
        cpp.estado as estado_cuenta,
        CASE 
          WHEN cpp.fecha_vencimiento IS NOT NULL THEN 
            (cpp.fecha_vencimiento - CURRENT_DATE)
          ELSE NULL
        END as dias_vencimiento,
        CASE 
          WHEN cpp.fecha_vencimiento IS NOT NULL THEN
            CASE 
              WHEN cpp.fecha_vencimiento < CURRENT_DATE THEN 'vencida'
              WHEN cpp.fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days' THEN 'por_vencer'
              ELSE 'vigente'
            END
          ELSE 'sin_vencimiento'
        END as estado_vencimiento
      FROM compra_cabecera cc
      LEFT JOIN proveedores p ON cc.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON cc.usuario_id = u.usuario_id
      LEFT JOIN almacenes a ON cc.almacen_id = a.almacen_id
      LEFT JOIN sucursales s ON cc.sucursal_id = s.sucursal_id
      LEFT JOIN tipo_documento td ON cc.tipo_doc_id = td.tipo_doc_id
      LEFT JOIN detalle_compras dc ON cc.compra_id = dc.compra_id
      LEFT JOIN cuentas_por_pagar cpp ON cc.compra_id = cpp.compra_id
      WHERE cc.compra_id = $1
      GROUP BY cc.compra_id, cc.proveedor_id, cc.usuario_id, cc.fecha_compra, 
               cc.monto_compra, cc.estado, cc.observaciones, cc.almacen_id, 
               cc.orden_compra_id, cc.sucursal_id, cc.condicion_pago, cc.timbrado, 
               cc.nro_factura, cc.fecha_comprobante, cc.tipo_doc_id, cc.monto_gravada_5, 
               cc.monto_gravada_10, cc.monto_exenta, cc.monto_iva, p.nombre_proveedor, 
               u.nombre, a.nombre, s.nombre, td.descripcion, cpp.cuenta_pagar_id, 
               cpp.fecha_emision, cpp.fecha_vencimiento, cpp.monto_adeudado, 
               cpp.saldo_pendiente, cpp.estado
    `;

    const result = await pool.query(query, [compraId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Compra no encontrada',
        error: 'No encontrada'
      }, { status: 404 });
    }

    const compra = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Compra obtenida exitosamente',
      data: compra
    });

  } catch (error) {
    console.error('Error al obtener compra:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}

// PUT /api/compras/registro/[id] - Actualizar una compra
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

    const compraId = parseInt(params.id);
    if (isNaN(compraId)) {
      return NextResponse.json({
        success: false,
        message: 'ID de compra inválido',
        error: 'ID inválido'
      }, { status: 400 });
    }

    const body: CreateRegistroCompraRequest = await request.json();

    // Validar datos
    const validation = validateRegistroCompraData(body);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      }, { status: 400 });
    }

    // Verificar que la compra existe
    const checkQuery = 'SELECT compra_id FROM compra_cabecera WHERE compra_id = $1';
    const checkResult = await pool.query(checkQuery, [compraId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'La compra especificada no existe',
        error: 'Compra no encontrada'
      }, { status: 404 });
    }

    // Actualizar compra
    const updateQuery = `
      UPDATE compra_cabecera SET
        proveedor_id = $1,
        usuario_id = $2,
        fecha_compra = $3,
        monto_compra = $4,
        estado = $5,
        observaciones = $6,
        almacen_id = $7,
        orden_compra_id = $8,
        sucursal_id = $9,
        condicion_pago = $10,
        timbrado = $11,
        nro_factura = $12,
        fecha_comprobante = $13,
        tipo_doc_id = $14,
        monto_gravada_5 = $15,
        monto_gravada_10 = $16,
        monto_exenta = $17,
        monto_iva = $18
      WHERE compra_id = $19
      RETURNING compra_id
    `;

    await pool.query(updateQuery, [
      body.proveedor_id,
      body.usuario_id || null,
      body.fecha_compra || new Date().toISOString().split('T')[0],
      body.monto_compra,
      body.estado || 'pendiente',
      body.observaciones || null,
      body.almacen_id || null,
      body.orden_compra_id || null,
      body.sucursal_id,
      body.condicion_pago || null,
      body.timbrado || null,
      body.nro_factura || null,
      body.fecha_comprobante || null,
      body.tipo_doc_id,
      body.monto_gravada_5 || 0,
      body.monto_gravada_10 || 0,
      body.monto_exenta || 0,
      body.monto_iva || 0,
      compraId
    ]);

    // Obtener la compra actualizada
    const getUpdatedQuery = `
      SELECT 
        cc.compra_id,
        cc.proveedor_id,
        cc.usuario_id,
        cc.fecha_compra,
        cc.monto_compra,
        cc.estado,
        cc.observaciones,
        cc.almacen_id,
        cc.orden_compra_id,
        cc.sucursal_id,
        cc.condicion_pago,
        cc.timbrado,
        cc.nro_factura,
        cc.fecha_comprobante,
        cc.tipo_doc_id,
        cc.monto_gravada_5,
        cc.monto_gravada_10,
        cc.monto_exenta,
        cc.monto_iva,
        p.nombre_proveedor as proveedor_nombre,
        u.nombre as usuario_nombre,
        a.nombre as almacen_nombre,
        s.nombre as sucursal_nombre,
        td.descripcion as tipo_documento_nombre
      FROM compra_cabecera cc
      LEFT JOIN proveedores p ON cc.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON cc.usuario_id = u.usuario_id
      LEFT JOIN almacenes a ON cc.almacen_id = a.almacen_id
      LEFT JOIN sucursales s ON cc.sucursal_id = s.sucursal_id
      LEFT JOIN tipo_documento td ON cc.tipo_doc_id = td.tipo_doc_id
      WHERE cc.compra_id = $1
    `;

    const updatedResult = await pool.query(getUpdatedQuery, [compraId]);
    const updatedCompra = updatedResult.rows[0];

    // Log de auditoría
    console.log('Compra actualizada:', sanitizeForLog({
      compra_id: compraId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      message: 'Compra actualizada exitosamente',
      data: updatedCompra
    });

  } catch (error) {
    console.error('Error al actualizar compra:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}

// DELETE /api/compras/registro/[id] - Eliminar una compra
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

    const compraId = parseInt(params.id);
    if (isNaN(compraId)) {
      return NextResponse.json({
        success: false,
        message: 'ID de compra inválido',
        error: 'ID inválido'
      }, { status: 400 });
    }

    // Verificar que la compra existe
    const checkQuery = 'SELECT compra_id FROM compra_cabecera WHERE compra_id = $1';
    const checkResult = await pool.query(checkQuery, [compraId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'La compra especificada no existe',
        error: 'Compra no encontrada'
      }, { status: 404 });
    }

    // Eliminar compra (los detalles se eliminan automáticamente por CASCADE)
    const deleteQuery = 'DELETE FROM compra_cabecera WHERE compra_id = $1';
    await pool.query(deleteQuery, [compraId]);

    // Log de auditoría
    console.log('Compra eliminada:', sanitizeForLog({
      compra_id: compraId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      message: 'Compra eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar compra:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
