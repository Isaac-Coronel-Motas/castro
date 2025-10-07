import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validatePedidoCompraData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateComprobanteNumber,
  mapEstadoForDatabase,
  mapEstadoForFrontend,
  sanitizeForLog 
} from '@/lib/utils/compras-server';
import { 
  CreatePedidoCompraRequest, 
  ComprasApiResponse, 
  ComprasPaginationParams 
} from '@/lib/types/compras';

// GET /api/compras/pedidos - Listar pedidos de compra
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_pedido';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const proveedor_id = searchParams.get('proveedor_id');
    const sucursal_id = searchParams.get('sucursal_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['pc.nro_comprobante', 'pc.comentario', 'p.nombre_proveedor'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`pc.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`pc.fecha_pedido >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`pc.fecha_pedido <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (proveedor_id) {
      paramCount++;
      additionalConditions.push(`pp.proveedor_id = $${paramCount}`);
      queryParams.push(parseInt(proveedor_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`pc.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_pedido');

    // Consulta principal
    const query = `
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
        a.nombre as almacen_nombre,
        COUNT(DISTINCT pp.proveedor_id) as total_proveedores,
        COUNT(dpc.ped_compra_det_id) as total_items,
        COALESCE(SUM(dpc.cantidad * dpc.precio_unitario), 0) as monto_total,
        COUNT(*) OVER() as total_count
      FROM pedido_compra pc
      LEFT JOIN usuarios u ON pc.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON pc.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON pc.almacen_id = a.almacen_id
      LEFT JOIN pedido_proveedor pp ON pc.pedido_compra_id = pp.pedido_compra_id
      LEFT JOIN detalle_pedido_compra dpc ON pc.pedido_compra_id = dpc.pedido_compra_id
      ${whereClause}
      GROUP BY pc.pedido_compra_id, pc.fecha_pedido, pc.estado, pc.usuario_id, 
               pc.comentario, pc.sucursal_id, pc.almacen_id, pc.nro_comprobante,
               u.nombre, s.nombre, a.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const pedidos = result.rows;
    const total = pedidos.length > 0 ? parseInt(pedidos[0].total_count) : 0;

    const response: ComprasApiResponse = {
      success: true,
      message: 'Pedidos de compra obtenidos exitosamente',
      data: pedidos.map(p => {
        const { total_count, ...pedido } = p;
        return {
          ...pedido,
          estado: mapEstadoForFrontend(pedido.estado)
        };
      }),
      pagination: {
        page,
        limit: limitParam,
        total,
        total_pages: Math.ceil(total / limitParam)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener pedidos de compra:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/compras/pedidos - Crear pedido de compra
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreatePedidoCompraRequest = await request.json();

    // Validar datos
    const validation = validatePedidoCompraData(body);
    if (!validation.valid) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
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

    // Verificar que los proveedores existen
    if (body.proveedores && body.proveedores.length > 0) {
      for (const proveedor of body.proveedores) {
        const proveedorQuery = 'SELECT proveedor_id FROM proveedores WHERE proveedor_id = $1';
        const proveedorResult = await pool.query(proveedorQuery, [proveedor.proveedor_id]);
        
        if (proveedorResult.rows.length === 0) {
          const response: ComprasApiResponse = {
            success: false,
            message: `El proveedor con ID ${proveedor.proveedor_id} no existe`,
            error: 'Proveedor inválido'
          };
          return NextResponse.json(response, { status: 400 });
        }
      }
    }

    // Verificar que los productos existen
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        const productoQuery = 'SELECT producto_id FROM productos WHERE producto_id = $1 AND estado = true';
        const productoResult = await pool.query(productoQuery, [item.producto_id]);
        
        if (productoResult.rows.length === 0) {
          const response: ComprasApiResponse = {
            success: false,
            message: `El producto con ID ${item.producto_id} no existe o está inactivo`,
            error: 'Producto inválido'
          };
          return NextResponse.json(response, { status: 400 });
        }
      }
    }

    // Crear pedido de compra
    const createPedidoQuery = `
      INSERT INTO pedido_compra (
        fecha_pedido, estado, usuario_id, comentario, sucursal_id, almacen_id, nro_comprobante
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING pedido_compra_id
    `;

    const pedidoResult = await pool.query(createPedidoQuery, [
      body.fecha_pedido || new Date().toISOString().split('T')[0],
      mapEstadoForDatabase(body.estado || 'pendiente'),
      body.usuario_id || null,
      body.comentario || null,
      body.sucursal_id || null,
      body.almacen_id || null,
      body.nro_comprobante || 'TEMP-PC' // Se actualizará después
    ]);

    const newPedidoId = pedidoResult.rows[0].pedido_compra_id;

    // Actualizar número de comprobante
    const nroComprobante = await generateComprobanteNumber('PC', newPedidoId);
    await pool.query(
      'UPDATE pedido_compra SET nro_comprobante = $1 WHERE pedido_compra_id = $2',
      [nroComprobante, newPedidoId]
    );

    // Crear pedidos a proveedores
    if (body.proveedores && body.proveedores.length > 0) {
      for (const proveedor of body.proveedores) {
        await pool.query(
          'INSERT INTO pedido_proveedor (pedido_compra_id, proveedor_id, fecha_envio, usuario_id) VALUES ($1, $2, $3, $4)',
          [
            newPedidoId,
            proveedor.proveedor_id,
            proveedor.fecha_envio || new Date().toISOString(),
            body.usuario_id || null
          ]
        );
      }
    }

    // Crear detalles del pedido
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO detalle_pedido_compra (pedido_compra_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [newPedidoId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }
    }

    // Obtener el pedido creado con información completa
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
        a.nombre as almacen_nombre,
        COUNT(DISTINCT pp.proveedor_id) as total_proveedores,
        COUNT(dpc.ped_compra_det_id) as total_items,
        COALESCE(SUM(dpc.cantidad * dpc.precio_unitario), 0) as monto_total
      FROM pedido_compra pc
      LEFT JOIN usuarios u ON pc.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON pc.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON pc.almacen_id = a.almacen_id
      LEFT JOIN pedido_proveedor pp ON pc.pedido_compra_id = pp.pedido_compra_id
      LEFT JOIN detalle_pedido_compra dpc ON pc.pedido_compra_id = dpc.pedido_compra_id
      WHERE pc.pedido_compra_id = $1
      GROUP BY pc.pedido_compra_id, pc.fecha_pedido, pc.estado, pc.usuario_id, 
               pc.comentario, pc.sucursal_id, pc.almacen_id, pc.nro_comprobante,
               u.nombre, s.nombre, a.nombre
    `;

    const pedidoData = await pool.query(getPedidoQuery, [newPedidoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Pedido de compra creado exitosamente',
      data: {
        ...pedidoData.rows[0],
        estado: mapEstadoForFrontend(pedidoData.rows[0].estado)
      }
    };

    // Log de auditoría
    console.log('Pedido de compra creado:', sanitizeForLog({
      pedido_compra_id: newPedidoId,
      nro_comprobante: nroComprobante,
      estado: body.estado || 'pendiente',
      total_proveedores: body.proveedores?.length || 0,
      total_items: body.items?.length || 0,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear pedido de compra:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
