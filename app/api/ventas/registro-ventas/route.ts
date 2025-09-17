import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateVentaData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateVentaNumber,
  calculateParaguayanIVA,
  calculateVentaTotal,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  CreateVentaRequest, 
  VentasApiResponse, 
  FiltrosVentas 
} from '@/lib/types/ventas';

// GET /api/ventas/registro-ventas - Listar ventas
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_venta';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const cliente_id = searchParams.get('cliente_id');
    const caja_id = searchParams.get('caja_id');
    const sucursal_id = searchParams.get('sucursal_id');
    const forma_cobro_id = searchParams.get('forma_cobro_id');
    const condicion_pago = searchParams.get('condicion_pago');
    const tipo_documento = searchParams.get('tipo_documento');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['v.tipo_documento', 'v.observaciones', 'c.nombre_cliente', 'fc.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`v.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`v.fecha_venta >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`v.fecha_venta <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`v.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (caja_id) {
      paramCount++;
      additionalConditions.push(`v.caja_id = $${paramCount}`);
      queryParams.push(parseInt(caja_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`c.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    if (forma_cobro_id) {
      paramCount++;
      additionalConditions.push(`v.forma_cobro_id = $${paramCount}`);
      queryParams.push(parseInt(forma_cobro_id));
    }

    if (condicion_pago) {
      paramCount++;
      additionalConditions.push(`v.condicion_pago = $${paramCount}`);
      queryParams.push(condicion_pago);
    }

    if (tipo_documento) {
      paramCount++;
      additionalConditions.push(`v.tipo_documento = $${paramCount}`);
      queryParams.push(tipo_documento);
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_venta');

    // Consulta principal
    const query = `
      SELECT 
        v.venta_id,
        v.cliente_id,
        v.fecha_venta,
        v.estado,
        v.tipo_documento,
        v.monto_venta,
        v.caja_id,
        v.tipo_doc_id,
        v.nro_factura,
        v.forma_cobro_id,
        v.monto_gravada_5,
        v.monto_gravada_10,
        v.monto_exenta,
        v.monto_iva,
        v.condicion_pago,
        c.nombre_cliente as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        caja.nro_caja as caja_nro,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre,
        td.descripcion as tipo_documento_nombre,
        COUNT(vd.detalle_venta_id) as total_productos,
        COALESCE(SUM(cob.monto), 0) as total_cobros,
        CASE 
          WHEN v.condicion_pago = 'crédito' THEN 
            v.monto_venta - COALESCE(SUM(cob.monto), 0)
          ELSE 0
        END as saldo_pendiente,
        CASE 
          WHEN v.estado = 'cerrado' THEN 'Cerrado'
          WHEN v.estado = 'abierto' THEN 'Abierto'
          WHEN v.estado = 'cancelado' THEN 'Cancelado'
        END as estado_display,
        CASE 
          WHEN v.estado = 'abierto' THEN 'Cerrar'
          WHEN v.estado = 'cerrado' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
      LEFT JOIN sucursales s ON caja.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON v.forma_cobro_id = fc.forma_cobro_id
      LEFT JOIN tipo_documento td ON v.tipo_doc_id = td.tipo_doc_id
      LEFT JOIN ventas_detalle vd ON v.venta_id = vd.venta_id
      LEFT JOIN cobros cob ON v.venta_id = cob.venta_id
      ${whereClause}
      GROUP BY v.venta_id, v.cliente_id, v.fecha_venta, v.estado, v.tipo_documento, 
               v.monto_venta, v.caja_id, v.tipo_doc_id, v.nro_factura, v.forma_cobro_id, 
               v.monto_gravada_5, v.monto_gravada_10, v.monto_exenta, v.monto_iva, 
               v.condicion_pago, c.nombre_cliente, c.telefono, c.email, caja.nro_caja, 
               s.nombre, fc.nombre, td.descripcion
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const ventas = result.rows;
    const total = ventas.length > 0 ? parseInt(ventas[0].total_count) : 0;

    const response: VentasApiResponse = {
      success: true,
      message: 'Ventas obtenidas exitosamente',
      data: ventas.map(v => {
        const { total_count, ...venta } = v;
        return venta;
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
    console.error('Error al obtener ventas:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/registro-ventas - Crear venta
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateVentaRequest = await request.json();

    // Validar datos
    const validation = validateVentaData(body);
    if (!validation.valid) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el cliente existe si se proporciona
    if (body.cliente_id) {
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
    }

    // Verificar que la caja existe si se proporciona
    if (body.caja_id) {
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

      if (!cajaResult.rows[0].activo) {
        const response: VentasApiResponse = {
          success: false,
          message: 'La caja especificada está inactiva',
          error: 'Caja inactiva'
        };
        return NextResponse.json(response, { status: 400 });
      }
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

    // Calcular montos si no se proporcionan
    let montoGravada5 = body.monto_gravada_5 || 0;
    let montoGravada10 = body.monto_gravada_10 || 0;
    let montoExenta = body.monto_exenta || 0;
    let montoIVA = body.monto_iva || 0;
    let montoVenta = body.monto_venta || 0;

    if (!body.monto_venta) {
      // Calcular montos basados en productos
      montoVenta = body.productos.reduce((sum, p) => {
        const subtotal = p.cantidad * p.precio_unitario;
        const descuento = p.descuento || 0;
        return sum + (subtotal - descuento);
      }, 0);
    }

    if (!body.monto_iva) {
      montoIVA = calculateParaguayanIVA(montoGravada5, montoGravada10);
    }

    // Crear venta
    const createVentaQuery = `
      INSERT INTO ventas (
        cliente_id, fecha_venta, estado, tipo_documento, monto_venta, 
        caja_id, tipo_doc_id, nro_factura, forma_cobro_id, 
        monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING venta_id
    `;

    const ventaResult = await pool.query(createVentaQuery, [
      body.cliente_id || null,
      body.fecha_venta || new Date().toISOString().split('T')[0],
      body.estado || 'abierto',
      body.tipo_documento || null,
      montoVenta,
      body.caja_id || null,
      body.tipo_doc_id || null,
      body.nro_factura || null,
      body.forma_cobro_id || null,
      montoGravada5,
      montoGravada10,
      montoExenta,
      montoIVA,
      body.condicion_pago || 'contado'
    ]);

    const newVentaId = ventaResult.rows[0].venta_id;

    // Crear detalles de la venta
    if (body.productos && body.productos.length > 0) {
      for (const producto of body.productos) {
        await pool.query(
          'INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [
            newVentaId, 
            producto.producto_id, 
            producto.cantidad, 
            producto.precio_unitario
          ]
        );
      }
    }

    // Crear cuenta por cobrar si es crédito
    if (body.condicion_pago === 'crédito' && body.cliente_id) {
      await pool.query(
        'INSERT INTO cuentas_por_cobrar (venta_id, cliente_id, fecha_emision, monto_total, saldo_pendiente, estado, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          newVentaId,
          body.cliente_id,
          body.fecha_venta || new Date().toISOString().split('T')[0],
          montoVenta,
          montoVenta,
          'pendiente',
          1 // TODO: Obtener usuario_id del token
        ]
      );
    }

    // Obtener la venta creada con información completa
    const getVentaQuery = `
      SELECT 
        v.venta_id,
        v.cliente_id,
        v.fecha_venta,
        v.estado,
        v.tipo_documento,
        v.monto_venta,
        v.caja_id,
        v.tipo_doc_id,
        v.nro_factura,
        v.forma_cobro_id,
        v.monto_gravada_5,
        v.monto_gravada_10,
        v.monto_exenta,
        v.monto_iva,
        v.condicion_pago,
        c.nombre_cliente as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        caja.nro_caja as caja_nro,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre,
        td.descripcion as tipo_documento_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
      LEFT JOIN sucursales s ON caja.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON v.forma_cobro_id = fc.forma_cobro_id
      LEFT JOIN tipo_documento td ON v.tipo_doc_id = td.tipo_doc_id
      WHERE v.venta_id = $1
    `;

    const ventaData = await pool.query(getVentaQuery, [newVentaId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Venta creada exitosamente',
      data: ventaData.rows[0]
    };

    // Log de auditoría
    console.log('Venta creada:', sanitizeForLog({
      venta_id: newVentaId,
      nro_venta: generateVentaNumber(newVentaId),
      cliente_id: body.cliente_id,
      caja_id: body.caja_id,
      total_productos: body.productos?.length || 0,
      monto_venta: montoVenta,
      condicion_pago: body.condicion_pago || 'contado',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear venta:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/registro-ventas/[id]/cerrar - Cerrar venta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ventaId = parseInt(params.id);

    if (isNaN(ventaId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de venta inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('cerrar_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la venta existe
    const existingVentaQuery = 'SELECT venta_id, estado FROM ventas WHERE venta_id = $1';
    const existingVenta = await pool.query(existingVentaQuery, [ventaId]);
    
    if (existingVenta.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Venta no encontrada',
        error: 'Venta no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la venta puede ser cerrada
    if (existingVenta.rows[0].estado !== 'abierto') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden cerrar ventas abiertas',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Cerrar venta
    await pool.query(
      'UPDATE ventas SET estado = $1 WHERE venta_id = $2',
      ['cerrado', ventaId]
    );

    const response: VentasApiResponse = {
      success: true,
      message: 'Venta cerrada exitosamente'
    };

    // Log de auditoría
    console.log('Venta cerrada:', sanitizeForLog({
      venta_id: ventaId,
      nro_venta: generateVentaNumber(ventaId),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al cerrar venta:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
