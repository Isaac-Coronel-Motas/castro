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

// GET /api/ventas/notas-debito - Listar notas de débito
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
    const tipo_operacion = searchParams.get('tipo_operacion');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['nd.motivo', 'c.nombre', 'u.nombre', 'nd.nro_nota'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    // Filtrar solo notas de venta
    additionalConditions.push(`nd.tipo_operacion = 'venta'`);

    if (estado) {
      paramCount++;
      additionalConditions.push(`nd.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`nd.fecha_registro >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`nd.fecha_registro <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`nd.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`nd.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    if (tipo_operacion) {
      paramCount++;
      additionalConditions.push(`nd.tipo_operacion = $${paramCount}`);
      queryParams.push(tipo_operacion);
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_registro');

    // Consulta principal
    const query = `
      SELECT 
        nd.nota_debito_id,
        nd.tipo_operacion,
        nd.proveedor_id,
        nd.cliente_id,
        nd.sucursal_id,
        nd.almacen_id,
        nd.usuario_id,
        nd.fecha_registro,
        nd.nro_nota,
        nd.motivo,
        nd.estado,
        nd.referencia_id,
        nd.monto_nd,
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
        END as estado_display,
        CASE 
          WHEN nd.estado = 'activo' THEN 'Ver'
          WHEN nd.estado = 'anulado' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM nota_debito_cabecera nd
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON nd.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nd.almacen_id = a.almacen_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const notasDebito = result.rows;
    const total = notasDebito.length > 0 ? parseInt(notasDebito[0].total_count) : 0;

    const response: VentasApiResponse = {
      success: true,
      message: 'Notas de débito obtenidas exitosamente',
      data: notasDebito.map(nd => {
        const { total_count, ...notaDebito } = nd;
        return notaDebito;
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
    console.error('Error al obtener notas de débito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/notas-debito - Crear nota de débito
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
    const nroNota = `ND-${Date.now()}`;

    // Crear nota de débito
    const createNotaDebitoQuery = `
      INSERT INTO nota_debito_cabecera (
        tipo_operacion, cliente_id, sucursal_id, almacen_id, usuario_id, 
        fecha_registro, nro_nota, motivo, estado, referencia_id, 
        monto_nd, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING nota_debito_id
    `;

    const notaDebitoResult = await pool.query(createNotaDebitoQuery, [
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
      body.monto_nd || 0,
      body.monto_gravada_5 || 0,
      body.monto_gravada_10 || 0,
      body.monto_exenta || 0,
      body.monto_iva || 0
    ]);

    const newNotaDebitoId = notaDebitoResult.rows[0].nota_debito_id;

    // Crear detalles de la nota de débito si se proporcionan
    if (body.detalles && body.detalles.length > 0) {
      for (const detalle of body.detalles) {
        await pool.query(
          `INSERT INTO nota_debito_detalle (
            nota_debito_id, producto_id, cantidad, precio_unitario
          ) VALUES ($1, $2, $3, $4)`,
          [
            newNotaDebitoId,
            detalle.producto_id,
            detalle.cantidad,
            detalle.precio_unitario || 0
          ]
        );
      }
    }

    // Obtener la nota de débito creada con información completa
    const getNotaDebitoQuery = `
      SELECT 
        nd.nota_debito_id,
        nd.tipo_operacion,
        nd.cliente_id,
        nd.sucursal_id,
        nd.almacen_id,
        nd.usuario_id,
        nd.fecha_registro,
        nd.nro_nota,
        nd.motivo,
        nd.estado,
        nd.referencia_id,
        nd.monto_nd,
        nd.monto_gravada_5,
        nd.monto_gravada_10,
        nd.monto_exenta,
        nd.monto_iva,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre
      FROM nota_debito_cabecera nd
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON nd.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nd.almacen_id = a.almacen_id
      WHERE nd.nota_debito_id = $1
    `;

    const notaDebitoData = await pool.query(getNotaDebitoQuery, [newNotaDebitoId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Nota de débito creada exitosamente',
      data: notaDebitoData.rows[0]
    };

    // Log de auditoría
    console.log('Nota de débito creada:', sanitizeForLog({
      nota_debito_id: newNotaDebitoId,
      nro_nota: nroNota,
      cliente_id: body.cliente_id,
      usuario_id: body.usuario_id,
      monto_nd: body.monto_nd || 0,
      estado: body.estado || 'activo',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear nota de débito:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
