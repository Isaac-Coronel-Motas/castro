import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaCreditoVentaData, 
  validateNotaDebitoVentaData,
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateNotaCreditoNumber,
  generateNotaDebitoNumber,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  CreateNotaCreditoVentaRequest, 
  CreateNotaDebitoVentaRequest,
  VentasApiResponse, 
  FiltrosNotasCreditoVenta,
  FiltrosNotasDebitoVenta 
} from '@/lib/types/ventas';

// GET /api/ventas/notas-credito - Listar notas de crédito
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_notas_credito')(request);
    
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
    const searchFields = ['nc.observaciones', 'c.nombre', 'u.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`nc.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`nc.fecha_nota >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`nc.fecha_nota <= $${paramCount}`);
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

    if (tipo_documento) {
      paramCount++;
      additionalConditions.push(`nc.tipo_documento = $${paramCount}`);
      queryParams.push(tipo_documento);
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_nota');

    // Consulta principal
    const query = `
      SELECT 
        nc.nota_credito_id,
        nc.fecha_nota,
        nc.cliente_id,
        nc.usuario_id,
        nc.tipo_documento,
        nc.nro_documento,
        nc.nro_nota,
        nc.timbrado,
        nc.estado,
        nc.observaciones,
        nc.total_gravado,
        nc.total_iva,
        nc.total_exento,
        nc.total_nota,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        CASE 
          WHEN nc.estado = 'pendiente' THEN 'Pendiente'
          WHEN nc.estado = 'aprobada' THEN 'Aprobada'
          WHEN nc.estado = 'anulada' THEN 'Anulada'
        END as estado_display,
        CASE 
          WHEN nc.estado = 'pendiente' THEN 'Aprobar'
          WHEN nc.estado = 'aprobada' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM nota_credito_cabecera nc
      LEFT JOIN clientes c ON nc.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nc.usuario_id = u.usuario_id
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
    const { authorized, error } = requirePermission('crear_notas_credito')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateNotaCreditoVentaRequest = await request.json();

    // Validar datos
    const validation = validateNotaCreditoVentaData(body);
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

    // Crear nota de crédito
    const createNotaCreditoQuery = `
      INSERT INTO nota_credito_cabecera (
        fecha_nota, cliente_id, usuario_id, tipo_documento, nro_documento, 
        nro_nota, timbrado, estado, observaciones, total_gravado, 
        total_iva, total_exento, total_nota
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING nota_credito_id
    `;

    const notaCreditoResult = await pool.query(createNotaCreditoQuery, [
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

    const newNotaCreditoId = notaCreditoResult.rows[0].nota_credito_id;

    // Crear detalles de la nota de crédito
    if (body.detalles && body.detalles.length > 0) {
      for (const detalle of body.detalles) {
        await pool.query(
          `INSERT INTO nota_credito_detalle (
            nota_credito_id, producto_id, cantidad, precio_unitario, 
            descuento, subtotal, gravado, exento, iva
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newNotaCreditoId,
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

    // Obtener la nota de crédito creada con información completa
    const getNotaCreditoQuery = `
      SELECT 
        nc.nota_credito_id,
        nc.fecha_nota,
        nc.cliente_id,
        nc.usuario_id,
        nc.tipo_documento,
        nc.nro_documento,
        nc.nro_nota,
        nc.timbrado,
        nc.estado,
        nc.observaciones,
        nc.total_gravado,
        nc.total_iva,
        nc.total_exento,
        nc.total_nota,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre
      FROM nota_credito_cabecera nc
      LEFT JOIN clientes c ON nc.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nc.usuario_id = u.usuario_id
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
      nro_nota: generateNotaCreditoNumber(newNotaCreditoId),
      cliente_id: body.cliente_id,
      usuario_id: body.usuario_id,
      tipo_documento: body.tipo_documento,
      total_nota: body.total_nota || 0,
      estado: body.estado || 'pendiente',
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
