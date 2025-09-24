import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validatePedidoCompraData, 
  canProcessPedido,
  sanitizeForLog 
} from '@/lib/utils/compras';
import { 
  UpdatePedidoCompraRequest, 
  ComprasApiResponse 
} from '@/lib/types/compras';

// GET /api/compras/pedidos/[id] - Obtener pedido de compra por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pedidoId = parseInt(params.id);

    if (isNaN(pedidoId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de pedido inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener pedido con información completa
    const pedidoQuery = `
      SELECT 
        pc.pedido_compra_id,
        pc.fecha_pedido,
        pc.estado,
        pc.usuario_id,
        pc.comentario,
        pc.sucursal_id,
        pc.almacen_id,
        pc.nro_comprobante,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre
      FROM pedido_compra pc
      LEFT JOIN usuarios u ON pc.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON pc.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON pc.almacen_id = a.almacen_id
      WHERE pc.pedido_compra_id = $1
    `;

    const pedidoResult = await pool.query(pedidoQuery, [pedidoId]);
    
    if (pedidoResult.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Pedido de compra no encontrado',
        error: 'Pedido no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Obtener proveedores asociados
    const proveedoresQuery = `
      SELECT 
        pp.pedido_prov_id,
        pp.pedido_compra_id,
        pp.proveedor_id,
        pp.fecha_envio,
        pp.usuario_id,
        p.nombre_proveedor as proveedor_nombre,
        u.nombre as usuario_nombre
      FROM pedido_proveedor pp
      LEFT JOIN proveedores p ON pp.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON pp.usuario_id = u.usuario_id
      WHERE pp.pedido_compra_id = $1
    `;

    const proveedoresResult = await pool.query(proveedoresQuery, [pedidoId]);

    // Obtener items del pedido
    const itemsQuery = `
      SELECT 
        dpc.ped_compra_det_id,
        dpc.pedido_compra_id,
        dpc.producto_id,
        dpc.cantidad,
        dpc.precio_unitario,
        p.nombre_producto as producto_nombre,
        p.cod_product as producto_codigo,
        (dpc.cantidad * dpc.precio_unitario) as subtotal
      FROM detalle_pedido_compra dpc
      LEFT JOIN productos p ON dpc.producto_id = p.producto_id
      WHERE dpc.pedido_compra_id = $1
    `;

    const itemsResult = await pool.query(itemsQuery, [pedidoId]);

    // Calcular totales
    const totalItems = itemsResult.rows.length;
    const montoTotal = itemsResult.rows.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);

    const pedido = {
      ...pedidoResult.rows[0],
      proveedores: proveedoresResult.rows,
      items: itemsResult.rows,
      total_items: totalItems,
      monto_total: montoTotal
    };

    const response: ComprasApiResponse = {
      success: true,
      message: 'Pedido de compra obtenido exitosamente',
      data: pedido
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener pedido de compra:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/compras/pedidos/[id] - Actualizar pedido de compra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pedidoId = parseInt(params.id);

    if (isNaN(pedidoId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de pedido inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdatePedidoCompraRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
      const validation = validatePedidoCompraData(body as any);
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

    // Verificar que el pedido existe
    const existingPedidoQuery = 'SELECT pedido_compra_id, estado FROM pedido_compra WHERE pedido_compra_id = $1';
    const existingPedido = await pool.query(existingPedidoQuery, [pedidoId]);
    
    if (existingPedido.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Pedido de compra no encontrado',
        error: 'Pedido no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el pedido puede ser modificado
    if (body.estado && !canProcessPedido(existingPedido.rows[0].estado)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No se puede modificar un pedido que ya ha sido procesado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Verificar que la sucursal existe si se proporciona
    if (body.sucursal_id) {
      const sucursalQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
      const sucursalResult = await pool.query(sucursalQuery, [body.sucursal_id]);
      
      if (sucursalResult.rows.length === 0) {
        const response: ComprasApiResponse = {
          success: false,
          message: 'La sucursal especificada no existe',
          error: 'Sucursal inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el almacén existe si se proporciona
    if (body.almacen_id) {
      const almacenQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
      const almacenResult = await pool.query(almacenQuery, [body.almacen_id]);
      
      if (almacenResult.rows.length === 0) {
        const response: ComprasApiResponse = {
          success: false,
          message: 'El almacén especificado no existe',
          error: 'Almacén inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.fecha_pedido !== undefined) {
      paramCount++;
      updateFields.push(`fecha_pedido = $${paramCount}`);
      updateValues.push(body.fecha_pedido);
    }

    if (body.estado !== undefined) {
      paramCount++;
      updateFields.push(`estado = $${paramCount}`);
      updateValues.push(body.estado);
    }

    if (body.comentario !== undefined) {
      paramCount++;
      updateFields.push(`comentario = $${paramCount}`);
      updateValues.push(body.comentario);
    }

    if (body.sucursal_id !== undefined) {
      paramCount++;
      updateFields.push(`sucursal_id = $${paramCount}`);
      updateValues.push(body.sucursal_id);
    }

    if (body.almacen_id !== undefined) {
      paramCount++;
      updateFields.push(`almacen_id = $${paramCount}`);
      updateValues.push(body.almacen_id);
    }

    if (body.nro_comprobante !== undefined) {
      paramCount++;
      updateFields.push(`nro_comprobante = $${paramCount}`);
      updateValues.push(body.nro_comprobante);
    }

    if (updateFields.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar pedido
    paramCount++;
    updateValues.push(pedidoId);

    const updateQuery = `
      UPDATE pedido_compra 
      SET ${updateFields.join(', ')}
      WHERE pedido_compra_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Actualizar proveedores si se proporcionan
    if (body.proveedores) {
      // Eliminar proveedores existentes
      await pool.query('DELETE FROM pedido_proveedor WHERE pedido_compra_id = $1', [pedidoId]);
      
      // Insertar nuevos proveedores
      for (const proveedor of body.proveedores) {
        await pool.query(
          'INSERT INTO pedido_proveedor (pedido_compra_id, proveedor_id, fecha_envio, usuario_id) VALUES ($1, $2, $3, $4)',
          [
            pedidoId,
            proveedor.proveedor_id,
            proveedor.fecha_envio || new Date().toISOString(),
            body.usuario_id || null
          ]
        );
      }
    }

    // Actualizar items si se proporcionan
    if (body.items) {
      // Eliminar items existentes
      await pool.query('DELETE FROM detalle_pedido_compra WHERE pedido_compra_id = $1', [pedidoId]);
      
      // Insertar nuevos items
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO detalle_pedido_compra (pedido_compra_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [pedidoId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }
    }

    // Obtener pedido actualizado
    const getPedidoQuery = `
      SELECT 
        pc.pedido_compra_id,
        pc.fecha_pedido,
        pc.estado,
        pc.usuario_id,
        pc.comentario,
        pc.sucursal_id,
        pc.almacen_id,
        pc.nro_comprobante,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre
      FROM pedido_compra pc
      LEFT JOIN usuarios u ON pc.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON pc.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON pc.almacen_id = a.almacen_id
      WHERE pc.pedido_compra_id = $1
    `;

    const pedidoData = await pool.query(getPedidoQuery, [pedidoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Pedido de compra actualizado exitosamente',
      data: pedidoData.rows[0]
    };

    // Log de auditoría
    console.log('Pedido de compra actualizado:', sanitizeForLog({
      pedido_compra_id: pedidoId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar pedido de compra:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/compras/pedidos/[id] - Eliminar pedido de compra
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pedidoId = parseInt(params.id);

    if (isNaN(pedidoId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de pedido inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el pedido existe
    const existingPedidoQuery = 'SELECT pedido_compra_id, estado, nro_comprobante FROM pedido_compra WHERE pedido_compra_id = $1';
    const existingPedido = await pool.query(existingPedidoQuery, [pedidoId]);
    
    if (existingPedido.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Pedido de compra no encontrado',
        error: 'Pedido no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el pedido puede ser eliminado
    if (!canProcessPedido(existingPedido.rows[0].estado)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No se puede eliminar un pedido que ya ha sido procesado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar en cascada: detalles, proveedores, y finalmente el pedido
    await pool.query('DELETE FROM detalle_pedido_compra WHERE pedido_compra_id = $1', [pedidoId]);
    await pool.query('DELETE FROM pedido_proveedor WHERE pedido_compra_id = $1', [pedidoId]);
    await pool.query('DELETE FROM pedido_compra WHERE pedido_compra_id = $1', [pedidoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Pedido de compra eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Pedido de compra eliminado:', sanitizeForLog({
      pedido_compra_id: pedidoId,
      nro_comprobante: existingPedido.rows[0].nro_comprobante,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar pedido de compra:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
