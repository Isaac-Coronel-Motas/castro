import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  VentasApiResponse
} from '@/lib/types/ventas';

// GET /api/ventas/notas-credito - Listar notas de crédito
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_registro';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const cliente_id = searchParams.get('cliente_id');
    const usuario_id = searchParams.get('usuario_id');
    const tipo_operacion = searchParams.get('tipo_operacion');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['nc.motivo', 'c.nombre', 'u.nombre', 'nc.nro_nota'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    // Filtrar solo notas de venta
    additionalConditions.push(`nc.tipo_operacion = 'venta'`);

    if (estado) {
      paramCount++;
      additionalConditions.push(`nc.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`nc.fecha_registro >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`nc.fecha_registro <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`nc.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`nc.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    if (tipo_operacion) {
      paramCount++;
      additionalConditions.push(`nc.tipo_operacion = $${paramCount}`);
      queryParams.push(tipo_operacion);
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_registro');

    // Consulta principal
    const query = `
      SELECT 
        nc.nota_credito_id,
        nc.tipo_operacion,
        nc.proveedor_id,
        nc.cliente_id,
        nc.sucursal_id,
        nc.almacen_id,
        nc.usuario_id,
        nc.fecha_registro,
        nc.nro_nota,
        nc.motivo,
        nc.estado,
        nc.referencia_id,
        nc.monto_nc,
        nc.monto_gravada_5,
        nc.monto_gravada_10,
        nc.monto_exenta,
        nc.monto_iva,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre,
        CASE 
          WHEN nc.estado = 'activo' THEN 'Activo'
          WHEN nc.estado = 'anulado' THEN 'Anulado'
        END as estado_display,
        CASE 
          WHEN nc.estado = 'activo' THEN 'Ver'
          WHEN nc.estado = 'anulado' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM nota_credito_cabecera nc
      LEFT JOIN clientes c ON nc.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nc.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON nc.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nc.almacen_id = a.almacen_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const notasCredito = result.rows;
    const total = notasCredito.length > 0 ? parseInt(notasCredito[0].total_count) : 0;

    const response: VentasApiResponse = {
      success: true,
      message: 'Notas de crédito obtenidas exitosamente',
      data: notasCredito.map(nc => {
        const { total_count, ...notaCredito } = nc;
        return notaCredito;
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
    console.error('Error al obtener notas de crédito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/notas-credito - Crear nota de crédito
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();

    // Validaciones básicas
    if (!body.cliente_id || !body.usuario_id || !body.sucursal_id || !body.almacen_id) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Datos requeridos faltantes',
        error: 'Validación fallida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el cliente existe
    const clienteQuery = 'SELECT cliente_id FROM clientes WHERE cliente_id = $1 AND estado = true';
    const clienteResult = await pool.query(clienteQuery, [body.cliente_id]);
    
    if (clienteResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'El cliente especificado no existe o está inactivo',
        error: 'Cliente inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el usuario existe
    const usuarioQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
    const usuarioResult = await pool.query(usuarioQuery, [body.usuario_id]);
    
    if (usuarioResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'El usuario especificado no existe',
        error: 'Usuario inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Generar número de nota
    const nroNota = `NC-${Date.now()}`;

    // Crear nota de crédito
    const createNotaCreditoQuery = `
      INSERT INTO nota_credito_cabecera (
        tipo_operacion, cliente_id, sucursal_id, almacen_id, usuario_id, 
        fecha_registro, nro_nota, motivo, estado, referencia_id, 
        monto_nc, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING nota_credito_id
    `;

    const notaCreditoResult = await pool.query(createNotaCreditoQuery, [
      'venta', // tipo_operacion
      body.cliente_id,
      body.sucursal_id,
      body.almacen_id,
      body.usuario_id,
      body.fecha_registro || new Date().toISOString().split('T')[0],
      nroNota,
      body.motivo || null,
      body.estado || 'activo',
      body.referencia_id || null,
      body.monto_nc || 0,
      body.monto_gravada_5 || 0,
      body.monto_gravada_10 || 0,
      body.monto_exenta || 0,
      body.monto_iva || 0
    ]);

    const newNotaCreditoId = notaCreditoResult.rows[0].nota_credito_id;

    // Crear detalles de la nota de crédito si se proporcionan
    if (body.detalles && body.detalles.length > 0) {
      for (const detalle of body.detalles) {
        await pool.query(
          `INSERT INTO nota_credito_detalle (
            nota_credito_id, producto_id, cantidad, precio_unitario
          ) VALUES ($1, $2, $3, $4)`,
          [
            newNotaCreditoId,
            detalle.producto_id,
            detalle.cantidad,
            detalle.precio_unitario || 0
          ]
        );
      }
    }

    // Obtener la nota de crédito creada con información completa
    const getNotaCreditoQuery = `
      SELECT 
        nc.nota_credito_id,
        nc.tipo_operacion,
        nc.cliente_id,
        nc.sucursal_id,
        nc.almacen_id,
        nc.usuario_id,
        nc.fecha_registro,
        nc.nro_nota,
        nc.motivo,
        nc.estado,
        nc.referencia_id,
        nc.monto_nc,
        nc.monto_gravada_5,
        nc.monto_gravada_10,
        nc.monto_exenta,
        nc.monto_iva,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre
      FROM nota_credito_cabecera nc
      LEFT JOIN clientes c ON nc.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nc.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON nc.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nc.almacen_id = a.almacen_id
      WHERE nc.nota_credito_id = $1
    `;

    const notaCreditoData = await pool.query(getNotaCreditoQuery, [newNotaCreditoId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Nota de crédito creada exitosamente',
      data: notaCreditoData.rows[0]
    };

    // Log de auditoría
    console.log('Nota de crédito creada:', sanitizeForLog({
      nota_credito_id: newNotaCreditoId,
      nro_nota: nroNota,
      cliente_id: body.cliente_id,
      usuario_id: body.usuario_id,
      monto_nc: body.monto_nc || 0,
      estado: body.estado || 'activo',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear nota de crédito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
