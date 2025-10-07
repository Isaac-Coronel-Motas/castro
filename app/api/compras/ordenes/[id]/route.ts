import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateOrdenCompraData
} from '@/lib/utils/compras';
import { 
  mapEstadoForDatabase,
  mapEstadoForFrontend,
  sanitizeForLog 
} from '@/lib/utils/compras-server';
import { 
  UpdateOrdenCompraRequest, 
  ComprasApiResponse 
} from '@/lib/types/compras';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const authResult = await requirePermission(request, 'compras.leer');
    if (!authResult.success) {
      return createAuthzErrorResponse();
    }

    const ordenId = parseInt(params.id);
    if (isNaN(ordenId) || ordenId <= 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de orden inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Query para obtener orden con información completa
    const ordenQuery = `
      SELECT 
        oc.orden_compra_id,
        oc.proveedor_id,
        oc.usuario_id,
        oc.presu_prov_id,
        oc.fecha_orden,
        oc.estado,
        oc.monto_oc,
        oc.observaciones,
        oc.almacen_id,
        oc.nro_comprobante,
        p.nombre_proveedor as proveedor_nombre,
        u.nombre as usuario_nombre,
        a.nombre as almacen_nombre,
        pp.nro_comprobante as presupuesto_nro
      FROM ordenes_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON oc.usuario_id = u.usuario_id
      LEFT JOIN almacenes a ON oc.almacen_id = a.almacen_id
      LEFT JOIN presupuesto_proveedor pp ON oc.presu_prov_id = pp.presu_prov_id
      WHERE oc.orden_compra_id = $1
    `;

    const ordenResult = await pool.query(ordenQuery, [ordenId]);

    if (ordenResult.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Orden de compra no encontrada',
        error: 'No encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const orden = ordenResult.rows[0];

    // Query para obtener detalles de la orden
    const detallesQuery = `
      SELECT 
        doc.orden_compra_detalle_id,
        doc.orden_compra_id,
        doc.producto_id,
        doc.cantidad,
        doc.precio_unitario,
        p.nombre_producto,
        p.cod_product,
        p.descripcion_producto,
        (doc.cantidad * doc.precio_unitario) as subtotal
      FROM orden_compra_detalle doc
      LEFT JOIN productos p ON doc.producto_id = p.producto_id
      WHERE doc.orden_compra_id = $1
      ORDER BY doc.orden_compra_detalle_id
    `;

    const detallesResult = await pool.query(detallesQuery, [ordenId]);
    const detalles = detallesResult.rows;

    const response: ComprasApiResponse = {
      success: true,
      message: 'Orden de compra obtenida exitosamente',
      data: {
        ...orden,
        estado: mapEstadoForFrontend(orden.estado),
        detalles: detalles
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error obteniendo orden de compra:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

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

    const ordenId = parseInt(params.id);
    if (isNaN(ordenId) || ordenId <= 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de orden inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: UpdateOrdenCompraRequest = await request.json();

    // Validar datos
    const validation = validateOrdenCompraData(body);
    if (!validation.valid) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la orden existe
    const existingOrdenQuery = 'SELECT orden_compra_id FROM ordenes_compra WHERE orden_compra_id = $1';
    const existingOrden = await pool.query(existingOrdenQuery, [ordenId]);

    if (existingOrden.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Orden de compra no encontrada',
        error: 'No encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Actualizar orden
    const updateQuery = `
      UPDATE ordenes_compra SET
        proveedor_id = $1,
        usuario_id = $2,
        presu_prov_id = $3,
        fecha_orden = $4,
        estado = $5,
        monto_oc = $6,
        observaciones = $7,
        almacen_id = $8
      WHERE orden_compra_id = $9
      RETURNING orden_compra_id
    `;

    await pool.query(updateQuery, [
      body.proveedor_id,
      body.usuario_id,
      body.presu_prov_id || null,
      body.fecha_orden || new Date().toISOString().split('T')[0],
      mapEstadoForDatabase(body.estado || 'pendiente'),
      body.monto_oc || 0,
      body.observaciones || null,
      body.almacen_id || null,
      ordenId
    ]);

    // Actualizar detalles si se proporcionan
    if (body.items && body.items.length > 0) {
      // Eliminar detalles existentes
      await pool.query('DELETE FROM orden_compra_detalle WHERE orden_compra_id = $1', [ordenId]);

      // Insertar nuevos detalles
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO orden_compra_detalle (orden_compra_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [ordenId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }
    }

    // Obtener orden actualizada
    const getOrdenQuery = `
      SELECT 
        oc.orden_compra_id,
        oc.proveedor_id,
        oc.usuario_id,
        oc.presu_prov_id,
        oc.fecha_orden,
        oc.estado,
        oc.monto_oc,
        oc.observaciones,
        oc.almacen_id,
        oc.nro_comprobante,
        p.nombre_proveedor as proveedor_nombre,
        u.nombre as usuario_nombre,
        a.nombre as almacen_nombre
      FROM ordenes_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON oc.usuario_id = u.usuario_id
      LEFT JOIN almacenes a ON oc.almacen_id = a.almacen_id
      WHERE oc.orden_compra_id = $1
    `;

    const ordenData = await pool.query(getOrdenQuery, [ordenId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Orden de compra actualizada exitosamente',
      data: {
        ...ordenData.rows[0],
        estado: mapEstadoForFrontend(ordenData.rows[0].estado)
      }
    };

    // Log de auditoría
    console.log('Orden de compra actualizada:', sanitizeForLog({
      orden_compra_id: ordenId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error actualizando orden de compra:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

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

    const ordenId = parseInt(params.id);
    if (isNaN(ordenId) || ordenId <= 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de orden inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la orden existe
    const existingOrdenQuery = 'SELECT orden_compra_id, nro_comprobante FROM ordenes_compra WHERE orden_compra_id = $1';
    const existingOrden = await pool.query(existingOrdenQuery, [ordenId]);

    if (existingOrden.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Orden de compra no encontrada',
        error: 'No encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Eliminar orden (los detalles se eliminan automáticamente por CASCADE)
    await pool.query('DELETE FROM ordenes_compra WHERE orden_compra_id = $1', [ordenId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Orden de compra eliminada exitosamente'
    };

    // Log de auditoría
    console.log('Orden de compra eliminada:', sanitizeForLog({
      orden_compra_id: ordenId,
      nro_comprobante: existingOrden.rows[0].nro_comprobante,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error eliminando orden de compra:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
