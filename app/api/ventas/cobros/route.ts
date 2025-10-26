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

// GET /api/ventas/cobros - Listar cobros
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_cobro';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const venta_id = searchParams.get('venta_id');
    const caja_id = searchParams.get('caja_id');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const usuario_id = searchParams.get('usuario_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['c.observacion', 'v.nro_factura', 'cl.nombre', 'u.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (venta_id) {
      paramCount++;
      additionalConditions.push(`c.venta_id = $${paramCount}`);
      queryParams.push(parseInt(venta_id));
    }

    if (caja_id) {
      paramCount++;
      additionalConditions.push(`c.caja_id = $${paramCount}`);
      queryParams.push(parseInt(caja_id));
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`c.fecha_cobro >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`c.fecha_cobro <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`c.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_cobro');

    // Consulta principal
    const query = `
      SELECT 
        c.cobro_id,
        c.venta_id,
        c.fecha_cobro,
        c.monto,
        c.usuario_id,
        c.caja_id,
        c.observacion,
        v.nro_factura,
        v.monto_venta as venta_total,
        v.fecha_venta,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        u.nombre as usuario_nombre,
        caja.nro_caja as caja_nro,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre,
        CONCAT('COB-', LPAD(c.cobro_id::text, 4, '0')) as codigo_cobro,
        COUNT(*) OVER() as total_count
      FROM cobros c
      LEFT JOIN ventas v ON c.venta_id = v.venta_id
      LEFT JOIN clientes cl ON v.cliente_id = cl.cliente_id
      LEFT JOIN usuarios u ON c.usuario_id = u.usuario_id
      LEFT JOIN cajas caja ON c.caja_id = caja.caja_id
      LEFT JOIN sucursales s ON caja.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON v.forma_cobro_id = fc.forma_cobro_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const cobros = result.rows;
    const total = cobros.length > 0 ? parseInt(cobros[0].total_count) : 0;

    const response = {
      success: true,
      message: 'Cobros obtenidos exitosamente',
      data: cobros.map(c => {
        const { total_count, ...cobro } = c;
        return cobro;
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
    console.error('Error al obtener cobros:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/cobros - Crear cobro
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();
    const { venta_id, monto, caja_id, observacion, usuario_id } = body;

    // Validar datos requeridos
    if (!venta_id || !monto || !caja_id) {
      const response = {
        success: false,
        message: 'Venta ID, monto y caja son requeridos',
        error: 'Datos inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la venta existe
    const ventaQuery = 'SELECT venta_id, monto_venta, estado FROM ventas WHERE venta_id = $1';
    const ventaResult = await pool.query(ventaQuery, [venta_id]);
    
    if (ventaResult.rows.length === 0) {
      const response = {
        success: false,
        message: 'La venta especificada no existe',
        error: 'Venta inválida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la caja existe y está activa
    const cajaQuery = 'SELECT caja_id, activo FROM cajas WHERE caja_id = $1';
    const cajaResult = await pool.query(cajaQuery, [caja_id]);
    
    if (cajaResult.rows.length === 0) {
      const response = {
        success: false,
        message: 'La caja especificada no existe',
        error: 'Caja inválida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!cajaResult.rows[0].activo) {
      const response = {
        success: false,
        message: 'La caja especificada está inactiva',
        error: 'Caja inactiva'
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

    // Crear cobro
    const createCobroQuery = `
      INSERT INTO cobros (
        venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING cobro_id
    `;

    const cobroResult = await pool.query(createCobroQuery, [
      venta_id,
      body.fecha_cobro || new Date().toISOString().split('T')[0],
      monto,
      usuario_id || null,
      caja_id,
      observacion || null
    ]);

    const newCobroId = cobroResult.rows[0].cobro_id;

    // Obtener el cobro creado con información completa
    const getCobroQuery = `
      SELECT 
        c.cobro_id,
        c.venta_id,
        c.fecha_cobro,
        c.monto,
        c.usuario_id,
        c.caja_id,
        c.observacion,
        v.nro_factura,
        v.monto_venta as venta_total,
        v.fecha_venta,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        u.nombre as usuario_nombre,
        caja.nro_caja as caja_nro,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre,
        CONCAT('COB-', LPAD(c.cobro_id::text, 4, '0')) as codigo_cobro
      FROM cobros c
      LEFT JOIN ventas v ON c.venta_id = v.venta_id
      LEFT JOIN clientes cl ON v.cliente_id = cl.cliente_id
      LEFT JOIN usuarios u ON c.usuario_id = u.usuario_id
      LEFT JOIN cajas caja ON c.caja_id = caja.caja_id
      LEFT JOIN sucursales s ON caja.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON v.forma_cobro_id = fc.forma_cobro_id
      WHERE c.cobro_id = $1
    `;

    const cobroData = await pool.query(getCobroQuery, [newCobroId]);

    const response = {
      success: true,
      message: 'Cobro creado exitosamente',
      data: cobroData.rows[0]
    };

    // Log de auditoría
    console.log('Cobro creado:', sanitizeForLog({
      cobro_id: newCobroId,
      venta_id,
      monto,
      caja_id,
      usuario_id,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear cobro:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}