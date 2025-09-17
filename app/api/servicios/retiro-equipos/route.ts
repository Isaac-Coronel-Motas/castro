import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateSalidaEquipoData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  CreateSalidaEquipoRequest, 
  ServiciosTecnicosApiResponse 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/retiro-equipos - Listar retiros de equipos
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_retiro_equipos')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_salida';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const entregado_por = searchParams.get('entregado_por');
    const cliente_id = searchParams.get('cliente_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['se.retirado_por', 'se.documento_entrega', 'se.observaciones', 'c.nombre_cliente'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`DATE(se.fecha_salida) >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`DATE(se.fecha_salida) <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (entregado_por) {
      paramCount++;
      additionalConditions.push(`se.entregado_por = $${paramCount}`);
      queryParams.push(parseInt(entregado_por));
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`ss.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_salida');

    // Consulta principal
    const query = `
      SELECT 
        se.salida_id,
        se.recepcion_id,
        se.fecha_salida,
        se.entregado_por,
        se.retirado_por,
        se.documento_entrega,
        se.observaciones,
        u.nombre as entregado_por_nombre,
        c.nombre_cliente as cliente_nombre,
        re.nro_recepcion,
        ss.nro_solicitud,
        COUNT(red.detalle_id) as total_equipos,
        COUNT(*) OVER() as total_count
      FROM salida_equipo se
      LEFT JOIN usuarios u ON se.entregado_por = u.usuario_id
      LEFT JOIN recepcion_equipo re ON se.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN recepcion_equipo_detalle red ON re.recepcion_id = red.recepcion_id
      ${whereClause}
      GROUP BY se.salida_id, se.recepcion_id, se.fecha_salida, se.entregado_por, 
               se.retirado_por, se.documento_entrega, se.observaciones, u.nombre, 
               c.nombre_cliente, re.nro_recepcion, ss.nro_solicitud
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const salidas = result.rows;
    const total = salidas.length > 0 ? parseInt(salidas[0].total_count) : 0;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Retiros de equipos obtenidos exitosamente',
      data: salidas.map(s => {
        const { total_count, ...salida } = s;
        return salida;
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
    console.error('Error al obtener retiros de equipos:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/servicios/retiro-equipos - Crear retiro de equipos
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_retiro_equipos')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateSalidaEquipoRequest = await request.json();

    // Validar datos
    const validation = validateSalidaEquipoData(body);
    if (!validation.valid) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la recepción existe
    const recepcionQuery = 'SELECT recepcion_id, estado_recepcion FROM recepcion_equipo WHERE recepcion_id = $1';
    const recepcionResult = await pool.query(recepcionQuery, [body.recepcion_id]);
    
    if (recepcionResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'La recepción especificada no existe',
        error: 'Recepción inválida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la recepción esté en estado válido para retiro
    if (recepcionResult.rows[0].estado_recepcion !== 'Recepcionada') {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Solo se pueden retirar equipos de recepciones procesadas',
        error: 'Estado de recepción inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el usuario existe
    const usuarioQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
    const usuarioResult = await pool.query(usuarioQuery, [body.entregado_por]);
    
    if (usuarioResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'El usuario especificado no existe',
        error: 'Usuario inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que no existe ya una salida para esta recepción
    const salidaExistenteQuery = 'SELECT salida_id FROM salida_equipo WHERE recepcion_id = $1';
    const salidaExistente = await pool.query(salidaExistenteQuery, [body.recepcion_id]);
    
    if (salidaExistente.rows.length > 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Ya existe una salida registrada para esta recepción',
        error: 'Salida duplicada'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Crear salida de equipos
    const createSalidaQuery = `
      INSERT INTO salida_equipo (
        recepcion_id, entregado_por, retirado_por, documento_entrega, observaciones
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING salida_id
    `;

    const salidaResult = await pool.query(createSalidaQuery, [
      body.recepcion_id,
      body.entregado_por,
      body.retirado_por,
      body.documento_entrega || null,
      body.observaciones || null
    ]);

    const newSalidaId = salidaResult.rows[0].salida_id;

    // Obtener la salida creada con información completa
    const getSalidaQuery = `
      SELECT 
        se.salida_id,
        se.recepcion_id,
        se.fecha_salida,
        se.entregado_por,
        se.retirado_por,
        se.documento_entrega,
        se.observaciones,
        u.nombre as entregado_por_nombre,
        c.nombre_cliente as cliente_nombre,
        re.nro_recepcion,
        ss.nro_solicitud
      FROM salida_equipo se
      LEFT JOIN usuarios u ON se.entregado_por = u.usuario_id
      LEFT JOIN recepcion_equipo re ON se.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      WHERE se.salida_id = $1
    `;

    const salidaData = await pool.query(getSalidaQuery, [newSalidaId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Retiro de equipos creado exitosamente',
      data: salidaData.rows[0]
    };

    // Log de auditoría
    console.log('Retiro de equipos creado:', sanitizeForLog({
      salida_id: newSalidaId,
      recepcion_id: body.recepcion_id,
      entregado_por: body.entregado_por,
      retirado_por: body.retirado_por,
      documento_entrega: body.documento_entrega,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear retiro de equipos:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
