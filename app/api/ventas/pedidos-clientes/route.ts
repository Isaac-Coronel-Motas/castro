import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validatePedidoVentaData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generatePedidoNumber,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  CreatePedidoVentaRequest, 
  VentasApiResponse, 
  FiltrosPedidosVenta 
} from '@/lib/types/ventas';

// GET /api/ventas/pedidos-clientes - Listar pedidos de clientes
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_pedidos_venta')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_pedido';
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
      additionalConditions.push(`pv.fecha_pedido >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`pv.fecha_pedido <= $${paramCount}`);
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
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_pedido');

    // Consulta principal
    const query = `
      SELECT 
        pv.pedido_id,
        pv.cliente_id,
        pv.fecha_pedido,
        pv.fecha_entrega,
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
          WHEN pv.estado = 'confirmado' THEN 'Confirmado'
          WHEN pv.estado = 'cancelado' THEN 'Cancelado'
        END as estado_display,
        CASE 
          WHEN pv.estado = 'pendiente' THEN 'Confirmar'
          WHEN pv.estado = 'confirmado' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        CASE 
          WHEN pv.fecha_entrega IS NOT NULL THEN 
            EXTRACT(DAYS FROM (pv.fecha_entrega - CURRENT_DATE))
          ELSE NULL
        END as dias_restantes,
        CASE 
          WHEN pv.fecha_entrega IS NOT NULL THEN
            CASE 
              WHEN pv.fecha_entrega < CURRENT_DATE THEN 'vencida'
              WHEN pv.fecha_entrega <= CURRENT_DATE + INTERVAL '1 day' THEN 'por_vencer'
              ELSE 'vigente'
            END
          ELSE 'sin_entrega'
        END as estado_entrega,
        COUNT(*) OVER() as total_count
      FROM pedido_venta pv
      LEFT JOIN clientes c ON pv.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON pv.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON pv.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON pv.forma_cobro_id = fc.forma_cobro_id
      LEFT JOIN pedido_venta_detalle pvd ON pv.pedido_id = pvd.pedido_id
      ${whereClause}
      GROUP BY pv.pedido_id, pv.cliente_id, pv.fecha_pedido, pv.fecha_entrega, 
               pv.estado, pv.monto_total, pv.observaciones, pv.usuario_id, 
               pv.sucursal_id, pv.forma_cobro_id, pv.condicion_pago, 
               c.nombre_cliente, c.telefono, c.email, u.nombre, s.nombre, fc.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const pedidos = result.rows;
    const total = pedidos.length > 0 ? parseInt(pedidos[0].total_count) : 0;

    const response: VentasApiResponse = {
      success: true,
      message: 'Pedidos de clientes obtenidos exitosamente',
      data: pedidos.map(p => {
        const { total_count, ...pedido } = p;
        return pedido;
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
    console.error('Error al obtener pedidos de clientes:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/pedidos-clientes - Crear pedido de cliente
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_pedidos_venta')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreatePedidoVentaRequest = await request.json();

    // Validar datos
    const validation = validatePedidoVentaData(body);
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

    // Crear pedido de venta
    const createPedidoQuery = `
      INSERT INTO pedido_venta (
        cliente_id, fecha_pedido, fecha_entrega, estado, monto_total, 
        observaciones, usuario_id, sucursal_id, forma_cobro_id, condicion_pago
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING pedido_id
    `;

    const pedidoResult = await pool.query(createPedidoQuery, [
      body.cliente_id,
      body.fecha_pedido || new Date().toISOString().split('T')[0],
      body.fecha_entrega || null,
      body.estado || 'pendiente',
      montoTotal,
      body.observaciones || null,
      body.usuario_id,
      body.sucursal_id,
      body.forma_cobro_id || null,
      body.condicion_pago || 'contado'
    ]);

    const newPedidoId = pedidoResult.rows[0].pedido_id;

    // Crear detalles del pedido
    if (body.productos && body.productos.length > 0) {
      for (const producto of body.productos) {
        await pool.query(
          'INSERT INTO pedido_venta_detalle (pedido_id, producto_id, cantidad, precio_unitario, descuento) VALUES ($1, $2, $3, $4, $5)',
          [
            newPedidoId, 
            producto.producto_id, 
            producto.cantidad, 
            producto.precio_unitario,
            producto.descuento || 0
          ]
        );
      }
    }

    // Obtener el pedido creado con información completa
    const getPedidoQuery = `
      SELECT 
        pv.pedido_id,
        pv.cliente_id,
        pv.fecha_pedido,
        pv.fecha_entrega,
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
      FROM pedido_venta pv
      LEFT JOIN clientes c ON pv.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON pv.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON pv.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON pv.forma_cobro_id = fc.forma_cobro_id
      WHERE pv.pedido_id = $1
    `;

    const pedidoData = await pool.query(getPedidoQuery, [newPedidoId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Pedido de cliente creado exitosamente',
      data: pedidoData.rows[0]
    };

    // Log de auditoría
    console.log('Pedido de cliente creado:', sanitizeForLog({
      pedido_id: newPedidoId,
      nro_pedido: generatePedidoNumber(newPedidoId),
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
    console.error('Error al crear pedido de cliente:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/pedidos-clientes/[id]/confirmar - Confirmar pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pedidoId = parseInt(params.id);

    if (isNaN(pedidoId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de pedido inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('confirmar_pedidos_venta')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el pedido existe
    const existingPedidoQuery = 'SELECT pedido_id, estado FROM pedido_venta WHERE pedido_id = $1';
    const existingPedido = await pool.query(existingPedidoQuery, [pedidoId]);
    
    if (existingPedido.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Pedido no encontrado',
        error: 'Pedido no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el pedido puede ser confirmado
    if (existingPedido.rows[0].estado !== 'pendiente') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden confirmar pedidos pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Confirmar pedido
    await pool.query(
      'UPDATE pedido_venta SET estado = $1 WHERE pedido_id = $2',
      ['confirmado', pedidoId]
    );

    const response: VentasApiResponse = {
      success: true,
      message: 'Pedido confirmado exitosamente'
    };

    // Log de auditoría
    console.log('Pedido confirmado:', sanitizeForLog({
      pedido_id: pedidoId,
      nro_pedido: generatePedidoNumber(pedidoId),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al confirmar pedido:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
