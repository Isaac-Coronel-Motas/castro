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

// GET /api/ventas/presupuestos-servicios - Listar presupuestos de servicios
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_presupuesto';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const tipo_presu = searchParams.get('tipo_presu');
    const usuario_id = searchParams.get('usuario_id');
    const sucursal_id = searchParams.get('sucursal_id');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['ps.nro_presupuesto', 'ps.observaciones', 'u.nombre', 's.nombre', 'd.observacion'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`ps.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (tipo_presu) {
      paramCount++;
      additionalConditions.push(`ps.tipo_presu = $${paramCount}`);
      queryParams.push(tipo_presu);
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
        d.observacion as diagnostico_descripcion,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        CONCAT('PRES-', LPAD(ps.presu_serv_id::text, 4, '0')) as codigo_presupuesto,
        COUNT(*) OVER() as total_count
      FROM presupuesto_servicios ps
      LEFT JOIN usuarios u ON ps.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON ps.sucursal_id = s.sucursal_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const presupuestos = result.rows;
    const total = presupuestos.length > 0 ? parseInt(presupuestos[0].total_count) : 0;

    const response = {
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
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/presupuestos-servicios - Crear presupuesto de servicio
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();
    const { 
      fecha_presupuesto, 
      estado, 
      monto_presu_ser, 
      observaciones, 
      descuento_id, 
      usuario_id, 
      sucursal_id, 
      promocion_id, 
      nro_presupuesto, 
      diagnostico_id, 
      valido_desde, 
      valido_hasta, 
      tipo_presu 
    } = body;

    // Validar datos requeridos
    if (!monto_presu_ser || monto_presu_ser <= 0) {
      const response = {
        success: false,
        message: 'El monto del presupuesto debe ser mayor a 0',
        error: 'Datos inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!tipo_presu) {
      const response = {
        success: false,
        message: 'El tipo de presupuesto es requerido',
        error: 'Datos inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el usuario existe si se proporciona
    if (usuario_id) {
      const usuarioQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
      const usuarioResult = await pool.query(usuarioQuery, [usuario_id]);
      
      if (usuarioResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'El usuario especificado no existe',
          error: 'Usuario inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que la sucursal existe si se proporciona
    if (sucursal_id) {
      const sucursalQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
      const sucursalResult = await pool.query(sucursalQuery, [sucursal_id]);
      
      if (sucursalResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'La sucursal especificada no existe',
          error: 'Sucursal inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el diagnóstico existe si se proporciona
    if (diagnostico_id) {
      const diagnosticoQuery = 'SELECT diagnostico_id FROM diagnostico WHERE diagnostico_id = $1';
      const diagnosticoResult = await pool.query(diagnosticoQuery, [diagnostico_id]);
      
      if (diagnosticoResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'El diagnóstico especificado no existe',
          error: 'Diagnóstico inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Crear presupuesto
    const createPresupuestoQuery = `
      INSERT INTO presupuesto_servicios (
        fecha_presupuesto, estado, monto_presu_ser, observaciones, descuento_id, 
        usuario_id, sucursal_id, promocion_id, nro_presupuesto, diagnostico_id, 
        valido_desde, valido_hasta, tipo_presu
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING presu_serv_id
    `;

    const presupuestoResult = await pool.query(createPresupuestoQuery, [
      fecha_presupuesto || new Date().toISOString().split('T')[0],
      estado || 'pendiente',
      monto_presu_ser,
      observaciones || null,
      descuento_id || null,
      usuario_id || null,
      sucursal_id || null,
      promocion_id || null,
      nro_presupuesto || null,
      diagnostico_id || null,
      valido_desde || null,
      valido_hasta || null,
      tipo_presu
    ]);

    const newPresupuestoId = presupuestoResult.rows[0].presu_serv_id;

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
        s.nombre as sucursal_nombre,
        d.observacion as diagnostico_descripcion,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        CONCAT('PRES-', LPAD(ps.presu_serv_id::text, 4, '0')) as codigo_presupuesto
      FROM presupuesto_servicios ps
      LEFT JOIN usuarios u ON ps.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON ps.sucursal_id = s.sucursal_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      WHERE ps.presu_serv_id = $1
    `;

    const presupuestoData = await pool.query(getPresupuestoQuery, [newPresupuestoId]);

    const response = {
      success: true,
      message: 'Presupuesto de servicio creado exitosamente',
      data: presupuestoData.rows[0]
    };

    // Log de auditoría
    console.log('Presupuesto de servicio creado:', sanitizeForLog({
      presu_serv_id: newPresupuestoId,
      monto_presu_ser,
      tipo_presu,
      usuario_id,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear presupuesto de servicio:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
