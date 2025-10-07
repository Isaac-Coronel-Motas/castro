import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaCreditoDebitoData, 
  sanitizeForLog 
} from '@/lib/utils/compras-adicionales';
import { 
  UpdateNotaCreditoDebitoRequest, 
  ComprasAdicionalesApiResponse 
} from '@/lib/types/compras-adicionales';

// GET /api/compras/notas-credito/[id] - Obtener nota de crédito por ID
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

    const notaId = parseInt(params.id);
    if (isNaN(notaId)) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'ID de nota inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Obtener nota de crédito con detalles
    const query = `
      SELECT 
        nc.nota_credito_id,
        nc.tipo_operacion,
        nc.proveedor_id,
        nc.cliente_id,
        nc.sucursal_id,
        nc.almacen_id,
        nc.usuario_id,
        nc.fecha_registro,
        nc.nro_nota,
        nc.motivo,
        nc.estado,
        nc.referencia_id,
        nc.monto_nc,
        nc.monto_gravada_5,
        nc.monto_gravada_10,
        nc.monto_exenta,
        nc.monto_iva,
        p.nombre_proveedor as proveedor_nombre,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre,
        COUNT(ncd.nota_credito_detalle_id) as total_items,
        COALESCE(SUM(ncd.cantidad * ncd.precio_unitario), 0) as monto_total_items
      FROM nota_credito_cabecera nc
      LEFT JOIN proveedores p ON nc.proveedor_id = p.proveedor_id
      LEFT JOIN clientes c ON nc.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nc.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON nc.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nc.almacen_id = a.almacen_id
      LEFT JOIN nota_credito_detalle ncd ON nc.nota_credito_id = ncd.nota_credito_id
      WHERE nc.nota_credito_id = $1
      GROUP BY nc.nota_credito_id, nc.tipo_operacion, nc.proveedor_id, nc.cliente_id, 
               nc.sucursal_id, nc.almacen_id, nc.usuario_id, nc.fecha_registro, 
               nc.nro_nota, nc.motivo, nc.estado, nc.referencia_id, nc.monto_nc, 
               nc.monto_gravada_5, nc.monto_gravada_10, nc.monto_exenta, nc.monto_iva, 
               p.nombre_proveedor, c.nombre, u.nombre, s.nombre, a.nombre
    `;

    const result = await pool.query(query, [notaId]);
    
    if (result.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Nota de crédito no encontrada',
        error: 'No encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const nota = result.rows[0];

    // Obtener detalles de la nota
    const detallesQuery = `
      SELECT 
        ncd.nota_credito_detalle_id,
        ncd.nota_credito_id,
        ncd.producto_id,
        ncd.cantidad,
        ncd.precio_unitario,
        p.nombre as producto_nombre,
        p.cod_producto as producto_codigo,
        (ncd.cantidad * ncd.precio_unitario) as subtotal
      FROM nota_credito_detalle ncd
      LEFT JOIN productos p ON ncd.producto_id = p.producto_id
      WHERE ncd.nota_credito_id = $1
      ORDER BY ncd.nota_credito_detalle_id
    `;

    const detallesResult = await pool.query(detallesQuery, [notaId]);
    nota.detalles = detallesResult.rows;

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Nota de crédito obtenida exitosamente',
      data: nota
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener nota de crédito:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/compras/notas-credito/[id] - Actualizar nota de crédito
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.editar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const notaId = parseInt(params.id);
    if (isNaN(notaId)) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'ID de nota inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: UpdateNotaCreditoDebitoRequest = await request.json();

    // Verificar que la nota existe
    const notaQuery = 'SELECT estado FROM nota_credito_cabecera WHERE nota_credito_id = $1';
    const notaResult = await pool.query(notaQuery, [notaId]);
    
    if (notaResult.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Nota de crédito no encontrada',
        error: 'No encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const notaActual = notaResult.rows[0];

    // Solo permitir edición si está en estado activo
    if (notaActual.estado !== 'activo') {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Solo se pueden editar notas en estado activo',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validar datos
    const validation = validateNotaCreditoDebitoData(body as any);
    if (!validation.valid) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar nota de crédito
    const updateQuery = `
      UPDATE nota_credito_cabecera SET
        tipo_operacion = COALESCE($2, tipo_operacion),
        proveedor_id = COALESCE($3, proveedor_id),
        cliente_id = COALESCE($4, cliente_id),
        sucursal_id = COALESCE($5, sucursal_id),
        almacen_id = COALESCE($6, almacen_id),
        motivo = COALESCE($7, motivo),
        estado = COALESCE($8, estado),
        referencia_id = COALESCE($9, referencia_id),
        monto_nc = COALESCE($10, monto_nc),
        monto_gravada_5 = COALESCE($11, monto_gravada_5),
        monto_gravada_10 = COALESCE($12, monto_gravada_10),
        monto_exenta = COALESCE($13, monto_exenta),
        monto_iva = COALESCE($14, monto_iva)
      WHERE nota_credito_id = $1
    `;

    await pool.query(updateQuery, [
      notaId,
      body.tipo_operacion,
      body.proveedor_id,
      body.cliente_id,
      body.sucursal_id,
      body.almacen_id,
      body.motivo,
      body.estado,
      body.referencia_id,
      body.monto_nc,
      body.monto_gravada_5,
      body.monto_gravada_10,
      body.monto_exenta,
      body.monto_iva
    ]);

    // Actualizar detalles si se proporcionan
    if (body.items && body.items.length > 0) {
      // Eliminar detalles existentes
      await pool.query('DELETE FROM nota_credito_detalle WHERE nota_credito_id = $1', [notaId]);
      
      // Insertar nuevos detalles
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO nota_credito_detalle (nota_credito_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [notaId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }
    }

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Nota de crédito actualizada exitosamente'
    };

    // Log de auditoría
    console.log('Nota de crédito actualizada:', sanitizeForLog({
      nota_credito_id: notaId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar nota de crédito:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/compras/notas-credito/[id] - Eliminar nota de crédito
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const notaId = parseInt(params.id);
    if (isNaN(notaId)) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'ID de nota inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la nota existe
    const notaQuery = 'SELECT estado FROM nota_credito_cabecera WHERE nota_credito_id = $1';
    const notaResult = await pool.query(notaQuery, [notaId]);
    
    if (notaResult.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Nota de crédito no encontrada',
        error: 'No encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const notaActual = notaResult.rows[0];

    // Solo permitir eliminación si está en estado activo
    if (notaActual.estado !== 'activo') {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Solo se pueden eliminar notas en estado activo',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Eliminar nota de crédito (los detalles se eliminan por CASCADE)
    await pool.query('DELETE FROM nota_credito_cabecera WHERE nota_credito_id = $1', [notaId]);

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Nota de crédito eliminada exitosamente'
    };

    // Log de auditoría
    console.log('Nota de crédito eliminada:', sanitizeForLog({
      nota_credito_id: notaId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar nota de crédito:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
