import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaRemisionData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateRemisionNumber,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  CreateNotaRemisionRequest, 
  VentasApiResponse, 
  FiltrosNotasRemision 
} from '@/lib/types/ventas';

// GET /api/ventas/notas-remision - Listar notas de remisión
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_notas_remision')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_remision';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const usuario_id = searchParams.get('usuario_id');
    const origen_almacen_id = searchParams.get('origen_almacen_id');
    const destino_sucursal_id = searchParams.get('destino_sucursal_id');
    const destino_almacen_id = searchParams.get('destino_almacen_id');
    const tipo_remision = searchParams.get('tipo_remision');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['nr.observaciones', 'u.nombre', 'oa.nombre', 'da.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`nr.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`nr.fecha_remision >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`nr.fecha_remision <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`nr.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    if (origen_almacen_id) {
      paramCount++;
      additionalConditions.push(`nr.origen_almacen_id = $${paramCount}`);
      queryParams.push(parseInt(origen_almacen_id));
    }

    if (destino_sucursal_id) {
      paramCount++;
      additionalConditions.push(`nr.destino_sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(destino_sucursal_id));
    }

    if (destino_almacen_id) {
      paramCount++;
      additionalConditions.push(`nr.destino_almacen_id = $${paramCount}`);
      queryParams.push(parseInt(destino_almacen_id));
    }

    if (tipo_remision) {
      paramCount++;
      additionalConditions.push(`nr.tipo_remision = $${paramCount}`);
      queryParams.push(tipo_remision);
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_remision');

    // Consulta principal
    const query = `
      SELECT 
        nr.remision_id,
        nr.fecha_remision,
        nr.usuario_id,
        nr.origen_almacen_id,
        nr.destino_sucursal_id,
        nr.destino_almacen_id,
        nr.tipo_remision,
        nr.referencia_id,
        nr.estado,
        nr.observaciones,
        u.nombre as usuario_nombre,
        oa.nombre as origen_almacen_nombre,
        ds.nombre as destino_sucursal_nombre,
        da.nombre as destino_almacen_nombre,
        COUNT(nrd.detalle_id) as total_productos,
        CASE 
          WHEN nr.estado = 'pendiente' THEN 'Pendiente'
          WHEN nr.estado = 'enviado' THEN 'Enviado'
          WHEN nr.estado = 'anulado' THEN 'Anulado'
        END as estado_display,
        CASE 
          WHEN nr.estado = 'pendiente' THEN 'Enviar'
          WHEN nr.estado = 'enviado' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM nota_remision nr
      LEFT JOIN usuarios u ON nr.usuario_id = u.usuario_id
      LEFT JOIN almacenes oa ON nr.origen_almacen_id = oa.almacen_id
      LEFT JOIN sucursales ds ON nr.destino_sucursal_id = ds.sucursal_id
      LEFT JOIN almacenes da ON nr.destino_almacen_id = da.almacen_id
      LEFT JOIN nota_remision_detalle nrd ON nr.remision_id = nrd.remision_id
      ${whereClause}
      GROUP BY nr.remision_id, nr.fecha_remision, nr.usuario_id, nr.origen_almacen_id, 
               nr.destino_sucursal_id, nr.destino_almacen_id, nr.tipo_remision, 
               nr.referencia_id, nr.estado, nr.observaciones, u.nombre, 
               oa.nombre, ds.nombre, da.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const remisiones = result.rows;
    const total = remisiones.length > 0 ? parseInt(remisiones[0].total_count) : 0;

    const response: VentasApiResponse = {
      success: true,
      message: 'Notas de remisión obtenidas exitosamente',
      data: remisiones.map(r => {
        const { total_count, ...remision } = r;
        return remision;
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
    console.error('Error al obtener notas de remisión:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/notas-remision - Crear nota de remisión
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_notas_remision')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateNotaRemisionRequest = await request.json();

    // Validar datos
    const validation = validateNotaRemisionData(body);
    if (!validation.valid) {
      const response: VentasApiResponse = {
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
      const response: VentasApiResponse = {
        success: false,
        message: 'El usuario especificado no existe',
        error: 'Usuario inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el almacén de origen existe
    const origenAlmacenQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
    const origenAlmacenResult = await pool.query(origenAlmacenQuery, [body.origen_almacen_id]);
    
    if (origenAlmacenResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'El almacén de origen especificado no existe',
        error: 'Almacén de origen inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la sucursal de destino existe si se proporciona
    if (body.destino_sucursal_id) {
      const destinoSucursalQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
      const destinoSucursalResult = await pool.query(destinoSucursalQuery, [body.destino_sucursal_id]);
      
      if (destinoSucursalResult.rows.length === 0) {
        const response: VentasApiResponse = {
          success: false,
          message: 'La sucursal de destino especificada no existe',
          error: 'Sucursal de destino inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el almacén de destino existe si se proporciona
    if (body.destino_almacen_id) {
      const destinoAlmacenQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
      const destinoAlmacenResult = await pool.query(destinoAlmacenQuery, [body.destino_almacen_id]);
      
      if (destinoAlmacenResult.rows.length === 0) {
        const response: VentasApiResponse = {
          success: false,
          message: 'El almacén de destino especificado no existe',
          error: 'Almacén de destino inválido'
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

    // Crear nota de remisión
    const createRemisionQuery = `
      INSERT INTO nota_remision (
        fecha_remision, usuario_id, origen_almacen_id, destino_sucursal_id, 
        destino_almacen_id, tipo_remision, referencia_id, estado, observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING remision_id
    `;

    const remisionResult = await pool.query(createRemisionQuery, [
      body.fecha_remision || new Date().toISOString().split('T')[0],
      body.usuario_id,
      body.origen_almacen_id,
      body.destino_sucursal_id || null,
      body.destino_almacen_id || null,
      body.tipo_remision,
      body.referencia_id || null,
      body.estado || 'pendiente',
      body.observaciones || null
    ]);

    const newRemisionId = remisionResult.rows[0].remision_id;

    // Crear detalles de la remisión
    if (body.productos && body.productos.length > 0) {
      for (const producto of body.productos) {
        await pool.query(
          'INSERT INTO nota_remision_detalle (remision_id, producto_id, cantidad) VALUES ($1, $2, $3)',
          [
            newRemisionId, 
            producto.producto_id, 
            producto.cantidad
          ]
        );
      }
    }

    // Obtener la remisión creada con información completa
    const getRemisionQuery = `
      SELECT 
        nr.remision_id,
        nr.fecha_remision,
        nr.usuario_id,
        nr.origen_almacen_id,
        nr.destino_sucursal_id,
        nr.destino_almacen_id,
        nr.tipo_remision,
        nr.referencia_id,
        nr.estado,
        nr.observaciones,
        u.nombre as usuario_nombre,
        oa.nombre as origen_almacen_nombre,
        ds.nombre as destino_sucursal_nombre,
        da.nombre as destino_almacen_nombre
      FROM nota_remision nr
      LEFT JOIN usuarios u ON nr.usuario_id = u.usuario_id
      LEFT JOIN almacenes oa ON nr.origen_almacen_id = oa.almacen_id
      LEFT JOIN sucursales ds ON nr.destino_sucursal_id = ds.sucursal_id
      LEFT JOIN almacenes da ON nr.destino_almacen_id = da.almacen_id
      WHERE nr.remision_id = $1
    `;

    const remisionData = await pool.query(getRemisionQuery, [newRemisionId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Nota de remisión creada exitosamente',
      data: remisionData.rows[0]
    };

    // Log de auditoría
    console.log('Nota de remisión creada:', sanitizeForLog({
      remision_id: newRemisionId,
      nro_remision: generateRemisionNumber(newRemisionId),
      usuario_id: body.usuario_id,
      origen_almacen_id: body.origen_almacen_id,
      destino_sucursal_id: body.destino_sucursal_id,
      destino_almacen_id: body.destino_almacen_id,
      tipo_remision: body.tipo_remision,
      total_productos: body.productos?.length || 0,
      estado: body.estado || 'pendiente',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear nota de remisión:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/notas-remision/[id]/enviar - Enviar remisión
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const remisionId = parseInt(params.id);

    if (isNaN(remisionId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de remisión inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('enviar_notas_remision')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la remisión existe
    const existingRemisionQuery = 'SELECT remision_id, estado FROM nota_remision WHERE remision_id = $1';
    const existingRemision = await pool.query(existingRemisionQuery, [remisionId]);
    
    if (existingRemision.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Remisión no encontrada',
        error: 'Remisión no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la remisión puede ser enviada
    if (existingRemision.rows[0].estado !== 'pendiente') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden enviar remisiones pendientes',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Enviar remisión
    await pool.query(
      'UPDATE nota_remision SET estado = $1 WHERE remision_id = $2',
      ['enviado', remisionId]
    );

    const response: VentasApiResponse = {
      success: true,
      message: 'Remisión enviada exitosamente'
    };

    // Log de auditoría
    console.log('Remisión enviada:', sanitizeForLog({
      remision_id: remisionId,
      nro_remision: generateRemisionNumber(remisionId),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al enviar remisión:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
