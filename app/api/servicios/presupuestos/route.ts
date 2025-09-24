import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validatePresupuestoServicioData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generatePresupuestoServicioNumber,
  calculateValidityDays,
  determinePresupuestoExpirationStatus,
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  CreatePresupuestoServicioRequest, 
  ServiciosTecnicosApiResponse, 
  FiltrosPresupuestosServicio 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/presupuestos - Listar presupuestos de servicios
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
    const sort_by = searchParams.get('sort_by') || 'fecha_presupuesto';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const usuario_id = searchParams.get('usuario_id');
    const sucursal_id = searchParams.get('sucursal_id');
    const tipo_presu = searchParams.get('tipo_presu');
    const diagnostico_id = searchParams.get('diagnostico_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['ps.nro_presupuesto', 'ps.observaciones', 'c.nombre_cliente', 'u.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`ps.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`ps.fecha_presupuesto >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`ps.fecha_presupuesto <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`ps.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`ps.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    if (tipo_presu) {
      paramCount++;
      additionalConditions.push(`ps.tipo_presu = $${paramCount}`);
      queryParams.push(tipo_presu);
    }

    if (diagnostico_id) {
      paramCount++;
      additionalConditions.push(`ps.diagnostico_id = $${paramCount}`);
      queryParams.push(parseInt(diagnostico_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_presupuesto');

    // Consulta principal
    const query = `
      SELECT 
        ps.presu_serv_id,
        ps.fecha_presupuesto,
        ps.estado,
        ps.monto_presu_ser,
        ps.observaciones,
        ps.descuento_id,
        ps.usuario_id,
        ps.sucursal_id,
        ps.promocion_id,
        ps.nro_presupuesto,
        ps.diagnostico_id,
        ps.valido_desde,
        ps.valido_hasta,
        ps.tipo_presu,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        c.nombre_cliente as cliente_nombre,
        d.diagnostico_id as diagnostico_existe,
        COUNT(psd.det_pres_serv_id) as total_servicios,
        COUNT(pspd.det_pres_prod_id) as total_productos,
        COALESCE(SUM(psd.cantidad * psd.precio_unitario), 0) as monto_servicios,
        COALESCE(SUM(pspd.cantidad * pspd.precio_unitario), 0) as monto_productos,
        CASE 
          WHEN ps.valido_hasta IS NOT NULL THEN 
            EXTRACT(DAYS FROM (ps.valido_hasta - CURRENT_DATE))
          ELSE NULL
        END as dias_validez,
        CASE 
          WHEN ps.valido_hasta IS NOT NULL THEN
            CASE 
              WHEN ps.valido_hasta < CURRENT_DATE THEN 'vencido'
              WHEN ps.valido_hasta <= CURRENT_DATE + INTERVAL '7 days' THEN 'por_vencer'
              ELSE 'vigente'
            END
          ELSE 'sin_vencimiento'
        END as estado_vencimiento,
        CASE 
          WHEN ps.estado = 'pendiente' THEN 'Pendiente'
          WHEN ps.estado = 'aprobado' THEN 'Aprobado'
          WHEN ps.estado = 'rechazado' THEN 'Rechazado'
        END as estado_display,
        CASE 
          WHEN ps.estado = 'pendiente' THEN 'Aprobar'
          WHEN ps.estado = 'aprobado' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM presupuesto_servicios ps
      LEFT JOIN usuarios u ON ps.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON ps.sucursal_id = s.sucursal_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN presupuesto_servicio_detalle psd ON ps.presu_serv_id = psd.presu_serv_id
      LEFT JOIN presupuesto_producto_detalle pspd ON ps.presu_serv_id = pspd.presu_serv_id
      ${whereClause}
      GROUP BY ps.presu_serv_id, ps.fecha_presupuesto, ps.estado, ps.monto_presu_ser, 
               ps.observaciones, ps.descuento_id, ps.usuario_id, ps.sucursal_id, 
               ps.promocion_id, ps.nro_presupuesto, ps.diagnostico_id, ps.valido_desde, 
               ps.valido_hasta, ps.tipo_presu, u.nombre, s.nombre, c.nombre_cliente, d.diagnostico_id
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const presupuestos = result.rows;
    const total = presupuestos.length > 0 ? parseInt(presupuestos[0].total_count) : 0;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Presupuestos de servicios obtenidos exitosamente',
      data: presupuestos.map(p => {
        const { total_count, ...presupuesto } = p;
        return presupuesto;
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
    console.error('Error al obtener presupuestos de servicios:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/servicios/presupuestos - Crear presupuesto de servicios
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreatePresupuestoServicioRequest = await request.json();

    // Validar datos
    const validation = validatePresupuestoServicioData(body);
    if (!validation.valid) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el diagnóstico existe si se proporciona
    if (body.diagnostico_id) {
      const diagnosticoQuery = 'SELECT diagnostico_id FROM diagnostico WHERE diagnostico_id = $1';
      const diagnosticoResult = await pool.query(diagnosticoQuery, [body.diagnostico_id]);
      
      if (diagnosticoResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'El diagnóstico especificado no existe',
          error: 'Diagnóstico inválido'
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

    // Verificar que la sucursal existe si se proporciona
    if (body.sucursal_id) {
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
    let montoTotal = body.monto_presu_ser || 0;
    if (!body.monto_presu_ser) {
      const montoServicios = body.servicios?.reduce((sum, s) => sum + (s.cantidad * s.precio_unitario), 0) || 0;
      const montoProductos = body.productos?.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0) || 0;
      montoTotal = montoServicios + montoProductos;
    }

    // Crear presupuesto de servicios
    const createPresupuestoQuery = `
      INSERT INTO presupuesto_servicios (
        fecha_presupuesto, estado, monto_presu_ser, observaciones, descuento_id,
        usuario_id, sucursal_id, promocion_id, diagnostico_id, valido_desde, 
        valido_hasta, tipo_presu
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING presu_serv_id
    `;

    const presupuestoResult = await pool.query(createPresupuestoQuery, [
      body.fecha_presupuesto || new Date().toISOString().split('T')[0],
      body.estado || 'pendiente',
      montoTotal,
      body.observaciones || null,
      body.descuento_id || null,
      body.usuario_id || null,
      body.sucursal_id || null,
      body.promocion_id || null,
      body.diagnostico_id || null,
      body.valido_desde || null,
      body.valido_hasta || null,
      body.tipo_presu || 'con_diagnostico'
    ]);

    const newPresupuestoId = presupuestoResult.rows[0].presu_serv_id;

    // Actualizar número de presupuesto
    const nroPresupuesto = generatePresupuestoServicioNumber(newPresupuestoId);
    await pool.query(
      'UPDATE presupuesto_servicios SET nro_presupuesto = $1 WHERE presu_serv_id = $2',
      [nroPresupuesto, newPresupuestoId]
    );

    // Crear detalles de servicios
    if (body.servicios && body.servicios.length > 0) {
      for (const servicio of body.servicios) {
        await pool.query(
          'INSERT INTO presupuesto_servicio_detalle (presu_serv_id, servicio_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [newPresupuestoId, servicio.servicio_id, servicio.cantidad, servicio.precio_unitario]
        );
      }
    }

    // Crear detalles de productos
    if (body.productos && body.productos.length > 0) {
      for (const producto of body.productos) {
        await pool.query(
          'INSERT INTO presupuesto_producto_detalle (presu_serv_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [newPresupuestoId, producto.producto_id, producto.cantidad, producto.precio_unitario]
        );
      }
    }

    // Obtener el presupuesto creado con información completa
    const getPresupuestoQuery = `
      SELECT 
        ps.presu_serv_id,
        ps.fecha_presupuesto,
        ps.estado,
        ps.monto_presu_ser,
        ps.observaciones,
        ps.descuento_id,
        ps.usuario_id,
        ps.sucursal_id,
        ps.promocion_id,
        ps.nro_presupuesto,
        ps.diagnostico_id,
        ps.valido_desde,
        ps.valido_hasta,
        ps.tipo_presu,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre
      FROM presupuesto_servicios ps
      LEFT JOIN usuarios u ON ps.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON ps.sucursal_id = s.sucursal_id
      WHERE ps.presu_serv_id = $1
    `;

    const presupuestoData = await pool.query(getPresupuestoQuery, [newPresupuestoId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Presupuesto de servicios creado exitosamente',
      data: presupuestoData.rows[0]
    };

    // Log de auditoría
    console.log('Presupuesto de servicios creado:', sanitizeForLog({
      presu_serv_id: newPresupuestoId,
      nro_presupuesto: nroPresupuesto,
      diagnostico_id: body.diagnostico_id,
      usuario_id: body.usuario_id,
      sucursal_id: body.sucursal_id,
      total_servicios: body.servicios?.length || 0,
      total_productos: body.productos?.length || 0,
      monto_presu_ser: montoTotal,
      tipo_presu: body.tipo_presu || 'con_diagnostico',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear presupuesto de servicios:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/servicios/presupuestos/[id]/aprobar - Aprobar presupuesto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el presupuesto existe
    const existingPresupuestoQuery = 'SELECT presu_serv_id, estado FROM presupuesto_servicios WHERE presu_serv_id = $1';
    const existingPresupuesto = await pool.query(existingPresupuestoQuery, [presupuestoId]);
    
    if (existingPresupuesto.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Presupuesto de servicios no encontrado',
        error: 'Presupuesto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el presupuesto puede ser aprobado
    if (existingPresupuesto.rows[0].estado !== 'pendiente') {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Solo se pueden aprobar presupuestos pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Marcar presupuesto como aprobado
    await pool.query(
      'UPDATE presupuesto_servicios SET estado = $1 WHERE presu_serv_id = $2',
      ['aprobado', presupuestoId]
    );

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Presupuesto de servicios aprobado exitosamente'
    };

    // Log de auditoría
    console.log('Presupuesto de servicios aprobado:', sanitizeForLog({
      presu_serv_id: presupuestoId,
      nro_presupuesto: generatePresupuestoServicioNumber(presupuestoId),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al aprobar presupuesto de servicios:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
