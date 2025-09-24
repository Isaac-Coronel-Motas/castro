import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateOrdenServicioData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateOrdenServicioNumber,
  calculateOrdenServicioProgress,
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  CreateOrdenServicioRequest, 
  ServiciosTecnicosApiResponse, 
  FiltrosOrdenesServicio 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/ordenes-servicio - Listar órdenes de servicio
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
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const tecnico_id = searchParams.get('tecnico_id');
    const usuario_id = searchParams.get('usuario_id');
    const cliente_id = searchParams.get('cliente_id');
    const sucursal_id = searchParams.get('sucursal_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['os.observaciones', 't.nombre', 'u.nombre', 'c.nombre_cliente'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`os.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`os.fecha_solicitud >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`os.fecha_solicitud <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (tecnico_id) {
      paramCount++;
      additionalConditions.push(`os.tecnico_id = $${paramCount}`);
      queryParams.push(parseInt(tecnico_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`os.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
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

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_solicitud');

    // Consulta principal
    const query = `
      SELECT 
        os.orden_servicio_id,
        os.fecha_solicitud,
        os.usuario_id,
        os.estado,
        os.monto_servicio,
        os.observaciones,
        os.monto_final,
        os.tecnico_id,
        os.presu_serv_id,
        os.forma_cobro_id,
        os.fecha_ejecucion,
        os.impresa,
        u.nombre as usuario_nombre,
        t.nombre as tecnico_nombre,
        c.nombre_cliente as cliente_nombre,
        ss.nro_solicitud,
        ps.nro_presupuesto,
        fc.descripcion as forma_cobro_nombre,
        COUNT(osd.serv_deta_id) as total_servicios,
        COUNT(osp.or_ser_prod_id) as total_productos,
        COALESCE(SUM(osd.cantidad * COALESCE(osd.precio_unitario, 0)), 0) as monto_servicios,
        COALESCE(SUM(osp.cantidad * COALESCE(osp.precio_unitario, 0)), 0) as monto_productos,
        CASE 
          WHEN os.estado = 'pendiente' THEN 'Pendiente'
          WHEN os.estado = 'en_proceso' THEN 'En Proceso'
          WHEN os.estado = 'completado' THEN 'Completado'
        END as estado_display,
        CASE 
          WHEN os.estado = 'pendiente' THEN 'Iniciar'
          WHEN os.estado = 'en_proceso' THEN 'Completar'
          ELSE 'Ver'
        END as estado_accion,
        CASE 
          WHEN os.estado = 'pendiente' THEN 0
          WHEN os.estado = 'en_proceso' THEN 50
          WHEN os.estado = 'completado' THEN 100
        END as progreso,
        CASE 
          WHEN os.fecha_ejecucion IS NOT NULL THEN 
            EXTRACT(DAYS FROM (os.fecha_ejecucion - CURRENT_DATE))
          ELSE NULL
        END as dias_restantes,
        COUNT(*) OVER() as total_count
      FROM orden_servicio os
      LEFT JOIN usuarios u ON os.usuario_id = u.usuario_id
      LEFT JOIN usuarios t ON os.tecnico_id = t.usuario_id
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN formas_cobro fc ON os.forma_cobro_id = fc.forma_cobro_id
      LEFT JOIN orden_servicio_detalle osd ON os.orden_servicio_id = osd.orden_servicio_id
      LEFT JOIN orden_servicio_productos osp ON os.orden_servicio_id = osp.orden_servicio_id
      ${whereClause}
      GROUP BY os.orden_servicio_id, os.fecha_solicitud, os.usuario_id, os.estado, 
               os.monto_servicio, os.observaciones, os.monto_final, os.tecnico_id, 
               os.presu_serv_id, os.forma_cobro_id, os.fecha_ejecucion, os.impresa, 
               u.nombre, t.nombre, c.nombre_cliente, ss.nro_solicitud, ps.nro_presupuesto, 
               fc.descripcion
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const ordenes = result.rows;
    const total = ordenes.length > 0 ? parseInt(ordenes[0].total_count) : 0;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Órdenes de servicio obtenidas exitosamente',
      data: ordenes.map(o => {
        const { total_count, ...orden } = o;
        return orden;
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
    console.error('Error al obtener órdenes de servicio:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/servicios/ordenes-servicio - Crear orden de servicio
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateOrdenServicioRequest = await request.json();

    // Validar datos
    const validation = validateOrdenServicioData(body);
    if (!validation.valid) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el presupuesto existe si se proporciona
    if (body.presu_serv_id) {
      const presupuestoQuery = 'SELECT presu_serv_id, estado FROM presupuesto_servicios WHERE presu_serv_id = $1';
      const presupuestoResult = await pool.query(presupuestoQuery, [body.presu_serv_id]);
      
      if (presupuestoResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'El presupuesto especificado no existe',
          error: 'Presupuesto inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Verificar que el presupuesto esté aprobado
      if (presupuestoResult.rows[0].estado !== 'aprobado') {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'Solo se pueden crear órdenes de servicio con presupuestos aprobados',
          error: 'Presupuesto no aprobado'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el técnico existe si se proporciona
    if (body.tecnico_id) {
      const tecnicoQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
      const tecnicoResult = await pool.query(tecnicoQuery, [body.tecnico_id]);
      
      if (tecnicoResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'El técnico especificado no existe',
          error: 'Técnico inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el usuario existe si se proporciona
    if (body.usuario_id) {
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
    }

    // Verificar que la forma de cobro existe si se proporciona
    if (body.forma_cobro_id) {
      const formaCobroQuery = 'SELECT forma_cobro_id FROM formas_cobro WHERE forma_cobro_id = $1';
      const formaCobroResult = await pool.query(formaCobroQuery, [body.forma_cobro_id]);
      
      if (formaCobroResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'La forma de cobro especificada no existe',
          error: 'Forma de cobro inválida'
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

    // Verificar que los productos existen
    if (body.productos && body.productos.length > 0) {
      for (const producto of body.productos) {
        const productoQuery = 'SELECT producto_id FROM productos WHERE producto_id = $1 AND estado = true';
        const productoResult = await pool.query(productoQuery, [producto.producto_id]);
        
        if (productoResult.rows.length === 0) {
          const response: ServiciosTecnicosApiResponse = {
            success: false,
            message: `El producto con ID ${producto.producto_id} no existe o está inactivo`,
            error: 'Producto inválido'
          };
          return NextResponse.json(response, { status: 400 });
        }
      }
    }

    // Calcular monto total si no se proporciona
    let montoTotal = body.monto_servicio || 0;
    if (!body.monto_servicio) {
      const montoServicios = body.servicios?.reduce((sum, s) => sum + (s.cantidad * (s.precio_unitario || 0)), 0) || 0;
      const montoProductos = body.productos?.reduce((sum, p) => sum + (p.cantidad * (p.precio_unitario || 0)), 0) || 0;
      montoTotal = montoServicios + montoProductos;
    }

    // Crear orden de servicio
    const createOrdenQuery = `
      INSERT INTO orden_servicio (
        fecha_solicitud, usuario_id, estado, monto_servicio, observaciones,
        monto_final, tecnico_id, presu_serv_id, forma_cobro_id, fecha_ejecucion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING orden_servicio_id
    `;

    const ordenResult = await pool.query(createOrdenQuery, [
      body.fecha_solicitud || new Date().toISOString().split('T')[0],
      body.usuario_id || null,
      body.estado || 'pendiente',
      montoTotal,
      body.observaciones || null,
      body.monto_final || montoTotal,
      body.tecnico_id || null,
      body.presu_serv_id || null,
      body.forma_cobro_id || null,
      body.fecha_ejecucion || null
    ]);

    const newOrdenId = ordenResult.rows[0].orden_servicio_id;

    // Crear detalles de servicios
    if (body.servicios && body.servicios.length > 0) {
      for (const servicio of body.servicios) {
        await pool.query(
          'INSERT INTO orden_servicio_detalle (orden_servicio_id, servicio_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [newOrdenId, servicio.servicio_id, servicio.cantidad, servicio.precio_unitario || 0]
        );
      }
    }

    // Crear detalles de productos
    if (body.productos && body.productos.length > 0) {
      for (const producto of body.productos) {
        await pool.query(
          'INSERT INTO orden_servicio_productos (orden_servicio_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [newOrdenId, producto.producto_id, producto.cantidad, producto.precio_unitario || 0]
        );
      }
    }

    // Obtener la orden creada con información completa
    const getOrdenQuery = `
      SELECT 
        os.orden_servicio_id,
        os.fecha_solicitud,
        os.usuario_id,
        os.estado,
        os.monto_servicio,
        os.observaciones,
        os.monto_final,
        os.tecnico_id,
        os.presu_serv_id,
        os.forma_cobro_id,
        os.fecha_ejecucion,
        os.impresa,
        u.nombre as usuario_nombre,
        t.nombre as tecnico_nombre,
        ps.nro_presupuesto,
        fc.descripcion as forma_cobro_nombre
      FROM orden_servicio os
      LEFT JOIN usuarios u ON os.usuario_id = u.usuario_id
      LEFT JOIN usuarios t ON os.tecnico_id = t.usuario_id
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN formas_cobro fc ON os.forma_cobro_id = fc.forma_cobro_id
      WHERE os.orden_servicio_id = $1
    `;

    const ordenData = await pool.query(getOrdenQuery, [newOrdenId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Orden de servicio creada exitosamente',
      data: ordenData.rows[0]
    };

    // Log de auditoría
    console.log('Orden de servicio creada:', sanitizeForLog({
      orden_servicio_id: newOrdenId,
      nro_orden: generateOrdenServicioNumber(newOrdenId),
      presu_serv_id: body.presu_serv_id,
      tecnico_id: body.tecnico_id,
      usuario_id: body.usuario_id,
      total_servicios: body.servicios?.length || 0,
      total_productos: body.productos?.length || 0,
      monto_servicio: montoTotal,
      estado: body.estado || 'pendiente',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear orden de servicio:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/servicios/ordenes-servicio/[id]/completar - Completar orden de servicio
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ordenId = parseInt(params.id);

    if (isNaN(ordenId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de orden de servicio inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la orden existe
    const existingOrdenQuery = 'SELECT orden_servicio_id, estado FROM orden_servicio WHERE orden_servicio_id = $1';
    const existingOrden = await pool.query(existingOrdenQuery, [ordenId]);
    
    if (existingOrden.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Orden de servicio no encontrada',
        error: 'Orden no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la orden puede ser completada
    if (existingOrden.rows[0].estado !== 'en_proceso') {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Solo se pueden completar órdenes en proceso',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Marcar orden como completada
    await pool.query(
      'UPDATE orden_servicio SET estado = $1, fecha_ejecucion = $2 WHERE orden_servicio_id = $3',
      ['completado', new Date().toISOString().split('T')[0], ordenId]
    );

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Orden de servicio completada exitosamente'
    };

    // Log de auditoría
    console.log('Orden de servicio completada:', sanitizeForLog({
      orden_servicio_id: ordenId,
      nro_orden: generateOrdenServicioNumber(ordenId),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al completar orden de servicio:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
