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

// GET /api/ventas/notas-credito-debito - Listar todas las notas de crédito y débito
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_registro';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const cliente_id = searchParams.get('cliente_id');
    const usuario_id = searchParams.get('usuario_id');
    const tipo_nota = searchParams.get('tipo_nota'); // 'credito', 'debito', o 'all'

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['motivo', 'cliente_nombre', 'usuario_nombre', 'nro_nota'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    // Filtrar solo notas de venta
    additionalConditions.push(`tipo_operacion = 'venta'`);

    if (estado) {
      paramCount++;
      additionalConditions.push(`estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`fecha_registro >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`fecha_registro <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    if (tipo_nota && tipo_nota !== 'all') {
      if (tipo_nota === 'credito') {
        additionalConditions.push(`tipo_nota = 'credito'`);
      } else if (tipo_nota === 'debito') {
        additionalConditions.push(`tipo_nota = 'debito'`);
      }
    }

    // Construir WHERE clause manualmente para evitar ambigüedades
    let whereConditions: string[] = [];
    let allParams: any[] = [...queryParams];
    let searchParamCount = queryParams.length;

    // Agregar condiciones adicionales
    if (additionalConditions.length > 0) {
      whereConditions.push(...additionalConditions);
    }

    // Agregar búsqueda si existe
    if (search) {
      const searchConditions = [
        `motivo ILIKE $${++searchParamCount}`,
        `cliente_nombre ILIKE $${++searchParamCount}`,
        `usuario_nombre ILIKE $${++searchParamCount}`,
        `nro_nota ILIKE $${++searchParamCount}`
      ];
      whereConditions.push(`(${searchConditions.join(' OR ')})`);
      allParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const orderByClause = `ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;

    // Consulta unificada que combina notas de crédito y débito
    const query = `
      WITH notas_unificadas AS (
        SELECT 
          nota_credito_id as id,
          'credito' as tipo_nota,
          tipo_operacion,
          nc.cliente_id,
          nc.sucursal_id,
          nc.almacen_id,
          nc.usuario_id,
          nc.fecha_registro,
          nc.nro_nota,
          nc.motivo,
          nc.estado,
          nc.referencia_id,
          nc.monto_nc as monto,
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
          END as estado_display
        FROM nota_credito_cabecera nc
        LEFT JOIN clientes c ON nc.cliente_id = c.cliente_id
        LEFT JOIN usuarios u ON nc.usuario_id = u.usuario_id
        LEFT JOIN sucursales s ON nc.sucursal_id = s.sucursal_id
        LEFT JOIN almacenes a ON nc.almacen_id = a.almacen_id
        WHERE nc.tipo_operacion = 'venta'
        
        UNION ALL
        
        SELECT 
          nota_debito_id as id,
          'debito' as tipo_nota,
          tipo_operacion,
          nd.cliente_id,
          nd.sucursal_id,
          nd.almacen_id,
          nd.usuario_id,
          nd.fecha_registro,
          nd.nro_nota,
          nd.motivo,
          nd.estado,
          nd.referencia_id,
          nd.monto_nd as monto,
          nd.monto_gravada_5,
          nd.monto_gravada_10,
          nd.monto_exenta,
          nd.monto_iva,
          c.nombre as cliente_nombre,
          u.nombre as usuario_nombre,
          s.nombre as sucursal_nombre,
          a.nombre as almacen_nombre,
          CASE 
            WHEN nd.estado = 'activo' THEN 'Activo'
            WHEN nd.estado = 'anulado' THEN 'Anulado'
          END as estado_display
        FROM nota_debito_cabecera nd
        LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
        LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
        LEFT JOIN sucursales s ON nd.sucursal_id = s.sucursal_id
        LEFT JOIN almacenes a ON nd.almacen_id = a.almacen_id
        WHERE nd.tipo_operacion = 'venta'
      )
      SELECT 
        *,
        COUNT(*) OVER() as total_count
      FROM notas_unificadas
      ${whereClause}
      ${orderByClause}
      LIMIT $${searchParamCount + 1} OFFSET $${searchParamCount + 2}
    `;

    const finalParams = [...allParams, limitParam, offsetParam];
    const result = await pool.query(query, finalParams);
    const notas = result.rows;
    const total = notas.length > 0 ? parseInt(notas[0].total_count) : 0;

    const response: VentasApiResponse = {
      success: true,
      message: 'Notas de crédito y débito obtenidas exitosamente',
      data: notas.map(nota => {
        const { total_count, ...notaData } = nota;
        return notaData;
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
    console.error('Error al obtener notas de crédito y débito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/notas-credito-debito - Crear nota de crédito o débito
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();

    // Validaciones básicas
    if (!body.tipo_nota || !body.cliente_id || !body.usuario_id || !body.sucursal_id || !body.almacen_id) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Datos requeridos faltantes',
        error: 'Validación fallida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!['credito', 'debito'].includes(body.tipo_nota)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Tipo de nota inválido. Debe ser "credito" o "debito"',
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
    const nroNota = body.tipo_nota === 'credito' ? `NC-${Date.now()}` : `ND-${Date.now()}`;

    let newNotaId: number;
    let tablaCabecera: string;
    let tablaDetalle: string;
    let campoMonto: string;

    if (body.tipo_nota === 'credito') {
      tablaCabecera = 'nota_credito_cabecera';
      tablaDetalle = 'nota_credito_detalle';
      campoMonto = 'monto_nc';
    } else {
      tablaCabecera = 'nota_debito_cabecera';
      tablaDetalle = 'nota_debito_detalle';
      campoMonto = 'monto_nd';
    }

    // Crear nota
    const createNotaQuery = `
      INSERT INTO ${tablaCabecera} (
        tipo_operacion, cliente_id, sucursal_id, almacen_id, usuario_id, 
        fecha_registro, nro_nota, motivo, estado, referencia_id, 
        ${campoMonto}, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING ${tablaCabecera.replace('_cabecera', '_id')}
    `;

    const notaResult = await pool.query(createNotaQuery, [
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
      body.monto || 0,
      body.monto_gravada_5 || 0,
      body.monto_gravada_10 || 0,
      body.monto_exenta || 0,
      body.monto_iva || 0
    ]);

    newNotaId = notaResult.rows[0][tablaCabecera.replace('_cabecera', '_id')];

    // Crear detalles si se proporcionan
    if (body.detalles && body.detalles.length > 0) {
      for (const detalle of body.detalles) {
        await pool.query(
          `INSERT INTO ${tablaDetalle} (
            ${tablaCabecera.replace('_cabecera', '_id')}, producto_id, cantidad, precio_unitario
          ) VALUES ($1, $2, $3, $4)`,
          [
            newNotaId,
            detalle.producto_id,
            detalle.cantidad,
            detalle.precio_unitario || 0
          ]
        );
      }
    }

    // Obtener la nota creada con información completa
    const getNotaQuery = `
      SELECT 
        ${tablaCabecera.replace('_cabecera', '_id')} as id,
        '${body.tipo_nota}' as tipo_nota,
        tipo_operacion,
        cliente_id,
        sucursal_id,
        almacen_id,
        usuario_id,
        fecha_registro,
        nro_nota,
        motivo,
        estado,
        referencia_id,
        ${campoMonto} as monto,
        monto_gravada_5,
        monto_gravada_10,
        monto_exenta,
        monto_iva,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre,
        CASE 
          WHEN estado = 'activo' THEN 'Activo'
          WHEN estado = 'anulado' THEN 'Anulado'
        END as estado_display
      FROM ${tablaCabecera}
      LEFT JOIN clientes c ON cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON almacen_id = a.almacen_id
      WHERE ${tablaCabecera.replace('_cabecera', '_id')} = $1
    `;

    const notaData = await pool.query(getNotaQuery, [newNotaId]);

    const response: VentasApiResponse = {
      success: true,
      message: `Nota de ${body.tipo_nota} creada exitosamente`,
      data: notaData.rows[0]
    };

    // Log de auditoría
    console.log(`Nota de ${body.tipo_nota} creada:`, sanitizeForLog({
      nota_id: newNotaId,
      tipo_nota: body.tipo_nota,
      nro_nota: nroNota,
      cliente_id: body.cliente_id,
      usuario_id: body.usuario_id,
      monto: body.monto || 0,
      estado: body.estado || 'activo',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear nota:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
