import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaRemisionData,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  UpdateNotaRemisionRequest,
  VentasApiResponse 
} from '@/lib/types/ventas';

// GET /api/ventas/notas-remision/[id] - Obtener nota de remisión específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const remisionId = parseInt(params.id);

    if (isNaN(remisionId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de remisión inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('leer_notas_remision')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener la remisión con detalles
    const query = `
      SELECT 
        nr.remision_id,
        nr.fecha_remision,
        nr.usuario_id,
        nr.origen_almacen_id,
        nr.destino_sucursal_id,
        nr.destino_almacen_id,
        nr.tipo_remision,
        nr.referencia_id,
        nr.estado,
        nr.observaciones,
        u.nombre as usuario_nombre,
        oa.nombre as origen_almacen_nombre,
        ds.nombre as destino_sucursal_nombre,
        da.nombre as destino_almacen_nombre,
        (
          SELECT json_agg(
            json_build_object(
              'detalle_id', nrd.detalle_id,
              'producto_id', nrd.producto_id,
              'cantidad', nrd.cantidad,
              'producto_nombre', p.nombre,
              'producto_codigo', p.codigo
            )
          )
          FROM nota_remision_detalle nrd
          LEFT JOIN productos p ON nrd.producto_id = p.producto_id
          WHERE nrd.remision_id = nr.remision_id
        ) as productos
      FROM nota_remision nr
      LEFT JOIN usuarios u ON nr.usuario_id = u.usuario_id
      LEFT JOIN almacenes oa ON nr.origen_almacen_id = oa.almacen_id
      LEFT JOIN sucursales ds ON nr.destino_sucursal_id = ds.sucursal_id
      LEFT JOIN almacenes da ON nr.destino_almacen_id = da.almacen_id
      WHERE nr.remision_id = $1
    `;

    const result = await pool.query(query, [remisionId]);

    if (result.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Remisión no encontrada',
        error: 'Remisión no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: VentasApiResponse = {
      success: true,
      message: 'Remisión obtenida exitosamente',
      data: result.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener remisión:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/notas-remision/[id] - Actualizar nota de remisión
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const remisionId = parseInt(params.id);

    if (isNaN(remisionId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de remisión inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('modificar_notas_remision')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateNotaRemisionRequest = await request.json();

    // Validar datos
    const validation = validateNotaRemisionData(body);
    if (!validation.valid) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la remisión existe
    const existingRemisionQuery = 'SELECT remision_id, estado FROM nota_remision WHERE remision_id = $1';
    const existingRemision = await pool.query(existingRemisionQuery, [remisionId]);
    
    if (existingRemision.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Remisión no encontrada',
        error: 'Remisión no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la remisión puede ser modificada
    if (existingRemision.rows[0].estado !== 'pendiente') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden modificar remisiones pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Actualizar remisión
    const updateRemisionQuery = `
      UPDATE nota_remision SET
        fecha_remision = $1,
        usuario_id = $2,
        origen_almacen_id = $3,
        destino_sucursal_id = $4,
        destino_almacen_id = $5,
        tipo_remision = $6,
        referencia_id = $7,
        estado = $8,
        observaciones = $9
      WHERE remision_id = $10
    `;

    await pool.query(updateRemisionQuery, [
      body.fecha_remision,
      body.usuario_id,
      body.origen_almacen_id,
      body.destino_sucursal_id || null,
      body.destino_almacen_id || null,
      body.tipo_remision,
      body.referencia_id || null,
      body.estado || 'pendiente',
      body.observaciones || null,
      remisionId
    ]);

    // Actualizar detalles si se proporcionan
    if (body.productos && body.productos.length > 0) {
      // Eliminar detalles existentes
      await pool.query('DELETE FROM nota_remision_detalle WHERE remision_id = $1', [remisionId]);

      // Crear nuevos detalles
      for (const producto of body.productos) {
        await pool.query(
          'INSERT INTO nota_remision_detalle (remision_id, producto_id, cantidad) VALUES ($1, $2, $3)',
          [remisionId, producto.producto_id, producto.cantidad]
        );
      }
    }

    const response: VentasApiResponse = {
      success: true,
      message: 'Remisión actualizada exitosamente'
    };

    // Log de auditoría
    console.log('Remisión actualizada:', sanitizeForLog({
      remision_id: remisionId,
      usuario_id: body.usuario_id,
      origen_almacen_id: body.origen_almacen_id,
      destino_sucursal_id: body.destino_sucursal_id,
      destino_almacen_id: body.destino_almacen_id,
      tipo_remision: body.tipo_remision,
      estado: body.estado || 'pendiente',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar remisión:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/ventas/notas-remision/[id] - Eliminar nota de remisión
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const remisionId = parseInt(params.id);

    if (isNaN(remisionId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de remisión inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('eliminar_notas_remision')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la remisión existe
    const existingRemisionQuery = 'SELECT remision_id, estado FROM nota_remision WHERE remision_id = $1';
    const existingRemision = await pool.query(existingRemisionQuery, [remisionId]);
    
    if (existingRemision.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Remisión no encontrada',
        error: 'Remisión no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la remisión puede ser eliminada
    if (existingRemision.rows[0].estado !== 'pendiente') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden eliminar remisiones pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar detalles primero
    await pool.query('DELETE FROM nota_remision_detalle WHERE remision_id = $1', [remisionId]);

    // Eliminar remisión
    await pool.query('DELETE FROM nota_remision WHERE remision_id = $1', [remisionId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Remisión eliminada exitosamente'
    };

    // Log de auditoría
    console.log('Remisión eliminada:', sanitizeForLog({
      remision_id: remisionId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar remisión:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
