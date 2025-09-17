import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateAjusteInventarioData, 
  buildAdvancedSearchWhereClause,
  buildAdvancedOrderByClause,
  buildPaginationParams,
  determineMovementType,
  sanitizeForLog 
} from '@/lib/utils/compras-adicionales';
import { 
  CreateAjusteInventarioRequest, 
  ComprasAdicionalesApiResponse, 
  FiltrosAjustesInventario 
} from '@/lib/types/compras-adicionales';

// GET /api/compras/ajustes-inventario - Listar ajustes de inventario
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_ajustes_inventario')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const motivo_id = searchParams.get('motivo_id');
    const almacen_id = searchParams.get('almacen_id');
    const usuario_id = searchParams.get('usuario_id');
    const tipo_movimiento = searchParams.get('tipo_movimiento');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['ai.observaciones', 'ma.descripcion', 'u.nombre', 'a.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`ai.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`DATE(ai.fecha) >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`DATE(ai.fecha) <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (motivo_id) {
      paramCount++;
      additionalConditions.push(`ai.motivo_id = $${paramCount}`);
      queryParams.push(parseInt(motivo_id));
    }

    if (almacen_id) {
      paramCount++;
      additionalConditions.push(`ai.almacen_id = $${paramCount}`);
      queryParams.push(parseInt(almacen_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`ai.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    const { whereClause, params } = buildAdvancedSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildAdvancedOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha');

    // Consulta principal
    const query = `
      SELECT 
        ai.ajuste_id,
        ai.fecha,
        ai.usuario_id,
        ai.motivo_id,
        ai.observaciones,
        ai.almacen_id,
        ai.estado,
        u.nombre as usuario_nombre,
        ma.descripcion as motivo_descripcion,
        a.nombre as almacen_nombre,
        COUNT(aid.detalle_id) as total_productos,
        COALESCE(SUM(ABS(aid.cantidad_ajustada) * COALESCE(p.precio_costo, 0)), 0) as valor_total,
        CONCAT('AJ-', LPAD(ai.ajuste_id::text, 3, '0')) as codigo_ajuste,
        COUNT(*) OVER() as total_count
      FROM ajustes_inventario ai
      LEFT JOIN usuarios u ON ai.usuario_id = u.usuario_id
      LEFT JOIN motivo_ajuste ma ON ai.motivo_id = ma.motivo_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      LEFT JOIN ajustes_inventario_detalle aid ON ai.ajuste_id = aid.ajuste_id
      LEFT JOIN productos p ON aid.producto_id = p.producto_id
      ${whereClause}
      GROUP BY ai.ajuste_id, ai.fecha, ai.usuario_id, ai.motivo_id, 
               ai.observaciones, ai.almacen_id, ai.estado, u.nombre, 
               ma.descripcion, a.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const ajustes = result.rows;
    const total = ajustes.length > 0 ? parseInt(ajustes[0].total_count) : 0;

    // Filtrar por tipo de movimiento si se especifica
    let ajustesFiltrados = ajustes;
    if (tipo_movimiento) {
      // Obtener detalles para filtrar por tipo de movimiento
      const ajustesConDetalles = await Promise.all(
        ajustes.map(async (ajuste) => {
          const detallesQuery = `
            SELECT 
              aid.detalle_id,
              aid.ajuste_id,
              aid.producto_id,
              aid.cantidad_ajustada,
              aid.comentario,
              p.nombre_producto as producto_nombre,
              p.cod_product as producto_codigo,
              p.precio_costo,
              CASE 
                WHEN aid.cantidad_ajustada > 0 THEN 'entrada'
                WHEN aid.cantidad_ajustada < 0 THEN 'salida'
                ELSE 'correccion'
              END as tipo_movimiento
            FROM ajustes_inventario_detalle aid
            LEFT JOIN productos p ON aid.producto_id = p.producto_id
            WHERE aid.ajuste_id = $1
          `;
          
          const detalles = await pool.query(detallesQuery, [ajuste.ajuste_id]);
          const tieneTipoMovimiento = detalles.rows.some(detalle => 
            detalle.tipo_movimiento === tipo_movimiento
          );
          
          return tieneTipoMovimiento ? ajuste : null;
        })
      );
      
      ajustesFiltrados = ajustesConDetalles.filter(ajuste => ajuste !== null);
    }

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Ajustes de inventario obtenidos exitosamente',
      data: ajustesFiltrados.map(a => {
        const { total_count, ...ajuste } = a;
        return ajuste;
      }),
      pagination: {
        page,
        limit: limitParam,
        total: ajustesFiltrados.length,
        total_pages: Math.ceil(ajustesFiltrados.length / limitParam)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener ajustes de inventario:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/compras/ajustes-inventario - Crear ajuste de inventario
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_ajustes_inventario')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateAjusteInventarioRequest = await request.json();

    // Validar datos
    const validation = validateAjusteInventarioData(body);
    if (!validation.valid) {
      const response: ComprasAdicionalesApiResponse = {
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
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'El usuario especificado no existe',
        error: 'Usuario inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el motivo existe
    const motivoQuery = 'SELECT motivo_id FROM motivo_ajuste WHERE motivo_id = $1';
    const motivoResult = await pool.query(motivoQuery, [body.motivo_id]);
    
    if (motivoResult.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'El motivo especificado no existe',
        error: 'Motivo inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el almacén existe
    const almacenQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
    const almacenResult = await pool.query(almacenQuery, [body.almacen_id]);
    
    if (almacenResult.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'El almacén especificado no existe',
        error: 'Almacén inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que los productos existen y obtener stock actual
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        const productoQuery = 'SELECT producto_id, stock FROM productos WHERE producto_id = $1 AND estado = true';
        const productoResult = await pool.query(productoQuery, [item.producto_id]);
        
        if (productoResult.rows.length === 0) {
          const response: ComprasAdicionalesApiResponse = {
            success: false,
            message: `El producto con ID ${item.producto_id} no existe o está inactivo`,
            error: 'Producto inválido'
          };
          return NextResponse.json(response, { status: 400 });
        }

        // Verificar que el ajuste no resulte en stock negativo
        const stockActual = parseFloat(productoResult.rows[0].stock);
        const nuevoStock = stockActual + item.cantidad_ajustada;
        
        if (nuevoStock < 0) {
          const response: ComprasAdicionalesApiResponse = {
            success: false,
            message: `El ajuste resultaría en stock negativo para el producto ${item.producto_id}. Stock actual: ${stockActual}, Ajuste: ${item.cantidad_ajustada}`,
            error: 'Stock insuficiente'
          };
          return NextResponse.json(response, { status: 400 });
        }
      }
    }

    // Crear ajuste de inventario
    const createAjusteQuery = `
      INSERT INTO ajustes_inventario (
        usuario_id, motivo_id, observaciones, almacen_id, estado
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING ajuste_id
    `;

    const ajusteResult = await pool.query(createAjusteQuery, [
      body.usuario_id,
      body.motivo_id,
      body.observaciones || null,
      body.almacen_id,
      body.estado || 'borrador'
    ]);

    const newAjusteId = ajusteResult.rows[0].ajuste_id;

    // Crear detalles del ajuste y actualizar stock
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        // Crear detalle del ajuste
        await pool.query(
          'INSERT INTO ajustes_inventario_detalle (ajuste_id, producto_id, cantidad_ajustada, comentario) VALUES ($1, $2, $3, $4)',
          [newAjusteId, item.producto_id, item.cantidad_ajustada, item.comentario || null]
        );

        // Actualizar stock del producto
        await pool.query(
          'UPDATE productos SET stock = stock + $1 WHERE producto_id = $2',
          [item.cantidad_ajustada, item.producto_id]
        );

        // Registrar movimiento en el log de inventario
        await pool.query(
          'INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, motivo, usuario_id, fecha) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            item.producto_id,
            determineMovementType(item.cantidad_ajustada),
            Math.abs(item.cantidad_ajustada),
            `Ajuste de inventario - ${body.referencia || 'N/A'}`,
            body.usuario_id,
            new Date().toISOString()
          ]
        );
      }
    }

    // Obtener el ajuste creado con información completa
    const getAjusteQuery = `
      SELECT 
        ai.ajuste_id,
        ai.fecha,
        ai.usuario_id,
        ai.motivo_id,
        ai.observaciones,
        ai.almacen_id,
        ai.estado,
        u.nombre as usuario_nombre,
        ma.descripcion as motivo_descripcion,
        a.nombre as almacen_nombre,
        CONCAT('AJ-', LPAD(ai.ajuste_id::text, 3, '0')) as codigo_ajuste
      FROM ajustes_inventario ai
      LEFT JOIN usuarios u ON ai.usuario_id = u.usuario_id
      LEFT JOIN motivo_ajuste ma ON ai.motivo_id = ma.motivo_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      WHERE ai.ajuste_id = $1
    `;

    const ajusteData = await pool.query(getAjusteQuery, [newAjusteId]);

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Ajuste de inventario creado exitosamente',
      data: ajusteData.rows[0]
    };

    // Log de auditoría
    console.log('Ajuste de inventario creado:', sanitizeForLog({
      ajuste_id: newAjusteId,
      usuario_id: body.usuario_id,
      motivo_id: body.motivo_id,
      almacen_id: body.almacen_id,
      total_productos: body.items?.length || 0,
      estado: body.estado || 'borrador',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear ajuste de inventario:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
