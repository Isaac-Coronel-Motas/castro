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

// GET /api/ventas/notas-remision - Listar notas de remisión
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
    const sort_by = searchParams.get('sort_by') || 'fecha_remision';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const tipo_remision = searchParams.get('tipo_remision');
    const usuario_id = searchParams.get('usuario_id');
    const origen_almacen_id = searchParams.get('origen_almacen_id');
    const destino_sucursal_id = searchParams.get('destino_sucursal_id');
    const destino_almacen_id = searchParams.get('destino_almacen_id');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['nr.observaciones', 'u.nombre', 'oa.nombre', 'ds.nombre', 'da.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`nr.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (tipo_remision) {
      paramCount++;
      additionalConditions.push(`nr.tipo_remision = $${paramCount}`);
      queryParams.push(tipo_remision);
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
        CONCAT('REM-', LPAD(nr.remision_id::text, 4, '0')) as codigo_remision,
        COALESCE(detalle_stats.total_productos, 0) as total_productos,
        COALESCE(detalle_stats.total_cantidad, 0) as total_cantidad,
        COUNT(*) OVER() as total_count
      FROM nota_remision nr
      LEFT JOIN usuarios u ON nr.usuario_id = u.usuario_id
      LEFT JOIN almacenes oa ON nr.origen_almacen_id = oa.almacen_id
      LEFT JOIN sucursales ds ON nr.destino_sucursal_id = ds.sucursal_id
      LEFT JOIN almacenes da ON nr.destino_almacen_id = da.almacen_id
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const notasRemision = result.rows;
    const total = notasRemision.length > 0 ? parseInt(notasRemision[0].total_count) : 0;

    const response = {
      success: true,
      message: 'Notas de remisión obtenidas exitosamente',
      data: notasRemision.map(nr => {
        const { total_count, ...notaRemision } = nr;
        return notaRemision;
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
    
    const response = {
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
    const { authorized, error } = requirePermission('crear_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();
    const { 
      fecha_remision, 
      usuario_id, 
      origen_almacen_id, 
      destino_sucursal_id, 
      destino_almacen_id, 
      tipo_remision, 
      referencia_id, 
      nro_timbrado,
      observaciones,
      detalles = []
    } = body;

    // Validar datos requeridos
    if (!usuario_id) {
      const response = {
        success: false,
        message: 'El usuario es requerido',
        error: 'Datos inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!origen_almacen_id) {
      const response = {
        success: false,
        message: 'El almacén de origen es requerido',
        error: 'Datos inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!tipo_remision) {
      const response = {
        success: false,
        message: 'El tipo de remisión es requerido',
        error: 'Datos inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validar tipo de remisión y destino
    if (tipo_remision === 'compra' || tipo_remision === 'venta') {
      if (!destino_sucursal_id) {
        const response = {
          success: false,
          message: 'La sucursal de destino es requerida para este tipo de remisión',
          error: 'Datos inválidos'
        };
        return NextResponse.json(response, { status: 400 });
      }
    } else if (tipo_remision === 'transferencia') {
      if (!destino_almacen_id) {
        const response = {
          success: false,
          message: 'El almacén de destino es requerido para transferencias',
          error: 'Datos inválidos'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el usuario existe
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

    // Verificar que el almacén de origen existe
    const origenQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
    const origenResult = await pool.query(origenQuery, [origen_almacen_id]);
    
    if (origenResult.rows.length === 0) {
      const response = {
        success: false,
        message: 'El almacén de origen especificado no existe',
        error: 'Almacén inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar destino según el tipo
    if (destino_sucursal_id) {
      const destinoQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
      const destinoResult = await pool.query(destinoQuery, [destino_sucursal_id]);
      
      if (destinoResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'La sucursal de destino especificada no existe',
          error: 'Sucursal inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    if (destino_almacen_id) {
      const destinoQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
      const destinoResult = await pool.query(destinoQuery, [destino_almacen_id]);
      
      if (destinoResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'El almacén de destino especificado no existe',
          error: 'Almacén inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Iniciar transacción
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Crear nota de remisión
      const createNotaQuery = `
        INSERT INTO nota_remision (
          fecha_remision, usuario_id, origen_almacen_id, destino_sucursal_id, 
          destino_almacen_id, tipo_remision, referencia_id, nro_timbrado, estado, observaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING remision_id
      `;

      const notaResult = await client.query(createNotaQuery, [
        fecha_remision || new Date().toISOString().split('T')[0],
        usuario_id,
        origen_almacen_id,
        destino_sucursal_id || null,
        destino_almacen_id || null,
        tipo_remision,
        referencia_id || null,
        nro_timbrado || null,
        'activo',
        observaciones || null
      ]);

      const newNotaId = notaResult.rows[0].remision_id;

      // Crear detalles si existen
      if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
          // Verificar que el producto existe
          const productoQuery = 'SELECT producto_id FROM productos WHERE producto_id = $1';
          const productoResult = await client.query(productoQuery, [detalle.producto_id]);
          
          if (productoResult.rows.length === 0) {
            throw new Error(`El producto con ID ${detalle.producto_id} no existe`);
          }

          // Crear detalle
          const createDetalleQuery = `
            INSERT INTO nota_remision_detalle (remision_id, producto_id, cantidad)
            VALUES ($1, $2, $3)
          `;
          
          await client.query(createDetalleQuery, [
            newNotaId,
            detalle.producto_id,
            detalle.cantidad
          ]);
        }
      }

      await client.query('COMMIT');

      // Obtener la nota creada con información completa
      const getNotaQuery = `
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
          CONCAT('REM-', LPAD(nr.remision_id::text, 4, '0')) as codigo_remision,
          COALESCE(detalle_stats.total_productos, 0) as total_productos,
          COALESCE(detalle_stats.total_cantidad, 0) as total_cantidad
        FROM nota_remision nr
        LEFT JOIN usuarios u ON nr.usuario_id = u.usuario_id
        LEFT JOIN almacenes oa ON nr.origen_almacen_id = oa.almacen_id
        LEFT JOIN sucursales ds ON nr.destino_sucursal_id = ds.sucursal_id
        LEFT JOIN almacenes da ON nr.destino_almacen_id = da.almacen_id
        LEFT JOIN (
          SELECT 
            remision_id,
            COUNT(*) as total_productos,
            SUM(cantidad) as total_cantidad
          FROM nota_remision_detalle
          GROUP BY remision_id
        ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
        WHERE nr.remision_id = $1
      `;

      const notaData = await pool.query(getNotaQuery, [newNotaId]);

      const response = {
        success: true,
        message: 'Nota de remisión creada exitosamente',
        data: notaData.rows[0]
      };

      // Log de auditoría
      console.log('Nota de remisión creada:', sanitizeForLog({
        remision_id: newNotaId,
        tipo_remision,
        usuario_id,
        origen_almacen_id,
        destino_sucursal_id,
        destino_almacen_id,
        total_detalles: detalles.length,
        timestamp: new Date().toISOString()
      }));

      return NextResponse.json(response, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error al crear nota de remisión:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}