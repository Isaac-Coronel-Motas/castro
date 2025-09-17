import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateCobroData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateCobroNumber,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  CreateCobroRequest, 
  VentasApiResponse, 
  FiltrosCobros 
} from '@/lib/types/ventas';

// GET /api/ventas/cobros - Listar cobros
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_cobros')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_cobro';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const cliente_id = searchParams.get('cliente_id');
    const caja_id = searchParams.get('caja_id');
    const sucursal_id = searchParams.get('sucursal_id');
    const usuario_id = searchParams.get('usuario_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['c.observacion', 'cl.nombre_cliente', 'u.nombre', 'caja.nro_caja'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

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

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`v.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (caja_id) {
      paramCount++;
      additionalConditions.push(`c.caja_id = $${paramCount}`);
      queryParams.push(parseInt(caja_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`caja.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
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
        cl.nombre_cliente as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        v.nro_factura as venta_nro_factura,
        u.nombre as usuario_nombre,
        caja.nro_caja as caja_nro,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre,
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

    const response: VentasApiResponse = {
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
    
    const response: VentasApiResponse = {
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
    const { authorized, error } = requirePermission('crear_cobros')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateCobroRequest = await request.json();

    // Validar datos
    const validation = validateCobroData(body);
    if (!validation.valid) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la venta existe
    const ventaQuery = 'SELECT venta_id, monto_venta, condicion_pago FROM ventas WHERE venta_id = $1';
    const ventaResult = await pool.query(ventaQuery, [body.venta_id]);
    
    if (ventaResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'La venta especificada no existe',
        error: 'Venta inválida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la caja existe
    const cajaQuery = 'SELECT caja_id, activo FROM cajas WHERE caja_id = $1';
    const cajaResult = await pool.query(cajaQuery, [body.caja_id]);
    
    if (cajaResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'La caja especificada no existe',
        error: 'Caja inválida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!cajaResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'La caja especificada está inactiva',
        error: 'Caja inactiva'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el usuario existe si se proporciona
    if (body.usuario_id) {
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
    }

    // Verificar que el monto del cobro no exceda el saldo pendiente
    const saldoQuery = `
      SELECT 
        v.monto_venta,
        COALESCE(SUM(c.monto), 0) as total_cobros
      FROM ventas v
      LEFT JOIN cobros c ON v.venta_id = c.venta_id
      WHERE v.venta_id = $1
      GROUP BY v.venta_id, v.monto_venta
    `;
    const saldoResult = await pool.query(saldoQuery, [body.venta_id]);
    
    if (saldoResult.rows.length > 0) {
      const montoVenta = parseFloat(saldoResult.rows[0].monto_venta);
      const totalCobros = parseFloat(saldoResult.rows[0].total_cobros);
      const saldoPendiente = montoVenta - totalCobros;
      
      if (body.monto > saldoPendiente) {
        const response: VentasApiResponse = {
          success: false,
          message: `El monto del cobro (${body.monto}) excede el saldo pendiente (${saldoPendiente})`,
          error: 'Monto excedido'
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
      body.venta_id,
      body.fecha_cobro || new Date().toISOString().split('T')[0],
      body.monto,
      body.usuario_id || null,
      body.caja_id,
      body.observacion || null
    ]);

    const newCobroId = cobroResult.rows[0].cobro_id;

    // Actualizar cuenta por cobrar si existe
    const cuentaQuery = 'SELECT cuenta_cobrar_id, saldo_pendiente FROM cuentas_por_cobrar WHERE venta_id = $1';
    const cuentaResult = await pool.query(cuentaQuery, [body.venta_id]);
    
    if (cuentaResult.rows.length > 0) {
      const cuentaId = cuentaResult.rows[0].cuenta_cobrar_id;
      const saldoActual = parseFloat(cuentaResult.rows[0].saldo_pendiente);
      const nuevoSaldo = saldoActual - body.monto;
      
      let nuevoEstado = 'pendiente';
      if (nuevoSaldo <= 0) {
        nuevoEstado = 'pagada';
      } else if (nuevoSaldo < saldoActual) {
        nuevoEstado = 'parcial';
      }
      
      await pool.query(
        'UPDATE cuentas_por_cobrar SET saldo_pendiente = $1, estado = $2 WHERE cuenta_cobrar_id = $3',
        [nuevoSaldo, nuevoEstado, cuentaId]
      );
    }

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
        cl.nombre_cliente as cliente_nombre,
        cl.telefono as cliente_telefono,
        cl.email as cliente_email,
        v.nro_factura as venta_nro_factura,
        u.nombre as usuario_nombre,
        caja.nro_caja as caja_nro,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre
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

    const response: VentasApiResponse = {
      success: true,
      message: 'Cobro creado exitosamente',
      data: cobroData.rows[0]
    };

    // Log de auditoría
    console.log('Cobro creado:', sanitizeForLog({
      cobro_id: newCobroId,
      nro_cobro: generateCobroNumber(newCobroId),
      venta_id: body.venta_id,
      monto: body.monto,
      caja_id: body.caja_id,
      usuario_id: body.usuario_id,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear cobro:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
