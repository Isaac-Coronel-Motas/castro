import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validatePresupuestoProveedorData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateComprobanteNumber,
  sanitizeForLog 
} from '@/lib/utils/compras';
import { 
  CreatePresupuestoProveedorRequest, 
  ComprasApiResponse, 
  ComprasPaginationParams 
} from '@/lib/types/compras';

// GET /api/compras/presupuestos - Listar presupuestos proveedor
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
    const sort_by = searchParams.get('sort_by') || 'fecha_presupuesto';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const proveedor_id = searchParams.get('proveedor_id');
    const prioridad = searchParams.get('prioridad');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['pp.nro_comprobante', 'pp.observaciones', 'p.nombre_proveedor'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`pp.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`pp.fecha_presupuesto >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`pp.fecha_presupuesto <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (proveedor_id) {
      paramCount++;
      additionalConditions.push(`pp.proveedor_id = $${paramCount}`);
      queryParams.push(parseInt(proveedor_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_presupuesto');

    // Consulta principal
    const query = `
      SELECT 
        pp.presu_prov_id,
        pp.usuario_id,
        pp.fecha_presupuesto,
        pp.estado,
        pp.observaciones,
        pp.monto_presu_prov,
        pp.nro_comprobante,
        pp.pedido_prov_id,
        pp.proveedor_id,
        u.nombre as usuario_nombre,
        p.nombre_proveedor as proveedor_nombre,
        COUNT(dpp.det_pres_prov_id) as total_items,
        (pp.fecha_presupuesto + INTERVAL '30 days') as fecha_vencimiento,
        CASE 
          WHEN (pp.fecha_presupuesto + INTERVAL '30 days') < CURRENT_DATE THEN 'vencido'
          WHEN (pp.fecha_presupuesto + INTERVAL '7 days') < CURRENT_DATE THEN 'por_vencer'
          ELSE 'vigente'
        END as estado_vencimiento,
        CASE 
          WHEN (pp.fecha_presupuesto + INTERVAL '30 days') < CURRENT_DATE THEN 'alta'
          WHEN (pp.fecha_presupuesto + INTERVAL '7 days') < CURRENT_DATE THEN 'media'
          ELSE 'baja'
        END as prioridad,
        COUNT(*) OVER() as total_count
      FROM presupuesto_proveedor pp
      LEFT JOIN usuarios u ON pp.usuario_id = u.usuario_id
      LEFT JOIN proveedores p ON pp.proveedor_id = p.proveedor_id
      LEFT JOIN presupuesto_proveedor_detalle dpp ON pp.presu_prov_id = dpp.presu_prov_id
      ${whereClause}
      GROUP BY pp.presu_prov_id, pp.usuario_id, pp.fecha_presupuesto, pp.estado, 
               pp.observaciones, pp.monto_presu_prov, pp.nro_comprobante, 
               pp.pedido_prov_id, pp.proveedor_id, u.nombre, p.nombre_proveedor
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const presupuestos = result.rows;
    const total = presupuestos.length > 0 ? parseInt(presupuestos[0].total_count) : 0;

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuestos proveedor obtenidos exitosamente',
      data: presupuestos.map(p => {
        const { total_count, ...presupuesto } = p;
        return presupuesto;
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
    console.error('Error al obtener presupuestos proveedor:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/compras/presupuestos - Crear presupuesto proveedor
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreatePresupuestoProveedorRequest = await request.json();

    // Validar datos
    const validation = validatePresupuestoProveedorData(body);
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

    // Verificar que el pedido proveedor existe si se proporciona
    if (body.pedido_prov_id) {
      const pedidoQuery = 'SELECT pedido_prov_id FROM pedido_proveedor WHERE pedido_prov_id = $1';
      const pedidoResult = await pool.query(pedidoQuery, [body.pedido_prov_id]);
      
      if (pedidoResult.rows.length === 0) {
        const response: ComprasApiResponse = {
          success: false,
          message: 'El pedido proveedor especificado no existe',
          error: 'Pedido inválido'
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

    // Crear presupuesto proveedor
    const createPresupuestoQuery = `
      INSERT INTO presupuesto_proveedor (
        usuario_id, fecha_presupuesto, estado, observaciones, monto_presu_prov, 
        nro_comprobante, pedido_prov_id, proveedor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING presu_prov_id
    `;

    const presupuestoResult = await pool.query(createPresupuestoQuery, [
      body.usuario_id || null,
      body.fecha_presupuesto || new Date().toISOString().split('T')[0],
      body.estado || 'nuevo',
      body.observaciones || null,
      body.monto_presu_prov || null,
      body.nro_comprobante || generateComprobanteNumber('PP', 1), // Se actualizará después
      body.pedido_prov_id || null,
      body.proveedor_id
    ]);

    const newPresupuestoId = presupuestoResult.rows[0].presu_prov_id;

    // Actualizar número de comprobante
    const nroComprobante = generateComprobanteNumber('PP', newPresupuestoId);
    await pool.query(
      'UPDATE presupuesto_proveedor SET nro_comprobante = $1 WHERE presu_prov_id = $2',
      [nroComprobante, newPresupuestoId]
    );

    // Crear detalles del presupuesto
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO presupuesto_proveedor_detalle (presu_prov_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [newPresupuestoId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }
    }

    // Calcular monto total si no se proporcionó
    if (!body.monto_presu_prov && body.items && body.items.length > 0) {
      const montoTotal = body.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
      await pool.query(
        'UPDATE presupuesto_proveedor SET monto_presu_prov = $1 WHERE presu_prov_id = $2',
        [montoTotal, newPresupuestoId]
      );
    }

    // Obtener el presupuesto creado con información completa
    const getPresupuestoQuery = `
      SELECT 
        pp.presu_prov_id,
        pp.usuario_id,
        pp.fecha_presupuesto,
        pp.estado,
        pp.observaciones,
        pp.monto_presu_prov,
        pp.nro_comprobante,
        pp.pedido_prov_id,
        pp.proveedor_id,
        u.nombre as usuario_nombre,
        p.nombre_proveedor as proveedor_nombre,
        COUNT(dpp.det_pres_prov_id) as total_items,
        (pp.fecha_presupuesto + INTERVAL '30 days') as fecha_vencimiento,
        CASE 
          WHEN (pp.fecha_presupuesto + INTERVAL '30 days') < CURRENT_DATE THEN 'vencido'
          WHEN (pp.fecha_presupuesto + INTERVAL '7 days') < CURRENT_DATE THEN 'por_vencer'
          ELSE 'vigente'
        END as estado_vencimiento,
        CASE 
          WHEN (pp.fecha_presupuesto + INTERVAL '30 days') < CURRENT_DATE THEN 'alta'
          WHEN (pp.fecha_presupuesto + INTERVAL '7 days') < CURRENT_DATE THEN 'media'
          ELSE 'baja'
        END as prioridad
      FROM presupuesto_proveedor pp
      LEFT JOIN usuarios u ON pp.usuario_id = u.usuario_id
      LEFT JOIN proveedores p ON pp.proveedor_id = p.proveedor_id
      LEFT JOIN presupuesto_proveedor_detalle dpp ON pp.presu_prov_id = dpp.presu_prov_id
      WHERE pp.presu_prov_id = $1
      GROUP BY pp.presu_prov_id, pp.usuario_id, pp.fecha_presupuesto, pp.estado, 
               pp.observaciones, pp.monto_presu_prov, pp.nro_comprobante, 
               pp.pedido_prov_id, pp.proveedor_id, u.nombre, p.nombre_proveedor
    `;

    const presupuestoData = await pool.query(getPresupuestoQuery, [newPresupuestoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuesto proveedor creado exitosamente',
      data: presupuestoData.rows[0]
    };

    // Log de auditoría
    console.log('Presupuesto proveedor creado:', sanitizeForLog({
      presu_prov_id: newPresupuestoId,
      nro_comprobante: nroComprobante,
      proveedor_id: body.proveedor_id,
      estado: body.estado || 'nuevo',
      total_items: body.items?.length || 0,
      monto_total: body.monto_presu_prov,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear presupuesto proveedor:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
