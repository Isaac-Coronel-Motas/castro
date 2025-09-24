import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateSolicitudServicioData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateSolicitudNumber,
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  CreateSolicitudServicioRequest, 
  ServiciosTecnicosApiResponse, 
  FiltrosSolicitudesServicio 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/solicitudes - Listar solicitudes de servicio
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
    const sort_by = searchParams.get('sort_by') || 'fecha_solicitud';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado_solicitud = searchParams.get('estado_solicitud');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const cliente_id = searchParams.get('cliente_id');
    const sucursal_id = searchParams.get('sucursal_id');
    const tecnico_id = searchParams.get('tecnico_id');
    const tipo_atencion = searchParams.get('tipo_atencion');
    const ciudad_id = searchParams.get('ciudad_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['ss.nro_solicitud', 'ss.descripcion_problema', 'c.nombre_cliente', 'ss.observaciones'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado_solicitud) {
      paramCount++;
      additionalConditions.push(`ss.estado_solicitud = $${paramCount}`);
      queryParams.push(estado_solicitud);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`DATE(ss.fecha_solicitud) >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`DATE(ss.fecha_solicitud) <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`ss.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`ss.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    if (tecnico_id) {
      paramCount++;
      additionalConditions.push(`vt.tecnico_id = $${paramCount}`);
      queryParams.push(parseInt(tecnico_id));
    }

    if (tipo_atencion) {
      paramCount++;
      additionalConditions.push(`ss.tipo_atencion = $${paramCount}`);
      queryParams.push(tipo_atencion);
    }

    if (ciudad_id) {
      paramCount++;
      additionalConditions.push(`ss.ciudad_id = $${paramCount}`);
      queryParams.push(parseInt(ciudad_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_solicitud');

    // Consulta principal
    const query = `
      SELECT 
        ss.solicitud_id,
        ss.fecha_solicitud,
        ss.cliente_id,
        ss.direccion,
        ss.sucursal_id,
        ss.descripcion_problema,
        ss.recepcionado_por,
        ss.fecha_programada,
        ss.estado_solicitud,
        ss.observaciones,
        ss.ciudad_id,
        ss.nro_solicitud,
        ss.tipo_atencion,
        c.nombre_cliente as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        s.nombre as sucursal_nombre,
        ci.nombre as ciudad_nombre,
        u.nombre as recepcionado_por_nombre,
        vt.visita_id,
        vt.tecnico_id,
        vt.fecha_visita,
        vt.estado_visita,
        t.nombre as tecnico_nombre,
        COUNT(ssd.detalle_id) as total_servicios,
        COALESCE(SUM(ssd.cantidad * COALESCE(ssd.precio_unitario, 0)), 0) as monto_total,
        CASE 
          WHEN ss.fecha_programada IS NOT NULL THEN 
            EXTRACT(DAYS FROM (ss.fecha_programada - CURRENT_DATE))
          ELSE NULL
        END as dias_restantes,
        CASE 
          WHEN ss.fecha_programada IS NOT NULL THEN
            CASE 
              WHEN ss.fecha_programada < CURRENT_DATE THEN 'vencida'
              WHEN ss.fecha_programada <= CURRENT_DATE + INTERVAL '1 day' THEN 'por_vencer'
              ELSE 'vigente'
            END
          ELSE 'sin_programar'
        END as estado_programacion,
        COUNT(*) OVER() as total_count
      FROM solicitud_servicio ss
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON ss.sucursal_id = s.sucursal_id
      LEFT JOIN ciudades ci ON ss.ciudad_id = ci.ciudad_id
      LEFT JOIN usuarios u ON ss.recepcionado_por = u.usuario_id
      LEFT JOIN visita_tecnica vt ON ss.solicitud_id = vt.solicitud_id
      LEFT JOIN usuarios t ON vt.tecnico_id = t.usuario_id
      LEFT JOIN solicitud_servicio_det ssd ON ss.solicitud_id = ssd.solicitud_id
      ${whereClause}
      GROUP BY ss.solicitud_id, ss.fecha_solicitud, ss.cliente_id, ss.direccion, 
               ss.sucursal_id, ss.descripcion_problema, ss.recepcionado_por, 
               ss.fecha_programada, ss.estado_solicitud, ss.observaciones, 
               ss.ciudad_id, ss.nro_solicitud, ss.tipo_atencion, c.nombre_cliente, 
               c.telefono, c.email, s.nombre, ci.nombre, u.nombre, vt.visita_id, 
               vt.tecnico_id, vt.fecha_visita, vt.estado_visita, t.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const solicitudes = result.rows;
    const total = solicitudes.length > 0 ? parseInt(solicitudes[0].total_count) : 0;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Solicitudes de servicio obtenidas exitosamente',
      data: solicitudes.map(s => {
        const { total_count, ...solicitud } = s;
        return solicitud;
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
    console.error('Error al obtener solicitudes de servicio:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/servicios/solicitudes - Crear solicitud de servicio
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateSolicitudServicioRequest = await request.json();

    // Validar datos
    const validation = validateSolicitudServicioData(body);
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

    // Verificar que la sucursal existe
    const sucursalQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
    const sucursalResult = await pool.query(sucursalQuery, [body.sucursal_id]);
    
    if (sucursalResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'La sucursal especificada no existe',
        error: 'Sucursal inválida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el usuario existe
    const usuarioQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
    const usuarioResult = await pool.query(usuarioQuery, [body.recepcionado_por]);
    
    if (usuarioResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'El usuario especificado no existe',
        error: 'Usuario inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la ciudad existe si se proporciona
    if (body.ciudad_id) {
      const ciudadQuery = 'SELECT ciudad_id FROM ciudades WHERE ciudad_id = $1';
      const ciudadResult = await pool.query(ciudadQuery, [body.ciudad_id]);
      
      if (ciudadResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'La ciudad especificada no existe',
          error: 'Ciudad inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que los servicios existen
    if (body.servicios && body.servicios.length > 0) {
      for (const servicio of body.servicios) {
        const servicioQuery = 'SELECT servicio_id FROM servicios WHERE servicio_id = $1';
        const servicioResult = await pool.query(servicioQuery, [servicio.servicio_id]);
        
        if (servicioResult.rows.length === 0) {
          const response: ServiciosTecnicosApiResponse = {
            success: false,
            message: `El servicio con ID ${servicio.servicio_id} no existe`,
            error: 'Servicio inválido'
          };
          return NextResponse.json(response, { status: 400 });
        }
      }
    }

    // Crear solicitud de servicio
    const createSolicitudQuery = `
      INSERT INTO solicitud_servicio (
        cliente_id, direccion, sucursal_id, descripcion_problema, 
        recepcionado_por, fecha_programada, estado_solicitud, 
        observaciones, ciudad_id, tipo_atencion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING solicitud_id
    `;

    const solicitudResult = await pool.query(createSolicitudQuery, [
      body.cliente_id,
      body.direccion,
      body.sucursal_id,
      body.descripcion_problema || null,
      body.recepcionado_por,
      body.fecha_programada || null,
      body.estado_solicitud || 'Pendiente',
      body.observaciones || null,
      body.ciudad_id || null,
      body.tipo_atencion || 'Visita'
    ]);

    const newSolicitudId = solicitudResult.rows[0].solicitud_id;

    // Actualizar número de solicitud
    const nroSolicitud = generateSolicitudNumber(newSolicitudId);
    await pool.query(
      'UPDATE solicitud_servicio SET nro_solicitud = $1 WHERE solicitud_id = $2',
      [nroSolicitud, newSolicitudId]
    );

    // Crear detalles de servicios
    if (body.servicios && body.servicios.length > 0) {
      for (const servicio of body.servicios) {
        await pool.query(
          'INSERT INTO solicitud_servicio_det (solicitud_id, servicio_id, cantidad, precio_unitario, observaciones) VALUES ($1, $2, $3, $4, $5)',
          [
            newSolicitudId, 
            servicio.servicio_id, 
            servicio.cantidad || 1, 
            servicio.precio_unitario || null,
            servicio.observaciones || null
          ]
        );
      }
    }

    // Obtener la solicitud creada con información completa
    const getSolicitudQuery = `
      SELECT 
        ss.solicitud_id,
        ss.fecha_solicitud,
        ss.cliente_id,
        ss.direccion,
        ss.sucursal_id,
        ss.descripcion_problema,
        ss.recepcionado_por,
        ss.fecha_programada,
        ss.estado_solicitud,
        ss.observaciones,
        ss.ciudad_id,
        ss.nro_solicitud,
        ss.tipo_atencion,
        c.nombre_cliente as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        s.nombre as sucursal_nombre,
        ci.nombre as ciudad_nombre,
        u.nombre as recepcionado_por_nombre
      FROM solicitud_servicio ss
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON ss.sucursal_id = s.sucursal_id
      LEFT JOIN ciudades ci ON ss.ciudad_id = ci.ciudad_id
      LEFT JOIN usuarios u ON ss.recepcionado_por = u.usuario_id
      WHERE ss.solicitud_id = $1
    `;

    const solicitudData = await pool.query(getSolicitudQuery, [newSolicitudId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Solicitud de servicio creada exitosamente',
      data: solicitudData.rows[0]
    };

    // Log de auditoría
    console.log('Solicitud de servicio creada:', sanitizeForLog({
      solicitud_id: newSolicitudId,
      nro_solicitud: nroSolicitud,
      cliente_id: body.cliente_id,
      sucursal_id: body.sucursal_id,
      tipo_atencion: body.tipo_atencion || 'Visita',
      total_servicios: body.servicios?.length || 0,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear solicitud de servicio:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
