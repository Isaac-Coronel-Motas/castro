import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaDebitoVentaData,
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateNotaDebitoNumber,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  CreateNotaDebitoVentaRequest,
  VentasApiResponse, 
  FiltrosNotasDebitoVenta 
} from '@/lib/types/ventas';

// GET /api/ventas/notas-debito - Listar notas de débito
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_notas_debito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_nota';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const cliente_id = searchParams.get('cliente_id');
    const usuario_id = searchParams.get('usuario_id');
    const tipo_documento = searchParams.get('tipo_documento');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['nd.observaciones', 'c.nombre', 'u.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`nd.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`nd.fecha_nota >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`nd.fecha_nota <= $${paramCount}`);
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

    if (tipo_documento) {
      paramCount++;
      additionalConditions.push(`nd.tipo_documento = $${paramCount}`);
      queryParams.push(tipo_documento);
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_nota');

    // Consulta principal
    const query = `
      SELECT 
        nd.nota_debito_id,
        nd.fecha_nota,
        nd.cliente_id,
        nd.usuario_id,
        nd.tipo_documento,
        nd.nro_documento,
        nd.nro_nota,
        nd.timbrado,
        nd.estado,
        nd.observaciones,
        nd.total_gravado,
        nd.total_iva,
        nd.total_exento,
        nd.total_nota,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        CASE 
          WHEN nd.estado = 'pendiente' THEN 'Pendiente'
          WHEN nd.estado = 'aprobada' THEN 'Aprobada'
          WHEN nd.estado = 'anulada' THEN 'Anulada'
        END as estado_display,
        CASE 
          WHEN nd.estado = 'pendiente' THEN 'Aprobar'
          WHEN nd.estado = 'aprobada' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM nota_debito_cabecera nd
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
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
    const { authorized, error } = requirePermission('crear_notas_debito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateNotaDebitoVentaRequest = await request.json();

    // Validar datos
    const validation = validateNotaDebitoVentaData(body);
    if (!validation.valid) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
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

    // Verificar que el timbrado existe
    if (body.timbrado) {
      const timbradoQuery = 'SELECT timbrado_id FROM timbrados WHERE timbrado_id = $1 AND estado = true';
      const timbradoResult = await pool.query(timbradoQuery, [body.timbrado]);
      
      if (timbradoResult.rows.length === 0) {
        const response: VentasApiResponse = {
          success: false,
          message: 'El timbrado especificado no existe o está inactivo',
          error: 'Timbrado inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Crear nota de débito
    const createNotaDebitoQuery = `
      INSERT INTO nota_debito_cabecera (
        fecha_nota, cliente_id, usuario_id, tipo_documento, nro_documento, 
        nro_nota, timbrado, estado, observaciones, total_gravado, 
        total_iva, total_exento, total_nota
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING nota_debito_id
    `;

    const notaDebitoResult = await pool.query(createNotaDebitoQuery, [
      body.fecha_nota || new Date().toISOString().split('T')[0],
      body.cliente_id,
      body.usuario_id,
      body.tipo_documento,
      body.nro_documento || null,
      body.nro_nota || null,
      body.timbrado || null,
      body.estado || 'pendiente',
      body.observaciones || null,
      body.total_gravado || 0,
      body.total_iva || 0,
      body.total_exento || 0,
      body.total_nota || 0
    ]);

    const newNotaDebitoId = notaDebitoResult.rows[0].nota_debito_id;

    // Crear detalles de la nota de débito
    if (body.detalles && body.detalles.length > 0) {
      for (const detalle of body.detalles) {
        await pool.query(
          `INSERT INTO nota_debito_detalle (
            nota_debito_id, producto_id, cantidad, precio_unitario, 
            descuento, subtotal, gravado, exento, iva
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newNotaDebitoId,
            detalle.producto_id,
            detalle.cantidad,
            detalle.precio_unitario,
            detalle.descuento || 0,
            detalle.subtotal,
            detalle.gravado || 0,
            detalle.exento || 0,
            detalle.iva || 0
          ]
        );
      }
    }

    // Obtener la nota de débito creada con información completa
    const getNotaDebitoQuery = `
      SELECT 
        nd.nota_debito_id,
        nd.fecha_nota,
        nd.cliente_id,
        nd.usuario_id,
        nd.tipo_documento,
        nd.nro_documento,
        nd.nro_nota,
        nd.timbrado,
        nd.estado,
        nd.observaciones,
        nd.total_gravado,
        nd.total_iva,
        nd.total_exento,
        nd.total_nota,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre
      FROM nota_debito_cabecera nd
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
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
      nro_nota: generateNotaDebitoNumber(newNotaDebitoId),
      cliente_id: body.cliente_id,
      usuario_id: body.usuario_id,
      tipo_documento: body.tipo_documento,
      total_nota: body.total_nota || 0,
      estado: body.estado || 'pendiente',
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
