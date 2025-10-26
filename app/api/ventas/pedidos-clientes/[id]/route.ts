import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth';

interface VentasApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface UpdatePedidoRequest {
  cliente_id?: number;
  fecha_venta?: string;
  estado?: string;
  tipo_documento?: string;
  monto_venta?: number;
  observaciones?: string;
  productos?: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}

// GET /api/ventas/pedidos-clientes/[id] - Obtener pedido específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const ventaId = parseInt(params.id);

    if (isNaN(ventaId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de pedido inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Consulta principal del pedido
    const pedidoQuery = `
      SELECT 
        v.venta_id,
        v.cliente_id,
        v.fecha_venta,
        v.estado,
        v.tipo_documento,
        v.monto_venta,
        v.caja_id,
        v.tipo_doc_id,
        v.nro_factura,
        v.forma_cobro_id,
        v.monto_gravada_5,
        v.monto_gravada_10,
        v.monto_exenta,
        v.monto_iva,
        v.condicion_pago,
        c.nombre as cliente_nombre,
        c.direccion as cliente_direccion,
        c.ruc as cliente_ruc,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        CASE 
          WHEN v.estado = 'abierto' THEN 'Abierto'
          WHEN v.estado = 'cerrado' THEN 'Cerrado'
          WHEN v.estado = 'cancelado' THEN 'Cancelado'
          ELSE v.estado::text
        END as estado_display
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      WHERE v.venta_id = $1
    `;

    const pedidoResult = await pool.query(pedidoQuery, [ventaId]);

    if (pedidoResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Pedido no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Consulta de productos del pedido
    const productosQuery = `
      SELECT 
        vd.detalle_venta_id,
        vd.producto_id,
        vd.cantidad,
        vd.precio_unitario,
        p.nombre_producto as producto_nombre,
        p.descripcion_producto as producto_descripcion,
        p.cod_product as producto_codigo,
        (vd.cantidad * vd.precio_unitario) as subtotal
      FROM ventas_detalle vd
      LEFT JOIN productos p ON vd.producto_id = p.producto_id
      WHERE vd.venta_id = $1
      ORDER BY vd.detalle_venta_id
    `;

    const productosResult = await pool.query(productosQuery, [ventaId]);

    const pedido = pedidoResult.rows[0];
    pedido.productos = productosResult.rows;

    const response: VentasApiResponse = {
      success: true,
      message: 'Pedido obtenido exitosamente',
      data: pedido
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/pedidos-clientes/[id] - Actualizar pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const ventaId = parseInt(params.id);

    if (isNaN(ventaId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de pedido inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: UpdatePedidoRequest = await request.json();

    // Verificar que el pedido existe
    const checkQuery = 'SELECT venta_id, estado FROM ventas WHERE venta_id = $1';
    const checkResult = await pool.query(checkQuery, [ventaId]);

    if (checkResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Pedido no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const currentPedido = checkResult.rows[0];

    // No permitir editar pedidos cerrados o cancelados
    if (currentPedido.estado === 'cerrado' || currentPedido.estado === 'cancelado') {
      const response: VentasApiResponse = {
        success: false,
        message: 'No se puede editar un pedido cerrado o cancelado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar datos básicos del pedido
    const updateFields: string[] = [];
    const updateParams: any[] = [];
    let paramCount = 0;

    if (body.cliente_id !== undefined) {
      paramCount++;
      updateFields.push(`cliente_id = $${paramCount}`);
      updateParams.push(body.cliente_id);
    }

    if (body.fecha_venta !== undefined) {
      paramCount++;
      updateFields.push(`fecha_venta = $${paramCount}`);
      updateParams.push(body.fecha_venta);
    }

    if (body.estado !== undefined) {
      paramCount++;
      updateFields.push(`estado = $${paramCount}`);
      updateParams.push(body.estado);
    }

    if (body.tipo_documento !== undefined) {
      paramCount++;
      updateFields.push(`tipo_documento = $${paramCount}`);
      updateParams.push(body.tipo_documento);
    }

    if (body.monto_venta !== undefined) {
      paramCount++;
      updateFields.push(`monto_venta = $${paramCount}`);
      updateParams.push(body.monto_venta);
    }

    if (updateFields.length > 0) {
      paramCount++;
      updateParams.push(ventaId);

      const updateQuery = `
        UPDATE ventas 
        SET ${updateFields.join(', ')}
        WHERE venta_id = $${paramCount}
      `;

      await pool.query(updateQuery, updateParams);
    }

    // Actualizar productos si se proporcionan
    if (body.productos && body.productos.length > 0) {
      // Eliminar productos existentes
      await pool.query('DELETE FROM ventas_detalle WHERE venta_id = $1', [ventaId]);

      // Insertar nuevos productos
      for (const producto of body.productos) {
        const detalleQuery = `
          INSERT INTO ventas_detalle (
            venta_id,
            producto_id,
            cantidad,
            precio_unitario
          ) VALUES ($1, $2, $3, $4)
        `;

        await pool.query(detalleQuery, [
          ventaId,
          producto.producto_id,
          producto.cantidad,
          producto.precio_unitario
        ]);
      }

      // Recalcular monto total
      const montoTotal = body.productos.reduce((total, producto) => {
        return total + (producto.cantidad * producto.precio_unitario);
      }, 0);

      await pool.query(
        'UPDATE ventas SET monto_venta = $1 WHERE venta_id = $2',
        [montoTotal, ventaId]
      );
    }

    const response: VentasApiResponse = {
      success: true,
      message: 'Pedido actualizado exitosamente',
      data: { venta_id: ventaId }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/ventas/pedidos-clientes/[id] - Eliminar pedido
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const ventaId = parseInt(params.id);

    if (isNaN(ventaId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de pedido inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el pedido existe
    const checkQuery = 'SELECT venta_id, estado FROM ventas WHERE venta_id = $1';
    const checkResult = await pool.query(checkQuery, [ventaId]);

    if (checkResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Pedido no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const currentPedido = checkResult.rows[0];

    // No permitir eliminar pedidos cerrados
    if (currentPedido.estado === 'cerrado') {
      const response: VentasApiResponse = {
        success: false,
        message: 'No se puede eliminar un pedido cerrado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Eliminar detalles primero (por restricciones de clave foránea)
    await pool.query('DELETE FROM ventas_detalle WHERE venta_id = $1', [ventaId]);

    // Eliminar el pedido
    await pool.query('DELETE FROM ventas WHERE venta_id = $1', [ventaId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Pedido eliminado exitosamente'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
