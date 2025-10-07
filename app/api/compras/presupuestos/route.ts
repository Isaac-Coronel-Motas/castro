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
  mapEstadoForDatabase,
  mapEstadoForFrontend,
  sanitizeForLog 
} from '@/lib/utils/compras-server';
import { 
  CreatePresupuestoProveedorRequest, 
  ComprasApiResponse, 
  ComprasPaginationParams 
} from '@/lib/types/compras';

// ===== GET - Listar presupuestos proveedor =====
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc';

    // Construir parámetros de paginación
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, (page - 1) * limit);

    // Construir cláusula WHERE
    const searchFields = [
      'pp.nro_comprobante',
      'pr.nombre_proveedor',
      'u.nombre',
      'pp.observaciones'
    ];
    const { whereClause, params } = buildSearchWhereClause(searchFields, search);

    // Construir ORDER BY
    const orderByClause = buildOrderByClause(sortBy, sortOrder, 'pp.presu_prov_id');

    // Query principal
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
        u.nombre as usuario_nombre,
        pr.nombre_proveedor as proveedor_nombre,
        COALESCE(detalle_count.total_detalles, 0) as total_detalles,
        COUNT(*) OVER() as total_count
      FROM presupuesto_proveedor pp
      LEFT JOIN usuarios u ON pp.usuario_id = u.usuario_id
      LEFT JOIN pedido_proveedor pv ON pp.pedido_prov_id = pv.pedido_prov_id
      LEFT JOIN proveedores pr ON pv.proveedor_id = pr.proveedor_id
      LEFT JOIN (
        SELECT presu_prov_id, COUNT(*) as total_detalles
        FROM detalle_presupuesto
        GROUP BY presu_prov_id
      ) detalle_count ON pp.presu_prov_id = detalle_count.presu_prov_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const presupuestos = result.rows;
    const total = presupuestos.length > 0 ? parseInt(presupuestos[0].total_count) : 0;

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuestos proveedor obtenidos exitosamente',
      data: presupuestos.map(p => {
        const { total_count, ...presupuesto } = p;
        return {
          ...presupuesto,
          estado: mapEstadoForFrontend(presupuesto.estado)
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
    console.error('Error obteniendo presupuestos proveedor:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error obteniendo presupuestos proveedor'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// ===== POST - Crear presupuesto proveedor =====
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

    // Si se proporciona proveedor_id, crear un pedido_proveedor temporal
    let pedidoProvId = body.pedido_prov_id;
    
    if (body.proveedor_id && !pedidoProvId) {
      // Crear un pedido_proveedor temporal para el proveedor seleccionado
      // Necesitamos crear primero un pedido_compra temporal
      const createPedidoCompraQuery = `
        INSERT INTO pedido_compra (usuario_id, sucursal_id, almacen_id, estado, fecha_pedido)
        VALUES ($1, 1, 1, 'pendiente', CURRENT_DATE)
        RETURNING pedido_compra_id
      `;
      
      const pedidoCompraResult = await pool.query(createPedidoCompraQuery, [body.usuario_id]);
      const pedidoCompraId = pedidoCompraResult.rows[0].pedido_compra_id;
      
      // Ahora crear el pedido_proveedor
      const createPedidoQuery = `
        INSERT INTO pedido_proveedor (pedido_compra_id, proveedor_id, fecha_envio, usuario_id)
        VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
        RETURNING pedido_prov_id
      `;
      
      const pedidoResult = await pool.query(createPedidoQuery, [pedidoCompraId, body.proveedor_id, body.usuario_id]);
      pedidoProvId = pedidoResult.rows[0].pedido_prov_id;
    }

    // Crear presupuesto
    const createPresupuestoQuery = `
      INSERT INTO presupuesto_proveedor (
        usuario_id, fecha_presupuesto, estado, observaciones, 
        monto_presu_prov, nro_comprobante, pedido_prov_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING presu_prov_id
    `;

    const presupuestoResult = await pool.query(createPresupuestoQuery, [
      body.usuario_id,
      body.fecha_presupuesto || new Date().toISOString().split('T')[0],
      mapEstadoForDatabase(body.estado || 'nuevo'),
      body.observaciones || null,
      body.monto_presu_prov || 0,
      'TEMP-PP', // Se actualizará después
      pedidoProvId
    ]);

    const newPresupuestoId = presupuestoResult.rows[0].presu_prov_id;

    // Actualizar número de comprobante
    const nroComprobante = await generateComprobanteNumber('PP');
    await pool.query(
      'UPDATE presupuesto_proveedor SET nro_comprobante = $1 WHERE presu_prov_id = $2',
      [nroComprobante, newPresupuestoId]
    );

    // Obtener presupuesto creado
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
        u.nombre as usuario_nombre,
        pr.nombre_proveedor as proveedor_nombre
      FROM presupuesto_proveedor pp
      LEFT JOIN usuarios u ON pp.usuario_id = u.usuario_id
      LEFT JOIN pedido_proveedor pv ON pp.pedido_prov_id = pv.pedido_prov_id
      LEFT JOIN proveedores pr ON pv.proveedor_id = pr.proveedor_id
      WHERE pp.presu_prov_id = $1
    `;

    const presupuestoData = await pool.query(getPresupuestoQuery, [newPresupuestoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuesto proveedor creado exitosamente',
      data: {
        ...presupuestoData.rows[0],
        estado: mapEstadoForFrontend(presupuestoData.rows[0].estado)
      }
    };

    // Log de auditoría
    console.log('Presupuesto proveedor creado:', sanitizeForLog({
      presu_prov_id: newPresupuestoId,
      nro_comprobante: nroComprobante,
      estado: body.estado || 'nuevo',
      monto: body.monto_presu_prov || 0,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creando presupuesto proveedor:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error creando presupuesto proveedor'
    };
    return NextResponse.json(response, { status: 500 });
  }
}