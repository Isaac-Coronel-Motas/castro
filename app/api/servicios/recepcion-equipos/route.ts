import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateRecepcionEquipoData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateRecepcionNumber,
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  CreateRecepcionEquipoRequest, 
  ServiciosTecnicosApiResponse, 
  FiltrosRecepcionEquipos 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/recepcion-equipos - Listar recepciones de equipos
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
    const sort_by = searchParams.get('sort_by') || 'fecha_recepcion';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado_recepcion = searchParams.get('estado_recepcion');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const sucursal_id = searchParams.get('sucursal_id');
    const usuario_id = searchParams.get('usuario_id');
    const cliente_id = searchParams.get('cliente_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['re.nro_recepcion', 're.observaciones', 'e.numero_serie', 'c.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado_recepcion) {
      paramCount++;
      additionalConditions.push(`re.estado_recepcion = $${paramCount}`);
      queryParams.push(estado_recepcion);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`DATE(re.fecha_recepcion) >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`DATE(re.fecha_recepcion) <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`re.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`re.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`ss.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 're', 'fecha_recepcion');

    // Consulta principal
    const query = `
      SELECT 
        re.recepcion_id,
        re.fecha_recepcion,
        re.usuario_id,
        re.sucursal_id,
        re.estado_recepcion,
        re.observaciones,
        re.nro_recepcion,
        re.solicitud_id,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        c.nombre as cliente_nombre,
        ss.nro_solicitud,
        COUNT(red.detalle_id) as total_equipos,
        CASE 
          WHEN re.estado_recepcion = 'En revisión' THEN 'En Revisión'
          WHEN re.estado_recepcion = 'Cancelada' THEN 'Cancelada'
          WHEN re.estado_recepcion = 'Recepcionada' THEN 'Recepcionada'
        END as estado_display,
        CASE 
          WHEN re.estado_recepcion = 'Recepcionada' THEN 'Procesar'
          WHEN re.estado_recepcion = 'En revisión' THEN 'Revisar'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM recepcion_equipo re
      LEFT JOIN usuarios u ON re.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON re.sucursal_id = s.sucursal_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN recepcion_equipo_detalle red ON re.recepcion_id = red.recepcion_id
      ${whereClause}
      GROUP BY re.recepcion_id, re.fecha_recepcion, re.usuario_id, re.sucursal_id, 
               re.estado_recepcion, re.observaciones, re.nro_recepcion, re.solicitud_id, 
               u.nombre, s.nombre, c.nombre, ss.nro_solicitud
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const recepciones = result.rows;
    const total = recepciones.length > 0 ? parseInt(recepciones[0].total_count) : 0;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Recepciones de equipos obtenidas exitosamente',
      data: recepciones.map(r => {
        const { total_count, ...recepcion } = r;
        return recepcion;
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
    console.error('Error al obtener recepciones de equipos:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/servicios/recepcion-equipos - Crear recepción de equipos
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateRecepcionEquipoRequest = await request.json();

    // Validar datos
    const validation = validateRecepcionEquipoData(body);
    if (!validation.valid) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el usuario existe
    const usuarioQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
    const usuarioResult = await pool.query(usuarioQuery, [body.usuario_id]);
    
    if (usuarioResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'El usuario especificado no existe',
        error: 'Usuario inválido'
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

    // Verificar que la solicitud existe si se proporciona
    if (body.solicitud_id) {
      const solicitudQuery = 'SELECT solicitud_id FROM solicitud_servicio WHERE solicitud_id = $1';
      const solicitudResult = await pool.query(solicitudQuery, [body.solicitud_id]);
      
      if (solicitudResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'La solicitud especificada no existe',
          error: 'Solicitud inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que los equipos existen
    if (body.equipos && body.equipos.length > 0) {
      for (const equipo of body.equipos) {
        const equipoQuery = 'SELECT equipo_id FROM equipos WHERE equipo_id = $1';
        const equipoResult = await pool.query(equipoQuery, [equipo.equipo_id]);
        
        if (equipoResult.rows.length === 0) {
          const response: ServiciosTecnicosApiResponse = {
            success: false,
            message: `El equipo con ID ${equipo.equipo_id} no existe`,
            error: 'Equipo inválido'
          };
          return NextResponse.json(response, { status: 400 });
        }
      }
    }

    // Crear recepción de equipos
    const createRecepcionQuery = `
      INSERT INTO recepcion_equipo (
        usuario_id, sucursal_id, estado_recepcion, observaciones, solicitud_id
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING recepcion_id
    `;

    const recepcionResult = await pool.query(createRecepcionQuery, [
      body.usuario_id,
      body.sucursal_id,
      body.estado_recepcion || 'En revisión',
      body.observaciones || null,
      body.solicitud_id || null
    ]);

    const newRecepcionId = recepcionResult.rows[0].recepcion_id;

    // Actualizar número de recepción
    const nroRecepcion = generateRecepcionNumber(newRecepcionId);
    await pool.query(
      'UPDATE recepcion_equipo SET nro_recepcion = $1 WHERE recepcion_id = $2',
      [nroRecepcion, newRecepcionId]
    );

    // Crear detalles de equipos
    if (body.equipos && body.equipos.length > 0) {
      for (const equipo of body.equipos) {
        await pool.query(
          'INSERT INTO recepcion_equipo_detalle (recepcion_id, equipo_id, cantidad, observaciones) VALUES ($1, $2, $3, $4)',
          [
            newRecepcionId, 
            equipo.equipo_id, 
            equipo.cantidad || 1,
            equipo.observaciones || null
          ]
        );
      }
    }

    // Obtener la recepción creada con información completa
    const getRecepcionQuery = `
      SELECT 
        re.recepcion_id,
        re.fecha_recepcion,
        re.usuario_id,
        re.sucursal_id,
        re.estado_recepcion,
        re.observaciones,
        re.nro_recepcion,
        re.solicitud_id,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        c.nombre as cliente_nombre,
        ss.nro_solicitud
      FROM recepcion_equipo re
      LEFT JOIN usuarios u ON re.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON re.sucursal_id = s.sucursal_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      WHERE re.recepcion_id = $1
    `;

    const recepcionData = await pool.query(getRecepcionQuery, [newRecepcionId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Recepción de equipos creada exitosamente',
      data: recepcionData.rows[0]
    };

    // Log de auditoría
    console.log('Recepción de equipos creada:', sanitizeForLog({
      recepcion_id: newRecepcionId,
      nro_recepcion: nroRecepcion,
      usuario_id: body.usuario_id,
      sucursal_id: body.sucursal_id,
      solicitud_id: body.solicitud_id,
      total_equipos: body.equipos?.length || 0,
      estado_recepcion: body.estado_recepcion || 'En revisión',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear recepción de equipos:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/servicios/recepcion-equipos/[id]/procesar - Procesar recepción
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recepcionId = parseInt(params.id);

    if (isNaN(recepcionId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de recepción inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la recepción existe
    const existingRecepcionQuery = 'SELECT recepcion_id, estado_recepcion FROM recepcion_equipo WHERE recepcion_id = $1';
    const existingRecepcion = await pool.query(existingRecepcionQuery, [recepcionId]);
    
    if (existingRecepcion.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Recepción de equipos no encontrada',
        error: 'Recepción no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la recepción puede ser procesada
    if (existingRecepcion.rows[0].estado_recepcion !== 'En revisión') {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Solo se pueden procesar recepciones en revisión',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Marcar recepción como procesada
    await pool.query(
      'UPDATE recepcion_equipo SET estado_recepcion = $1 WHERE recepcion_id = $2',
      ['Recepcionada', recepcionId]
    );

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Recepción de equipos procesada exitosamente'
    };

    // Log de auditoría
    console.log('Recepción de equipos procesada:', sanitizeForLog({
      recepcion_id: recepcionId,
      nro_recepcion: generateRecepcionNumber(recepcionId),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al procesar recepción de equipos:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
