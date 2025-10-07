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
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateComprobanteNumber,
  generateTrackingNumber,
  sanitizeForLog 
} from '@/lib/utils/compras-server';
import { 
  calculateProgress,
  calculateDaysRemaining,
  determinePriority 
} from '@/lib/utils/compras-client';
import { 
  CreateOrdenCompraRequest, 
  ComprasApiResponse, 
  ComprasPaginationParams 
} from '@/lib/types/compras';

// GET /api/compras/ordenes - Listar órdenes de compra
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_orden';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const proveedor_id = searchParams.get('proveedor_id');
    const almacen_id = searchParams.get('almacen_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['oc.nro_comprobante', 'oc.observaciones', 'p.nombre_proveedor'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`oc.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`oc.fecha_orden >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`oc.fecha_orden <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (proveedor_id) {
      paramCount++;
      additionalConditions.push(`oc.proveedor_id = $${paramCount}`);
      queryParams.push(parseInt(proveedor_id));
    }

    if (almacen_id) {
      paramCount++;
      additionalConditions.push(`oc.almacen_id = $${paramCount}`);
      queryParams.push(parseInt(almacen_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_orden');

    // Consulta principal
    const query = `
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
        COUNT(doc.orden_compra_detalle_id) as total_items,
        COALESCE(SUM(doc.cantidad * doc.precio_unitario), 0) as monto_total,
        CONCAT('TRK-', LPAD(oc.orden_compra_id::text, 3, '0'), '-', EXTRACT(YEAR FROM oc.fecha_orden)) as tracking,
        CASE 
          WHEN oc.estado = 'pendiente' THEN 'Pendiente'
          WHEN oc.estado = 'aprobada' THEN 'Aprobada'
          WHEN oc.estado = 'rechazada' THEN 'Rechazada'
          WHEN oc.estado = 'cancelada' THEN 'Cancelada'
        END as estado_display,
        CASE 
          WHEN oc.estado = 'pendiente' THEN 'Pendiente'
          WHEN oc.estado = 'aprobada' THEN 'Enviada'
          WHEN oc.estado = 'rechazada' THEN 'Rechazada'
          WHEN oc.estado = 'cancelada' THEN 'Cancelada'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM ordenes_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON oc.usuario_id = u.usuario_id
      LEFT JOIN almacenes a ON oc.almacen_id = a.almacen_id
      LEFT JOIN orden_compra_detalle doc ON oc.orden_compra_id = doc.orden_compra_id
      ${whereClause}
      GROUP BY oc.orden_compra_id, oc.proveedor_id, oc.usuario_id, oc.presu_prov_id, 
               oc.fecha_orden, oc.estado, oc.monto_oc, oc.observaciones, oc.almacen_id, 
               oc.nro_comprobante, p.nombre_proveedor, u.nombre, a.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const ordenes = result.rows;
    const total = ordenes.length > 0 ? parseInt(ordenes[0].total_count) : 0;

    // Agregar información de progreso y prioridad
    const ordenesConProgreso = ordenes.map(orden => {
      const { total_count, ...ordenData } = orden;
      
      // Simular fecha de entrega (7 días después de la orden)
      const fechaEntrega = new Date(orden.fecha_orden);
      fechaEntrega.setDate(fechaEntrega.getDate() + 7);
      
      const progreso = calculateProgress(orden.fecha_orden, fechaEntrega.toISOString().split('T')[0]);
      const diasRestantes = calculateDaysRemaining(fechaEntrega.toISOString().split('T')[0]);
      const prioridad = determinePriority(diasRestantes);
      
      return {
        ...ordenData,
        fecha_entrega: fechaEntrega.toISOString().split('T')[0],
        progreso,
        dias_restantes: diasRestantes,
        prioridad,
        estado_vencimiento: diasRestantes < 0 ? 'vencida' : diasRestantes <= 3 ? 'por_vencer' : 'vigente'
      };
    });

    const response: ComprasApiResponse = {
      success: true,
      message: 'Órdenes de compra obtenidas exitosamente',
      data: ordenesConProgreso,
      pagination: {
        page,
        limit: limitParam,
        total,
        total_pages: Math.ceil(total / limitParam)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener órdenes de compra:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/compras/ordenes - Crear orden de compra
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateOrdenCompraRequest = await request.json();

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

    // Verificar que el proveedor existe
    const proveedorQuery = 'SELECT proveedor_id FROM proveedores WHERE proveedor_id = $1';
    const proveedorResult = await pool.query(proveedorQuery, [body.proveedor_id]);
    
    if (proveedorResult.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'El proveedor especificado no existe',
        error: 'Proveedor inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el presupuesto existe si se proporciona
    if (body.presu_prov_id) {
      const presupuestoQuery = 'SELECT presu_prov_id FROM presupuesto_proveedor WHERE presu_prov_id = $1';
      const presupuestoResult = await pool.query(presupuestoQuery, [body.presu_prov_id]);
      
      if (presupuestoResult.rows.length === 0) {
        const response: ComprasApiResponse = {
          success: false,
          message: 'El presupuesto especificado no existe',
          error: 'Presupuesto inválido'
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

    // Crear orden de compra
    const createOrdenQuery = `
      INSERT INTO ordenes_compra (
        proveedor_id, usuario_id, presu_prov_id, fecha_orden, estado, 
        monto_oc, observaciones, almacen_id, nro_comprobante
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING orden_compra_id
    `;

    const ordenResult = await pool.query(createOrdenQuery, [
      body.proveedor_id,
      body.usuario_id || null,
      body.presu_prov_id || null,
      body.fecha_orden || new Date().toISOString().split('T')[0],
      body.estado || 'pendiente',
      body.monto_oc || null,
      body.observaciones || null,
      body.almacen_id || null,
      body.nro_comprobante || generateComprobanteNumber('OC', 1) // Se actualizará después
    ]);

    const newOrdenId = ordenResult.rows[0].orden_compra_id;

    // Actualizar número de comprobante
    const nroComprobante = generateComprobanteNumber('OC', newOrdenId);
    await pool.query(
      'UPDATE ordenes_compra SET nro_comprobante = $1 WHERE orden_compra_id = $2',
      [nroComprobante, newOrdenId]
    );

    // Crear detalles de la orden
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO orden_compra_detalle (orden_compra_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [newOrdenId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }
    }

    // Calcular monto total si no se proporcionó
    if (!body.monto_oc && body.items && body.items.length > 0) {
      const montoTotal = body.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
      await pool.query(
        'UPDATE ordenes_compra SET monto_oc = $1 WHERE orden_compra_id = $2',
        [montoTotal, newOrdenId]
      );
    }

    // Obtener la orden creada con información completa
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
        a.nombre as almacen_nombre,
        CONCAT('TRK-', LPAD(oc.orden_compra_id::text, 3, '0'), '-', EXTRACT(YEAR FROM oc.fecha_orden)) as tracking
      FROM ordenes_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON oc.usuario_id = u.usuario_id
      LEFT JOIN almacenes a ON oc.almacen_id = a.almacen_id
      WHERE oc.orden_compra_id = $1
    `;

    const ordenData = await pool.query(getOrdenQuery, [newOrdenId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Orden de compra creada exitosamente',
      data: ordenData.rows[0]
    };

    // Log de auditoría
    console.log('Orden de compra creada:', sanitizeForLog({
      orden_compra_id: newOrdenId,
      nro_comprobante: nroComprobante,
      proveedor_id: body.proveedor_id,
      estado: body.estado || 'pendiente',
      total_items: body.items?.length || 0,
      monto_total: body.monto_oc,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear orden de compra:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
