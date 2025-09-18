import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaDebitoCompraData, 
  sanitizeForLog 
} from '@/lib/utils/compras-adicionales';
import { 
  UpdateNotaDebitoCompraRequest, 
  ComprasAdicionalesApiResponse 
} from '@/lib/types/compras-adicionales';

// GET /api/compras/notas-debito/[id] - Obtener nota de débito por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_notas_debito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const notaDebitoId = parseInt(params.id);

    if (isNaN(notaDebitoId)) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'ID de nota de débito inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Obtener nota de débito con detalles
    const query = `
      SELECT 
        nd.nota_debito_id,
        nd.tipo_operacion,
        nd.proveedor_id,
        nd.cliente_id,
        nd.sucursal_id,
        nd.almacen_id,
        nd.usuario_id,
        nd.fecha_registro,
        nd.nro_nota,
        nd.motivo,
        nd.estado,
        nd.referencia_id,
        nd.monto_nd,
        nd.monto_gravada_5,
        nd.monto_gravada_10,
        nd.monto_exento,
        nd.total_iva,
        nd.total_nota,
        p.nombre_proveedor,
        c.nombre as cliente_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre,
        u.nombre as usuario_nombre,
        CASE 
          WHEN nd.estado = 'activo' THEN 'Activa'
          WHEN nd.estado = 'anulada' THEN 'Anulada'
          ELSE nd.estado
        END as estado_display
      FROM nota_debito_cabecera nd
      LEFT JOIN proveedores p ON nd.proveedor_id = p.proveedor_id
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON nd.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nd.almacen_id = a.almacen_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
      WHERE nd.nota_debito_id = $1
    `;

    const result = await pool.query(query, [notaDebitoId]);

    if (result.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Nota de débito no encontrada',
        error: 'No encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Obtener detalles de la nota
    const detallesQuery = `
      SELECT 
        ndd.detalle_id,
        ndd.producto_id,
        ndd.cantidad,
        ndd.precio_unitario,
        ndd.subtotal,
        ndd.iva,
        ndd.total,
        p.nombre_producto,
        p.cod_product
      FROM nota_debito_detalle ndd
      LEFT JOIN productos p ON ndd.producto_id = p.producto_id
      WHERE ndd.nota_debito_id = $1
      ORDER BY ndd.detalle_id
    `;

    const detallesResult = await pool.query(detallesQuery, [notaDebitoId]);

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Nota de débito obtenida exitosamente',
      data: {
        ...result.rows[0],
        detalles: detallesResult.rows
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener nota de débito:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/compras/notas-debito/[id] - Actualizar nota de débito
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('actualizar_notas_debito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const notaDebitoId = parseInt(params.id);

    if (isNaN(notaDebitoId)) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'ID de nota de débito inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: UpdateNotaDebitoCompraRequest = await request.json();

    // Validar datos
    const validation = validateNotaDebitoCompraData(body);
    if (!validation.valid) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la nota existe
    const existingNotaQuery = 'SELECT nota_debito_id, estado FROM nota_debito_cabecera WHERE nota_debito_id = $1';
    const existingNota = await pool.query(existingNotaQuery, [notaDebitoId]);
    
    if (existingNota.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Nota de débito no encontrada',
        error: 'No encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que no esté anulada
    if (existingNota.rows[0].estado === 'anulada') {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'No se puede modificar una nota de débito anulada',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Actualizar nota de débito
    const updateNotaQuery = `
      UPDATE nota_debito_cabecera 
      SET 
        tipo_operacion = $1,
        proveedor_id = $2,
        cliente_id = $3,
        sucursal_id = $4,
        almacen_id = $5,
        usuario_id = $6,
        fecha_registro = $7,
        motivo = $8,
        estado = $9,
        referencia_id = $10,
        monto_nd = $11,
        monto_gravada_5 = $12,
        monto_gravada_10 = $13,
        monto_exento = $14,
        total_iva = $15,
        total_nota = $16
      WHERE nota_debito_id = $17
      RETURNING nota_debito_id
    `;

    await pool.query(updateNotaQuery, [
      body.tipo_operacion,
      body.proveedor_id || null,
      body.cliente_id || null,
      body.sucursal_id,
      body.almacen_id,
      body.usuario_id,
      body.fecha_registro,
      body.motivo,
      body.estado,
      body.referencia_id,
      body.monto_nd || 0,
      body.monto_gravada_5 || 0,
      body.monto_gravada_10 || 0,
      body.monto_exento || 0,
      body.total_iva || 0,
      body.total_nota || 0,
      notaDebitoId
    ]);

    // Obtener la nota actualizada
    const getNotaQuery = `
      SELECT 
        nd.nota_debito_id,
        nd.tipo_operacion,
        nd.proveedor_id,
        nd.cliente_id,
        nd.sucursal_id,
        nd.almacen_id,
        nd.usuario_id,
        nd.fecha_registro,
        nd.nro_nota,
        nd.motivo,
        nd.estado,
        nd.referencia_id,
        nd.monto_nd,
        nd.monto_gravada_5,
        nd.monto_gravada_10,
        nd.monto_exento,
        nd.total_iva,
        nd.total_nota,
        p.nombre_proveedor,
        c.nombre as cliente_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre,
        u.nombre as usuario_nombre
      FROM nota_debito_cabecera nd
      LEFT JOIN proveedores p ON nd.proveedor_id = p.proveedor_id
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON nd.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nd.almacen_id = a.almacen_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
      WHERE nd.nota_debito_id = $1
    `;

    const notaData = await pool.query(getNotaQuery, [notaDebitoId]);

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Nota de débito actualizada exitosamente',
      data: notaData.rows[0]
    };

    // Log de auditoría
    console.log('Nota de débito actualizada:', sanitizeForLog({
      nota_debito_id: notaDebitoId,
      tipo_operacion: body.tipo_operacion,
      estado: body.estado,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar nota de débito:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/compras/notas-debito/[id] - Eliminar nota de débito
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('eliminar_notas_debito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const notaDebitoId = parseInt(params.id);

    if (isNaN(notaDebitoId)) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'ID de nota de débito inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la nota existe
    const existingNotaQuery = 'SELECT nota_debito_id, nro_nota, estado FROM nota_debito_cabecera WHERE nota_debito_id = $1';
    const existingNota = await pool.query(existingNotaQuery, [notaDebitoId]);
    
    if (existingNota.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Nota de débito no encontrada',
        error: 'No encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que no esté anulada
    if (existingNota.rows[0].estado === 'anulada') {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'No se puede eliminar una nota de débito anulada',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar detalles primero
    const deleteDetallesQuery = 'DELETE FROM nota_debito_detalle WHERE nota_debito_id = $1';
    await pool.query(deleteDetallesQuery, [notaDebitoId]);

    // Eliminar nota de débito
    const deleteNotaQuery = 'DELETE FROM nota_debito_cabecera WHERE nota_debito_id = $1';
    await pool.query(deleteNotaQuery, [notaDebitoId]);

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Nota de débito eliminada exitosamente'
    };

    // Log de auditoría
    console.log('Nota de débito eliminada:', sanitizeForLog({
      nota_debito_id: notaDebitoId,
      nro_nota: existingNota.rows[0].nro_nota,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar nota de débito:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
