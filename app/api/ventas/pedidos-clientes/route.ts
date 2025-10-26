import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth';
import { buildSearchWhereClause, buildOrderByClause } from '@/lib/utils/api-helpers';

interface VentasApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface CreatePedidoRequest {
  cliente_id: number;
  fecha_pedido?: string;
  estado?: string;
  observaciones?: string;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}

// GET /api/ventas/pedidos-clientes - Listar pedidos/ventas de clientes
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_venta';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado') || '';
    const cliente_id = searchParams.get('cliente_id') || '';

    // Campos de búsqueda
    const searchFields = [
      'c.nombre',
      'v.nro_factura::text',
      'v.tipo_documento'
    ];

    // Construir whereClause manualmente para evitar problemas de parámetros
    const conditions: string[] = [];
    const allParams: any[] = [];
    let paramCount = 0;

    // Agregar condiciones adicionales
    if (estado) {
      paramCount++;
      conditions.push(`v.estado = $${paramCount}`);
      allParams.push(estado);
    }

    if (cliente_id) {
      paramCount++;
      conditions.push(`v.cliente_id = $${paramCount}`);
      allParams.push(parseInt(cliente_id));
    }

    // Agregar búsqueda
    if (search && search.trim()) {
      paramCount++;
      const searchCondition = searchFields
        .map(field => `${field} ILIKE $${paramCount}`)
        .join(' OR ');
      conditions.push(`(${searchCondition})`);
      allParams.push(`%${search.trim()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Mapear sort_by a columnas válidas
    const validSortColumns: Record<string, string> = {
      'created_at': 'fecha_venta',
      'fecha_venta': 'fecha_venta',
      'fecha_pedido': 'fecha_venta',
      'monto_venta': 'monto_venta',
      'estado': 'estado',
      'cliente_nombre': 'c.nombre',
      'venta_id': 'venta_id'
    };
    
    const mappedSortBy = validSortColumns[sort_by] || 'fecha_venta';
    const orderByClause = `ORDER BY ${mappedSortBy} ${sort_order}`;

    // Construir parámetros de paginación
    const validatedLimit = Math.min(limit, 100);
    const limitParam = validatedLimit;
    const offsetParam = (page - 1) * validatedLimit;

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
        c.nombre as cliente_nombre,
        c.direccion as cliente_direccion,
        c.ruc as cliente_ruc,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        CASE 
          WHEN v.estado = 'abierto' THEN 'Abierto'
          WHEN v.estado = 'cerrado' THEN 'Cerrado'
          WHEN v.estado = 'cancelado' THEN 'Cancelado'
          ELSE v.estado::text
        END as estado_display,
        CASE 
          WHEN v.estado = 'abierto' THEN 'Editar'
          WHEN v.estado = 'cerrado' THEN 'Ver'
          WHEN v.estado = 'cancelado' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(vd.detalle_venta_id) as total_productos,
        COUNT(*) OVER() as total_count
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      LEFT JOIN ventas_detalle vd ON v.venta_id = vd.venta_id
      ${whereClause}
      GROUP BY v.venta_id, v.cliente_id, v.fecha_venta, v.estado, v.tipo_documento, 
               v.monto_venta, v.caja_id, v.tipo_doc_id, v.nro_factura, v.forma_cobro_id,
               v.monto_gravada_5, v.monto_gravada_10, v.monto_exenta, v.monto_iva, 
               v.condicion_pago, c.nombre, c.direccion, c.ruc, c.telefono, c.email
      ${orderByClause}
      LIMIT $${allParams.length + 1} OFFSET $${allParams.length + 2}
    `;

    const finalParams = [...allParams, limitParam, offsetParam];
    const result = await pool.query(query, finalParams);
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

// POST /api/ventas/pedidos-clientes - Crear nuevo pedido/venta
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreatePedidoRequest = await request.json();

    // Validar datos
    if (!body.cliente_id) {
      const response: VentasApiResponse = {
        success: false,
        message: 'El cliente es requerido',
        error: 'Datos de entrada inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!body.productos || body.productos.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Debe incluir al menos un producto',
        error: 'Datos de entrada inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Calcular monto total
    const montoTotal = body.productos.reduce((total, producto) => {
      return total + (producto.cantidad * producto.precio_unitario);
    }, 0);

    // Crear la venta
    const ventaQuery = `
      INSERT INTO ventas (
        cliente_id, 
        fecha_venta, 
        estado, 
        tipo_documento,
        monto_venta,
        condicion_pago
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING venta_id
    `;

    const ventaParams = [
      body.cliente_id,
      body.fecha_pedido || new Date().toISOString().split('T')[0],
      body.estado || 'abierto',
      body.tipo_documento || 'Pedido',
      montoTotal,
      'contado'
    ];

    const ventaResult = await pool.query(ventaQuery, ventaParams);
    const ventaId = ventaResult.rows[0].venta_id;

    // Crear detalles de la venta
    for (const producto of body.productos) {
      const detalleQuery = `
        INSERT INTO ventas_detalle (
          venta_id,
          producto_id,
          cantidad,
          precio_unitario
        ) VALUES ($1, $2, $3, $4)
      `;

      await pool.query(detalleQuery, [
        ventaId,
        producto.producto_id,
        producto.cantidad,
        producto.precio_unitario
      ]);
    }

    const response: VentasApiResponse = {
      success: true,
      message: 'Pedido creado exitosamente',
      data: { venta_id: ventaId }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}