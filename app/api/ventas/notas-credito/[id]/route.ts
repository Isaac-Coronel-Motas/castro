import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaCreditoVentaData,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  UpdateNotaCreditoVentaRequest,
  VentasApiResponse 
} from '@/lib/types/ventas';

// GET /api/ventas/notas-credito/[id] - Obtener nota de crédito específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notaCreditoId = parseInt(params.id);

    if (isNaN(notaCreditoId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de nota de crédito inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('leer_notas_credito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener la nota de crédito con detalles
    const query = `
      SELECT 
        nc.nota_credito_id,
        nc.fecha_nota,
        nc.cliente_id,
        nc.usuario_id,
        nc.tipo_documento,
        nc.nro_documento,
        nc.nro_nota,
        nc.timbrado,
        nc.estado,
        nc.observaciones,
        nc.total_gravado,
        nc.total_iva,
        nc.total_exento,
        nc.total_nota,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        (
          SELECT json_agg(
            json_build_object(
              'detalle_id', ncd.detalle_id,
              'producto_id', ncd.producto_id,
              'cantidad', ncd.cantidad,
              'precio_unitario', ncd.precio_unitario,
              'descuento', ncd.descuento,
              'subtotal', ncd.subtotal,
              'gravado', ncd.gravado,
              'exento', ncd.exento,
              'iva', ncd.iva,
              'producto_nombre', p.nombre,
              'producto_codigo', p.codigo
            )
          )
          FROM nota_credito_detalle ncd
          LEFT JOIN productos p ON ncd.producto_id = p.producto_id
          WHERE ncd.nota_credito_id = nc.nota_credito_id
        ) as detalles
      FROM nota_credito_cabecera nc
      LEFT JOIN clientes c ON nc.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nc.usuario_id = u.usuario_id
      WHERE nc.nota_credito_id = $1
    `;

    const result = await pool.query(query, [notaCreditoId]);

    if (result.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Nota de crédito no encontrada',
        error: 'Nota de crédito no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: VentasApiResponse = {
      success: true,
      message: 'Nota de crédito obtenida exitosamente',
      data: result.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener nota de crédito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/notas-credito/[id] - Actualizar nota de crédito
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notaCreditoId = parseInt(params.id);

    if (isNaN(notaCreditoId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de nota de crédito inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('modificar_notas_credito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateNotaCreditoVentaRequest = await request.json();

    // Validar datos
    const validation = validateNotaCreditoVentaData(body);
    if (!validation.valid) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la nota de crédito existe
    const existingNotaCreditoQuery = 'SELECT nota_credito_id, estado FROM nota_credito_cabecera WHERE nota_credito_id = $1';
    const existingNotaCredito = await pool.query(existingNotaCreditoQuery, [notaCreditoId]);
    
    if (existingNotaCredito.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Nota de crédito no encontrada',
        error: 'Nota de crédito no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la nota de crédito puede ser modificada
    if (existingNotaCredito.rows[0].estado !== 'pendiente') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden modificar notas de crédito pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Actualizar nota de crédito
    const updateNotaCreditoQuery = `
      UPDATE nota_credito_cabecera SET
        fecha_nota = $1,
        cliente_id = $2,
        usuario_id = $3,
        tipo_documento = $4,
        nro_documento = $5,
        nro_nota = $6,
        timbrado = $7,
        estado = $8,
        observaciones = $9,
        total_gravado = $10,
        total_iva = $11,
        total_exento = $12,
        total_nota = $13
      WHERE nota_credito_id = $14
    `;

    await pool.query(updateNotaCreditoQuery, [
      body.fecha_nota,
      body.cliente_id,
      body.usuario_id,
      body.tipo_documento,
      body.nro_documento || null,
      body.nro_nota || null,
      body.timbrado || null,
      body.estado || 'pendiente',
      body.observaciones || null,
      body.total_gravado || 0,
      body.total_iva || 0,
      body.total_exento || 0,
      body.total_nota || 0,
      notaCreditoId
    ]);

    // Actualizar detalles si se proporcionan
    if (body.detalles && body.detalles.length > 0) {
      // Eliminar detalles existentes
      await pool.query('DELETE FROM nota_credito_detalle WHERE nota_credito_id = $1', [notaCreditoId]);

      // Crear nuevos detalles
      for (const detalle of body.detalles) {
        await pool.query(
          `INSERT INTO nota_credito_detalle (
            nota_credito_id, producto_id, cantidad, precio_unitario, 
            descuento, subtotal, gravado, exento, iva
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            notaCreditoId,
            detalle.producto_id,
            detalle.cantidad,
            detalle.precio_unitario,
            detalle.descuento || 0,
            detalle.subtotal,
            detalle.gravado || 0,
            detalle.exento || 0,
            detalle.iva || 0
          ]
        );
      }
    }

    const response: VentasApiResponse = {
      success: true,
      message: 'Nota de crédito actualizada exitosamente'
    };

    // Log de auditoría
    console.log('Nota de crédito actualizada:', sanitizeForLog({
      nota_credito_id: notaCreditoId,
      cliente_id: body.cliente_id,
      usuario_id: body.usuario_id,
      tipo_documento: body.tipo_documento,
      total_nota: body.total_nota || 0,
      estado: body.estado || 'pendiente',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar nota de crédito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/ventas/notas-credito/[id] - Eliminar nota de crédito
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notaCreditoId = parseInt(params.id);

    if (isNaN(notaCreditoId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de nota de crédito inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('eliminar_notas_credito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la nota de crédito existe
    const existingNotaCreditoQuery = 'SELECT nota_credito_id, estado FROM nota_credito_cabecera WHERE nota_credito_id = $1';
    const existingNotaCredito = await pool.query(existingNotaCreditoQuery, [notaCreditoId]);
    
    if (existingNotaCredito.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Nota de crédito no encontrada',
        error: 'Nota de crédito no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la nota de crédito puede ser eliminada
    if (existingNotaCredito.rows[0].estado !== 'pendiente') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden eliminar notas de crédito pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar detalles primero
    await pool.query('DELETE FROM nota_credito_detalle WHERE nota_credito_id = $1', [notaCreditoId]);

    // Eliminar nota de crédito
    await pool.query('DELETE FROM nota_credito_cabecera WHERE nota_credito_id = $1', [notaCreditoId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Nota de crédito eliminada exitosamente'
    };

    // Log de auditoría
    console.log('Nota de crédito eliminada:', sanitizeForLog({
      nota_credito_id: notaCreditoId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar nota de crédito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
