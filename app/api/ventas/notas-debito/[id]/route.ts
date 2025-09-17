import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaDebitoVentaData,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  UpdateNotaDebitoVentaRequest,
  VentasApiResponse 
} from '@/lib/types/ventas';

// GET /api/ventas/notas-debito/[id] - Obtener nota de débito específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notaDebitoId = parseInt(params.id);

    if (isNaN(notaDebitoId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de nota de débito inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('leer_notas_debito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener la nota de débito con detalles
    const query = `
      SELECT 
        nd.nota_debito_id,
        nd.fecha_nota,
        nd.cliente_id,
        nd.usuario_id,
        nd.tipo_documento,
        nd.nro_documento,
        nd.nro_nota,
        nd.timbrado,
        nd.estado,
        nd.observaciones,
        nd.total_gravado,
        nd.total_iva,
        nd.total_exento,
        nd.total_nota,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        (
          SELECT json_agg(
            json_build_object(
              'detalle_id', ndd.detalle_id,
              'producto_id', ndd.producto_id,
              'cantidad', ndd.cantidad,
              'precio_unitario', ndd.precio_unitario,
              'descuento', ndd.descuento,
              'subtotal', ndd.subtotal,
              'gravado', ndd.gravado,
              'exento', ndd.exento,
              'iva', ndd.iva,
              'producto_nombre', p.nombre,
              'producto_codigo', p.codigo
            )
          )
          FROM nota_debito_detalle ndd
          LEFT JOIN productos p ON ndd.producto_id = p.producto_id
          WHERE ndd.nota_debito_id = nd.nota_debito_id
        ) as detalles
      FROM nota_debito_cabecera nd
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
      WHERE nd.nota_debito_id = $1
    `;

    const result = await pool.query(query, [notaDebitoId]);

    if (result.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Nota de débito no encontrada',
        error: 'Nota de débito no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: VentasApiResponse = {
      success: true,
      message: 'Nota de débito obtenida exitosamente',
      data: result.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener nota de débito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/notas-debito/[id] - Actualizar nota de débito
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notaDebitoId = parseInt(params.id);

    if (isNaN(notaDebitoId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de nota de débito inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('modificar_notas_debito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateNotaDebitoVentaRequest = await request.json();

    // Validar datos
    const validation = validateNotaDebitoVentaData(body);
    if (!validation.valid) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la nota de débito existe
    const existingNotaDebitoQuery = 'SELECT nota_debito_id, estado FROM nota_debito_cabecera WHERE nota_debito_id = $1';
    const existingNotaDebito = await pool.query(existingNotaDebitoQuery, [notaDebitoId]);
    
    if (existingNotaDebito.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Nota de débito no encontrada',
        error: 'Nota de débito no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la nota de débito puede ser modificada
    if (existingNotaDebito.rows[0].estado !== 'pendiente') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden modificar notas de débito pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Actualizar nota de débito
    const updateNotaDebitoQuery = `
      UPDATE nota_debito_cabecera SET
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
      WHERE nota_debito_id = $14
    `;

    await pool.query(updateNotaDebitoQuery, [
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
      notaDebitoId
    ]);

    // Actualizar detalles si se proporcionan
    if (body.detalles && body.detalles.length > 0) {
      // Eliminar detalles existentes
      await pool.query('DELETE FROM nota_debito_detalle WHERE nota_debito_id = $1', [notaDebitoId]);

      // Crear nuevos detalles
      for (const detalle of body.detalles) {
        await pool.query(
          `INSERT INTO nota_debito_detalle (
            nota_debito_id, producto_id, cantidad, precio_unitario, 
            descuento, subtotal, gravado, exento, iva
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            notaDebitoId,
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
      message: 'Nota de débito actualizada exitosamente'
    };

    // Log de auditoría
    console.log('Nota de débito actualizada:', sanitizeForLog({
      nota_debito_id: notaDebitoId,
      cliente_id: body.cliente_id,
      usuario_id: body.usuario_id,
      tipo_documento: body.tipo_documento,
      total_nota: body.total_nota || 0,
      estado: body.estado || 'pendiente',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar nota de débito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/ventas/notas-debito/[id] - Eliminar nota de débito
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notaDebitoId = parseInt(params.id);

    if (isNaN(notaDebitoId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de nota de débito inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('eliminar_notas_debito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la nota de débito existe
    const existingNotaDebitoQuery = 'SELECT nota_debito_id, estado FROM nota_debito_cabecera WHERE nota_debito_id = $1';
    const existingNotaDebito = await pool.query(existingNotaDebitoQuery, [notaDebitoId]);
    
    if (existingNotaDebito.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Nota de débito no encontrada',
        error: 'Nota de débito no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la nota de débito puede ser eliminada
    if (existingNotaDebito.rows[0].estado !== 'pendiente') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden eliminar notas de débito pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar detalles primero
    await pool.query('DELETE FROM nota_debito_detalle WHERE nota_debito_id = $1', [notaDebitoId]);

    // Eliminar nota de débito
    await pool.query('DELETE FROM nota_debito_cabecera WHERE nota_debito_id = $1', [notaDebitoId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Nota de débito eliminada exitosamente'
    };

    // Log de auditoría
    console.log('Nota de débito eliminada:', sanitizeForLog({
      nota_debito_id: notaDebitoId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar nota de débito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
