import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateTransferenciaStockData, 
  buildAdvancedSearchWhereClause,
  buildAdvancedOrderByClause,
  buildPaginationParams,
  generateTransferCode,
  canCompleteTransfer,
  sanitizeForLog 
} from '@/lib/utils/compras-adicionales';
import { 
  CreateTransferenciaStockRequest, 
  ComprasAdicionalesApiResponse, 
  FiltrosTransferencias 
} from '@/lib/types/compras-adicionales';

// GET /api/compras/transferencias - Listar transferencias de stock
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_transferencias')(request);
    
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
    const almacen_origen_id = searchParams.get('almacen_origen_id');
    const almacen_destino_id = searchParams.get('almacen_destino_id');
    const usuario_id = searchParams.get('usuario_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['ts.motivo', 'u.nombre', 'ao.nombre', 'ad.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`ts.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`ts.fecha >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`ts.fecha <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (almacen_origen_id) {
      paramCount++;
      additionalConditions.push(`ts.almacen_origen_id = $${paramCount}`);
      queryParams.push(parseInt(almacen_origen_id));
    }

    if (almacen_destino_id) {
      paramCount++;
      additionalConditions.push(`ts.almacen_destino_id = $${paramCount}`);
      queryParams.push(parseInt(almacen_destino_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`ts.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    const { whereClause, params } = buildAdvancedSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildAdvancedOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha');

    // Consulta principal
    const query = `
      SELECT 
        ts.transferencia_id,
        ts.fecha,
        ts.usuario_id,
        ts.almacen_origen_id,
        ts.almacen_destino_id,
        ts.estado,
        ts.motivo,
        u.nombre as usuario_nombre,
        ao.nombre as almacen_origen_nombre,
        ad.nombre as almacen_destino_nombre,
        COUNT(tsd.transferencia_detalle_id) as total_productos,
        COALESCE(SUM(tsd.cantidad * COALESCE(p.precio_costo, 0)), 0) as valor_total,
        CONCAT('TRF-', LPAD(ts.transferencia_id::text, 3, '0')) as codigo_transferencia,
        CASE 
          WHEN ts.estado = 'pendiente' THEN 'Pendiente'
          WHEN ts.estado = 'en_transito' THEN 'En Tránsito'
          WHEN ts.estado = 'completada' THEN 'Completada'
          WHEN ts.estado = 'cancelada' THEN 'Cancelada'
        END as estado_display,
        CASE 
          WHEN ts.estado = 'pendiente' THEN 'Pendiente'
          WHEN ts.estado = 'en_transito' THEN 'En Tránsito'
          WHEN ts.estado = 'completada' THEN 'Completada'
          WHEN ts.estado = 'cancelada' THEN 'Cancelada'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM transferencia_stock ts
      LEFT JOIN usuarios u ON ts.usuario_id = u.usuario_id
      LEFT JOIN almacenes ao ON ts.almacen_origen_id = ao.almacen_id
      LEFT JOIN almacenes ad ON ts.almacen_destino_id = ad.almacen_id
      LEFT JOIN transferencia_stock_detalle tsd ON ts.transferencia_id = tsd.transferencia_id
      LEFT JOIN productos p ON tsd.producto_id = p.producto_id
      ${whereClause}
      GROUP BY ts.transferencia_id, ts.fecha, ts.usuario_id, ts.almacen_origen_id, 
               ts.almacen_destino_id, ts.estado, ts.motivo, u.nombre, 
               ao.nombre, ad.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const transferencias = result.rows;
    const total = transferencias.length > 0 ? parseInt(transferencias[0].total_count) : 0;

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Transferencias de stock obtenidas exitosamente',
      data: transferencias.map(t => {
        const { total_count, ...transferencia } = t;
        return transferencia;
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
    console.error('Error al obtener transferencias de stock:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/compras/transferencias - Crear transferencia de stock
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_transferencias')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateTransferenciaStockRequest = await request.json();

    // Validar datos
    const validation = validateTransferenciaStockData(body);
    if (!validation.valid) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que los almacenes existen
    if (body.almacen_origen_id) {
      const almacenOrigenQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
      const almacenOrigenResult = await pool.query(almacenOrigenQuery, [body.almacen_origen_id]);
      
      if (almacenOrigenResult.rows.length === 0) {
        const response: ComprasAdicionalesApiResponse = {
          success: false,
          message: 'El almacén de origen especificado no existe',
          error: 'Almacén origen inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    if (body.almacen_destino_id) {
      const almacenDestinoQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
      const almacenDestinoResult = await pool.query(almacenDestinoQuery, [body.almacen_destino_id]);
      
      if (almacenDestinoResult.rows.length === 0) {
        const response: ComprasAdicionalesApiResponse = {
          success: false,
          message: 'El almacén de destino especificado no existe',
          error: 'Almacén destino inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el usuario existe si se proporciona
    if (body.usuario_id) {
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
    }

    // Verificar que los productos existen y tienen stock suficiente
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

        // Verificar stock disponible si hay almacén de origen
        if (body.almacen_origen_id) {
          const stockQuery = `
            SELECT COALESCE(SUM(cantidad), 0) as stock_disponible 
            FROM stock 
            WHERE producto_id = $1 AND almacen_id = $2
          `;
          const stockResult = await pool.query(stockQuery, [item.producto_id, body.almacen_origen_id]);
          const stockDisponible = parseFloat(stockResult.rows[0].stock_disponible);
          
          if (stockDisponible < item.cantidad) {
            const response: ComprasAdicionalesApiResponse = {
              success: false,
              message: `Stock insuficiente para el producto ${item.producto_id}. Stock disponible: ${stockDisponible}, Cantidad solicitada: ${item.cantidad}`,
              error: 'Stock insuficiente'
            };
            return NextResponse.json(response, { status: 400 });
          }
        }
      }
    }

    // Crear transferencia de stock
    const createTransferenciaQuery = `
      INSERT INTO transferencia_stock (
        fecha, usuario_id, almacen_origen_id, almacen_destino_id, estado, motivo
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING transferencia_id
    `;

    const transferenciaResult = await pool.query(createTransferenciaQuery, [
      body.fecha || new Date().toISOString().split('T')[0],
      body.usuario_id || null,
      body.almacen_origen_id || null,
      body.almacen_destino_id || null,
      body.estado || 'pendiente',
      body.motivo || null
    ]);

    const newTransferenciaId = transferenciaResult.rows[0].transferencia_id;

    // Crear detalles de la transferencia
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO transferencia_stock_detalle (transferencia_id, producto_id, cantidad, observaciones) VALUES ($1, $2, $3, $4)',
          [newTransferenciaId, item.producto_id, item.cantidad, item.observaciones || null]
        );
      }
    }

    // Obtener la transferencia creada con información completa
    const getTransferenciaQuery = `
      SELECT 
        ts.transferencia_id,
        ts.fecha,
        ts.usuario_id,
        ts.almacen_origen_id,
        ts.almacen_destino_id,
        ts.estado,
        ts.motivo,
        u.nombre as usuario_nombre,
        ao.nombre as almacen_origen_nombre,
        ad.nombre as almacen_destino_nombre,
        CONCAT('TRF-', LPAD(ts.transferencia_id::text, 3, '0')) as codigo_transferencia
      FROM transferencia_stock ts
      LEFT JOIN usuarios u ON ts.usuario_id = u.usuario_id
      LEFT JOIN almacenes ao ON ts.almacen_origen_id = ao.almacen_id
      LEFT JOIN almacenes ad ON ts.almacen_destino_id = ad.almacen_id
      WHERE ts.transferencia_id = $1
    `;

    const transferenciaData = await pool.query(getTransferenciaQuery, [newTransferenciaId]);

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Transferencia de stock creada exitosamente',
      data: transferenciaData.rows[0]
    };

    // Log de auditoría
    console.log('Transferencia de stock creada:', sanitizeForLog({
      transferencia_id: newTransferenciaId,
      codigo_transferencia: generateTransferCode(newTransferenciaId),
      almacen_origen_id: body.almacen_origen_id,
      almacen_destino_id: body.almacen_destino_id,
      total_productos: body.items?.length || 0,
      estado: body.estado || 'pendiente',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear transferencia de stock:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/compras/transferencias/[id]/completar - Completar transferencia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transferenciaId = parseInt(params.id);

    if (isNaN(transferenciaId)) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'ID de transferencia inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('completar_transferencias')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la transferencia existe
    const existingTransferenciaQuery = 'SELECT transferencia_id, estado, almacen_origen_id, almacen_destino_id FROM transferencia_stock WHERE transferencia_id = $1';
    const existingTransferencia = await pool.query(existingTransferenciaQuery, [transferenciaId]);
    
    if (existingTransferencia.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Transferencia de stock no encontrada',
        error: 'Transferencia no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la transferencia puede ser completada
    if (!canCompleteTransfer(existingTransferencia.rows[0].estado)) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Solo se pueden completar transferencias en tránsito',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Obtener detalles de la transferencia
    const detallesQuery = `
      SELECT tsd.producto_id, tsd.cantidad, p.precio_costo
      FROM transferencia_stock_detalle tsd
      LEFT JOIN productos p ON tsd.producto_id = p.producto_id
      WHERE tsd.transferencia_id = $1
    `;
    const detalles = await pool.query(detallesQuery, [transferenciaId]);

    // Actualizar stock en almacenes
    for (const detalle of detalles.rows) {
      // Reducir stock del almacén de origen si existe
      if (existingTransferencia.rows[0].almacen_origen_id) {
        await pool.query(
          'UPDATE stock SET cantidad = cantidad - $1 WHERE producto_id = $2 AND almacen_id = $3',
          [detalle.cantidad, detalle.producto_id, existingTransferencia.rows[0].almacen_origen_id]
        );
      }

      // Aumentar stock del almacén de destino si existe
      if (existingTransferencia.rows[0].almacen_destino_id) {
        // Verificar si ya existe stock para este producto en el almacén de destino
        const stockExistenteQuery = 'SELECT cantidad FROM stock WHERE producto_id = $1 AND almacen_id = $2';
        const stockExistente = await pool.query(stockExistenteQuery, [detalle.producto_id, existingTransferencia.rows[0].almacen_destino_id]);
        
        if (stockExistente.rows.length > 0) {
          // Actualizar stock existente
          await pool.query(
            'UPDATE stock SET cantidad = cantidad + $1 WHERE producto_id = $2 AND almacen_id = $3',
            [detalle.cantidad, detalle.producto_id, existingTransferencia.rows[0].almacen_destino_id]
          );
        } else {
          // Crear nuevo registro de stock
          await pool.query(
            'INSERT INTO stock (producto_id, almacen_id, cantidad) VALUES ($1, $2, $3)',
            [detalle.producto_id, existingTransferencia.rows[0].almacen_destino_id, detalle.cantidad]
          );
        }
      }
    }

    // Marcar transferencia como completada
    await pool.query(
      'UPDATE transferencia_stock SET estado = $1 WHERE transferencia_id = $2',
      ['completada', transferenciaId]
    );

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Transferencia de stock completada exitosamente'
    };

    // Log de auditoría
    console.log('Transferencia de stock completada:', sanitizeForLog({
      transferencia_id: transferenciaId,
      codigo_transferencia: generateTransferCode(transferenciaId),
      total_productos: detalles.rows.length,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al completar transferencia de stock:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
