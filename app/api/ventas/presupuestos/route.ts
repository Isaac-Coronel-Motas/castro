import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validatePresupuestoVentaData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generatePresupuestoNumber,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  CreatePresupuestoVentaRequest, 
  VentasApiResponse, 
  FiltrosPresupuestosVenta 
} from '@/lib/types/ventas';

// GET /api/ventas/presupuestos - Listar presupuestos de ventas
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_presupuesto';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const cliente_id = searchParams.get('cliente_id');
    const sucursal_id = searchParams.get('sucursal_id');
    const usuario_id = searchParams.get('usuario_id');
    const forma_cobro_id = searchParams.get('forma_cobro_id');
    const condicion_pago = searchParams.get('condicion_pago');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['pv.observaciones', 'c.nombre_cliente', 'u.nombre', 's.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`pv.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`pv.fecha_presupuesto >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`pv.fecha_presupuesto <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`pv.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`pv.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`pv.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    if (forma_cobro_id) {
      paramCount++;
      additionalConditions.push(`pv.forma_cobro_id = $${paramCount}`);
      queryParams.push(parseInt(forma_cobro_id));
    }

    if (condicion_pago) {
      paramCount++;
      additionalConditions.push(`pv.condicion_pago = $${paramCount}`);
      queryParams.push(condicion_pago);
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_presupuesto');

    // Consulta principal
    const query = `
      SELECT 
        pv.presupuesto_id,
        pv.cliente_id,
        pv.fecha_presupuesto,
        pv.fecha_vencimiento,
        pv.estado,
        pv.monto_total,
        pv.observaciones,
        pv.usuario_id,
        pv.sucursal_id,
        pv.forma_cobro_id,
        pv.condicion_pago,
        c.nombre_cliente as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre,
        COUNT(pvd.detalle_id) as total_productos,
        CASE 
          WHEN pv.estado = 'pendiente' THEN 'Pendiente'
          WHEN pv.estado = 'aceptado' THEN 'Aceptado'
          WHEN pv.estado = 'rechazado' THEN 'Rechazado'
        END as estado_display,
        CASE 
          WHEN pv.estado = 'pendiente' THEN 'Aceptar'
          WHEN pv.estado = 'aceptado' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        CASE 
          WHEN pv.fecha_vencimiento IS NOT NULL THEN 
            EXTRACT(DAYS FROM (pv.fecha_vencimiento - CURRENT_DATE))
          ELSE NULL
        END as dias_validez,
        CASE 
          WHEN pv.fecha_vencimiento IS NOT NULL THEN
            CASE 
              WHEN pv.fecha_vencimiento < CURRENT_DATE THEN 'vencido'
              WHEN pv.fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days' THEN 'por_vencer'
              ELSE 'vigente'
            END
          ELSE 'sin_vencimiento'
        END as estado_vencimiento,
        COUNT(*) OVER() as total_count
      FROM presupuesto_venta pv
      LEFT JOIN clientes c ON pv.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON pv.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON pv.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON pv.forma_cobro_id = fc.forma_cobro_id
      LEFT JOIN presupuesto_venta_detalle pvd ON pv.presupuesto_id = pvd.presupuesto_id
      ${whereClause}
      GROUP BY pv.presupuesto_id, pv.cliente_id, pv.fecha_presupuesto, pv.fecha_vencimiento, 
               pv.estado, pv.monto_total, pv.observaciones, pv.usuario_id, 
               pv.sucursal_id, pv.forma_cobro_id, pv.condicion_pago, 
               c.nombre_cliente, c.telefono, c.email, u.nombre, s.nombre, fc.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const presupuestos = result.rows;
    const total = presupuestos.length > 0 ? parseInt(presupuestos[0].total_count) : 0;

    const response: VentasApiResponse = {
      success: true,
      message: 'Presupuestos de ventas obtenidos exitosamente',
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
    console.error('Error al obtener presupuestos de ventas:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/presupuestos - Crear presupuesto de venta
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreatePresupuestoVentaRequest = await request.json();

    // Validar datos
    const validation = validatePresupuestoVentaData(body);
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
    const clienteQuery = 'SELECT cliente_id FROM clientes WHERE cliente_id = $1';
    const clienteResult = await pool.query(clienteQuery, [body.cliente_id]);
    
    if (clienteResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'El cliente especificado no existe',
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

    // Verificar que la sucursal existe
    const sucursalQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
    const sucursalResult = await pool.query(sucursalQuery, [body.sucursal_id]);
    
    if (sucursalResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'La sucursal especificada no existe',
        error: 'Sucursal inválida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la forma de cobro existe si se proporciona
    if (body.forma_cobro_id) {
      const formaCobroQuery = 'SELECT forma_cobro_id FROM formas_cobro WHERE forma_cobro_id = $1 AND activo = true';
      const formaCobroResult = await pool.query(formaCobroQuery, [body.forma_cobro_id]);
      
      if (formaCobroResult.rows.length === 0) {
        const response: VentasApiResponse = {
          success: false,
          message: 'La forma de cobro especificada no existe o está inactiva',
          error: 'Forma de cobro inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que los productos existen
    if (body.productos && body.productos.length > 0) {
      for (const producto of body.productos) {
        const productoQuery = 'SELECT producto_id FROM productos WHERE producto_id = $1 AND estado = true';
        const productoResult = await pool.query(productoQuery, [producto.producto_id]);
        
        if (productoResult.rows.length === 0) {
          const response: VentasApiResponse = {
            success: false,
            message: `El producto con ID ${producto.producto_id} no existe o está inactivo`,
            error: 'Producto inválido'
          };
          return NextResponse.json(response, { status: 400 });
        }
      }
    }

    // Calcular monto total si no se proporciona
    let montoTotal = body.monto_total || 0;
    if (!body.monto_total) {
      montoTotal = body.productos.reduce((sum, p) => {
        const subtotal = p.cantidad * p.precio_unitario;
        const descuento = p.descuento || 0;
        return sum + (subtotal - descuento);
      }, 0);
    }

    // Crear presupuesto de venta
    const createPresupuestoQuery = `
      INSERT INTO presupuesto_venta (
        cliente_id, fecha_presupuesto, fecha_vencimiento, estado, monto_total, 
        observaciones, usuario_id, sucursal_id, forma_cobro_id, condicion_pago
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING presupuesto_id
    `;

    const presupuestoResult = await pool.query(createPresupuestoQuery, [
      body.cliente_id,
      body.fecha_presupuesto || new Date().toISOString().split('T')[0],
      body.fecha_vencimiento || null,
      body.estado || 'pendiente',
      montoTotal,
      body.observaciones || null,
      body.usuario_id,
      body.sucursal_id,
      body.forma_cobro_id || null,
      body.condicion_pago || 'contado'
    ]);

    const newPresupuestoId = presupuestoResult.rows[0].presupuesto_id;

    // Crear detalles del presupuesto
    if (body.productos && body.productos.length > 0) {
      for (const producto of body.productos) {
        await pool.query(
          'INSERT INTO presupuesto_venta_detalle (presupuesto_id, producto_id, cantidad, precio_unitario, descuento) VALUES ($1, $2, $3, $4, $5)',
          [
            newPresupuestoId, 
            producto.producto_id, 
            producto.cantidad, 
            producto.precio_unitario,
            producto.descuento || 0
          ]
        );
      }
    }

    // Obtener el presupuesto creado con información completa
    const getPresupuestoQuery = `
      SELECT 
        pv.presupuesto_id,
        pv.cliente_id,
        pv.fecha_presupuesto,
        pv.fecha_vencimiento,
        pv.estado,
        pv.monto_total,
        pv.observaciones,
        pv.usuario_id,
        pv.sucursal_id,
        pv.forma_cobro_id,
        pv.condicion_pago,
        c.nombre_cliente as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre
      FROM presupuesto_venta pv
      LEFT JOIN clientes c ON pv.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON pv.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON pv.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON pv.forma_cobro_id = fc.forma_cobro_id
      WHERE pv.presupuesto_id = $1
    `;

    const presupuestoData = await pool.query(getPresupuestoQuery, [newPresupuestoId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Presupuesto de venta creado exitosamente',
      data: presupuestoData.rows[0]
    };

    // Log de auditoría
    console.log('Presupuesto de venta creado:', sanitizeForLog({
      presupuesto_id: newPresupuestoId,
      nro_presupuesto: generatePresupuestoNumber(newPresupuestoId),
      cliente_id: body.cliente_id,
      usuario_id: body.usuario_id,
      sucursal_id: body.sucursal_id,
      total_productos: body.productos?.length || 0,
      monto_total: montoTotal,
      condicion_pago: body.condicion_pago || 'contado',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear presupuesto de venta:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/presupuestos/[id]/aceptar - Aceptar presupuesto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el presupuesto existe
    const existingPresupuestoQuery = 'SELECT presupuesto_id, estado FROM presupuesto_venta WHERE presupuesto_id = $1';
    const existingPresupuesto = await pool.query(existingPresupuestoQuery, [presupuestoId]);
    
    if (existingPresupuesto.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Presupuesto no encontrado',
        error: 'Presupuesto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el presupuesto puede ser aceptado
    if (existingPresupuesto.rows[0].estado !== 'pendiente') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden aceptar presupuestos pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Aceptar presupuesto
    await pool.query(
      'UPDATE presupuesto_venta SET estado = $1 WHERE presupuesto_id = $2',
      ['aceptado', presupuestoId]
    );

    const response: VentasApiResponse = {
      success: true,
      message: 'Presupuesto aceptado exitosamente'
    };

    // Log de auditoría
    console.log('Presupuesto aceptado:', sanitizeForLog({
      presupuesto_id: presupuestoId,
      nro_presupuesto: generatePresupuestoNumber(presupuestoId),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al aceptar presupuesto:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
