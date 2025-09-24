import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateReclamoData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateReclamoNumber,
  calculateReclamoResolutionDays,
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  CreateReclamoRequest, 
  ServiciosTecnicosApiResponse, 
  FiltrosReclamos 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/reclamos - Listar reclamos
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_reclamo';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const cliente_id = searchParams.get('cliente_id');
    const recibido_por = searchParams.get('recibido_por');
    const gestionado_por = searchParams.get('gestionado_por');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['r.descripcion', 'r.resolucion', 'r.observaciones', 'c.nombre_cliente'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`r.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`DATE(r.fecha_reclamo) >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`DATE(r.fecha_reclamo) <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`r.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (recibido_por) {
      paramCount++;
      additionalConditions.push(`r.recibido_por = $${paramCount}`);
      queryParams.push(parseInt(recibido_por));
    }

    if (gestionado_por) {
      paramCount++;
      additionalConditions.push(`r.gestionado_por = $${paramCount}`);
      queryParams.push(parseInt(gestionado_por));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_reclamo');

    // Consulta principal
    const query = `
      SELECT 
        r.reclamo_id,
        r.cliente_id,
        r.orden_servicio_id,
        r.fecha_reclamo,
        r.recibido_por,
        r.gestionado_por,
        r.descripcion,
        r.resolucion,
        r.fecha_resolucion,
        r.observaciones,
        r.estado,
        c.nombre_cliente as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        u1.nombre as recibido_por_nombre,
        u2.nombre as gestionado_por_nombre,
        os.orden_servicio_id as orden_servicio_existe,
        CASE 
          WHEN r.fecha_resolucion IS NOT NULL THEN 
            EXTRACT(DAYS FROM (r.fecha_resolucion - r.fecha_reclamo))
          ELSE 
            EXTRACT(DAYS FROM (CURRENT_DATE - r.fecha_reclamo))
        END as dias_resolucion,
        CASE 
          WHEN r.estado = 'pendiente' THEN 'Pendiente'
          WHEN r.estado = 'en_verificacion' THEN 'En Verificación'
          WHEN r.estado = 'resuelto' THEN 'Resuelto'
          WHEN r.estado = 'rechazado' THEN 'Rechazado'
          WHEN r.estado = 'anulado' THEN 'Anulado'
        END as estado_display,
        CASE 
          WHEN r.estado = 'pendiente' THEN 'Asignar'
          WHEN r.estado = 'en_verificacion' THEN 'Resolver'
          WHEN r.estado = 'resuelto' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM reclamos r
      LEFT JOIN clientes c ON r.cliente_id = c.cliente_id
      LEFT JOIN usuarios u1 ON r.recibido_por = u1.usuario_id
      LEFT JOIN usuarios u2 ON r.gestionado_por = u2.usuario_id
      LEFT JOIN orden_servicio os ON r.orden_servicio_id = os.orden_servicio_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const reclamos = result.rows;
    const total = reclamos.length > 0 ? parseInt(reclamos[0].total_count) : 0;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Reclamos obtenidos exitosamente',
      data: reclamos.map(r => {
        const { total_count, ...reclamo } = r;
        return reclamo;
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
    console.error('Error al obtener reclamos:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/servicios/reclamos - Crear reclamo
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateReclamoRequest = await request.json();

    // Validar datos
    const validation = validateReclamoData(body);
    if (!validation.valid) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el cliente existe
    const clienteQuery = 'SELECT cliente_id FROM clientes WHERE cliente_id = $1';
    const clienteResult = await pool.query(clienteQuery, [body.cliente_id]);
    
    if (clienteResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'El cliente especificado no existe',
        error: 'Cliente inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el usuario que recibe existe
    const recibidoPorQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
    const recibidoPorResult = await pool.query(recibidoPorQuery, [body.recibido_por]);
    
    if (recibidoPorResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'El usuario que recibe el reclamo no existe',
        error: 'Usuario inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el usuario que gestiona existe si se proporciona
    if (body.gestionado_por) {
      const gestionadoPorQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
      const gestionadoPorResult = await pool.query(gestionadoPorQuery, [body.gestionado_por]);
      
      if (gestionadoPorResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'El usuario que gestiona el reclamo no existe',
          error: 'Usuario inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que la orden de servicio existe si se proporciona
    if (body.orden_servicio_id) {
      const ordenQuery = 'SELECT orden_servicio_id FROM orden_servicio WHERE orden_servicio_id = $1';
      const ordenResult = await pool.query(ordenQuery, [body.orden_servicio_id]);
      
      if (ordenResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'La orden de servicio especificada no existe',
          error: 'Orden de servicio inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Crear reclamo
    const createReclamoQuery = `
      INSERT INTO reclamos (
        cliente_id, orden_servicio_id, recibido_por, gestionado_por, 
        descripcion, resolucion, fecha_resolucion, observaciones, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING reclamo_id
    `;

    const reclamoResult = await pool.query(createReclamoQuery, [
      body.cliente_id,
      body.orden_servicio_id || null,
      body.recibido_por,
      body.gestionado_por || null,
      body.descripcion,
      body.resolucion || null,
      body.fecha_resolucion || null,
      body.observaciones || null,
      body.estado || 'pendiente'
    ]);

    const newReclamoId = reclamoResult.rows[0].reclamo_id;

    // Obtener el reclamo creado con información completa
    const getReclamoQuery = `
      SELECT 
        r.reclamo_id,
        r.cliente_id,
        r.orden_servicio_id,
        r.fecha_reclamo,
        r.recibido_por,
        r.gestionado_por,
        r.descripcion,
        r.resolucion,
        r.fecha_resolucion,
        r.observaciones,
        r.estado,
        c.nombre_cliente as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        u1.nombre as recibido_por_nombre,
        u2.nombre as gestionado_por_nombre
      FROM reclamos r
      LEFT JOIN clientes c ON r.cliente_id = c.cliente_id
      LEFT JOIN usuarios u1 ON r.recibido_por = u1.usuario_id
      LEFT JOIN usuarios u2 ON r.gestionado_por = u2.usuario_id
      WHERE r.reclamo_id = $1
    `;

    const reclamoData = await pool.query(getReclamoQuery, [newReclamoId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Reclamo creado exitosamente',
      data: reclamoData.rows[0]
    };

    // Log de auditoría
    console.log('Reclamo creado:', sanitizeForLog({
      reclamo_id: newReclamoId,
      nro_reclamo: generateReclamoNumber(newReclamoId),
      cliente_id: body.cliente_id,
      orden_servicio_id: body.orden_servicio_id,
      recibido_por: body.recibido_por,
      gestionado_por: body.gestionado_por,
      estado: body.estado || 'pendiente',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear reclamo:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/servicios/reclamos/[id]/resolver - Resolver reclamo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reclamoId = parseInt(params.id);

    if (isNaN(reclamoId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de reclamo inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();
    const { resolucion, fecha_resolucion, observaciones } = body;

    // Verificar que el reclamo existe
    const existingReclamoQuery = 'SELECT reclamo_id, estado FROM reclamos WHERE reclamo_id = $1';
    const existingReclamo = await pool.query(existingReclamoQuery, [reclamoId]);
    
    if (existingReclamo.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Reclamo no encontrado',
        error: 'Reclamo no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el reclamo puede ser resuelto
    if (!['pendiente', 'en_verificacion'].includes(existingReclamo.rows[0].estado)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Solo se pueden resolver reclamos pendientes o en verificación',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Marcar reclamo como resuelto
    await pool.query(
      'UPDATE reclamos SET estado = $1, resolucion = $2, fecha_resolucion = $3, observaciones = $4 WHERE reclamo_id = $5',
      [
        'resuelto',
        resolucion || null,
        fecha_resolucion || new Date().toISOString(),
        observaciones || null,
        reclamoId
      ]
    );

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Reclamo resuelto exitosamente'
    };

    // Log de auditoría
    console.log('Reclamo resuelto:', sanitizeForLog({
      reclamo_id: reclamoId,
      nro_reclamo: generateReclamoNumber(reclamoId),
      resolucion,
      fecha_resolucion: fecha_resolucion || new Date().toISOString(),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al resolver reclamo:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
