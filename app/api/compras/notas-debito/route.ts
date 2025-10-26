import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaCreditoDebitoData, 
  buildAdvancedSearchWhereClause,
  buildAdvancedOrderByClause,
  buildPaginationParams,
  generateNotaNumber,
  sanitizeForLog 
} from '@/lib/utils/compras-adicionales';
import { 
  CreateNotaCreditoDebitoRequest, 
  ComprasAdicionalesApiResponse, 
  FiltrosNotasCreditoDebito 
} from '@/lib/types/compras-adicionales';

// GET /api/compras/notas-debito - Listar notas de débito
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_registro';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const tipo_operacion = searchParams.get('tipo_operacion');
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const proveedor_id = searchParams.get('proveedor_id');
    const cliente_id = searchParams.get('cliente_id');
    const sucursal_id = searchParams.get('sucursal_id');
    const almacen_id = searchParams.get('almacen_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['nd.nro_nota', 'nd.motivo', 'p.nombre_proveedor', 'c.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (tipo_operacion) {
      paramCount++;
      additionalConditions.push(`nd.tipo_operacion = $${paramCount}`);
      queryParams.push(tipo_operacion);
    }

    if (estado) {
      paramCount++;
      additionalConditions.push(`nd.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`nd.fecha_registro >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`nd.fecha_registro <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (proveedor_id) {
      paramCount++;
      additionalConditions.push(`nd.proveedor_id = $${paramCount}`);
      queryParams.push(parseInt(proveedor_id));
    }

    if (cliente_id) {
      paramCount++;
      additionalConditions.push(`nd.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`nd.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    if (almacen_id) {
      paramCount++;
      additionalConditions.push(`nd.almacen_id = $${paramCount}`);
      queryParams.push(parseInt(almacen_id));
    }

    const { whereClause, params } = buildAdvancedSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildAdvancedOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_registro', 'nota_debito');

    // Consulta principal
    const query = `
      SELECT 
        nd.nota_debito_id,
        nd.tipo_operacion,
        nd.proveedor_id,
        nd.cliente_id,
        nd.sucursal_id,
        nd.almacen_id,
        nd.usuario_id,
        nd.fecha_registro,
        nd.nro_nota,
        nd.motivo,
        nd.estado,
        nd.referencia_id,
        nd.monto_nd,
        nd.monto_gravada_5,
        nd.monto_gravada_10,
        nd.monto_exenta,
        nd.monto_iva,
        p.nombre_proveedor as proveedor_nombre,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre,
        COUNT(ndd.nota_debito_detalle_id) as total_items,
        COALESCE(SUM(ndd.cantidad * ndd.precio_unitario), 0) as monto_total_items,
        CASE 
          WHEN nd.tipo_operacion = 'compra' THEN 'Compra'
          WHEN nd.tipo_operacion = 'venta' THEN 'Venta'
        END as tipo_operacion_display,
        CASE 
          WHEN nd.estado = 'activo' THEN 'Activo'
          WHEN nd.estado = 'anulado' THEN 'Anulado'
        END as estado_display,
        COUNT(*) OVER() as total_count
      FROM nota_debito_cabecera nd
      LEFT JOIN proveedores p ON nd.proveedor_id = p.proveedor_id
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON nd.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nd.almacen_id = a.almacen_id
      LEFT JOIN nota_debito_detalle ndd ON nd.nota_debito_id = ndd.nota_debito_id
      ${whereClause}
      GROUP BY nd.nota_debito_id, nd.tipo_operacion, nd.proveedor_id, nd.cliente_id, 
               nd.sucursal_id, nd.almacen_id, nd.usuario_id, nd.fecha_registro, 
               nd.nro_nota, nd.motivo, nd.estado, nd.referencia_id, nd.monto_nd, 
               nd.monto_gravada_5, nd.monto_gravada_10, nd.monto_exenta, nd.monto_iva, 
               p.nombre_proveedor, c.nombre, u.nombre, s.nombre, a.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const notas = result.rows;
    const total = notas.length > 0 ? parseInt(notas[0].total_count) : 0;

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Notas de débito obtenidas exitosamente',
      data: notas.map(n => {
        const { total_count, ...nota } = n;
        return nota;
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
    console.error('Error al obtener notas de débito:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/compras/notas-debito - Crear nota de débito
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateNotaCreditoDebitoRequest = await request.json();

    // Validar datos
    const validation = validateNotaCreditoDebitoData(body);
    if (!validation.valid) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el proveedor existe si se proporciona
    if (body.proveedor_id) {
      const proveedorQuery = 'SELECT proveedor_id FROM proveedores WHERE proveedor_id = $1';
      const proveedorResult = await pool.query(proveedorQuery, [body.proveedor_id]);
      
      if (proveedorResult.rows.length === 0) {
        const response: ComprasAdicionalesApiResponse = {
          success: false,
          message: 'El proveedor especificado no existe',
          error: 'Proveedor inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el cliente existe si se proporciona
    if (body.cliente_id) {
      const clienteQuery = 'SELECT cliente_id FROM clientes WHERE cliente_id = $1';
      const clienteResult = await pool.query(clienteQuery, [body.cliente_id]);
      
      if (clienteResult.rows.length === 0) {
        const response: ComprasAdicionalesApiResponse = {
          success: false,
          message: 'El cliente especificado no existe',
          error: 'Cliente inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que la sucursal existe
    const sucursalQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
    const sucursalResult = await pool.query(sucursalQuery, [body.sucursal_id]);
    
    if (sucursalResult.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'La sucursal especificada no existe',
        error: 'Sucursal inválida'
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

    // Verificar que los productos existen
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        const productoQuery = 'SELECT producto_id FROM productos WHERE producto_id = $1 AND estado = true';
        const productoResult = await pool.query(productoQuery, [item.producto_id]);
        
        if (productoResult.rows.length === 0) {
          const response: ComprasAdicionalesApiResponse = {
            success: false,
            message: `El producto con ID ${item.producto_id} no existe o está inactivo`,
            error: 'Producto inválido'
          };
          return NextResponse.json(response, { status: 400 });
        }
      }
    }

    // Crear nota de débito
    const createNotaQuery = `
      INSERT INTO nota_debito_cabecera (
        tipo_operacion, proveedor_id, cliente_id, sucursal_id, almacen_id, 
        usuario_id, fecha_registro, nro_nota, motivo, estado, referencia_id, 
        monto_nd, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING nota_debito_id
    `;

    const notaResult = await pool.query(createNotaQuery, [
      body.tipo_operacion,
      body.proveedor_id || null,
      body.cliente_id || null,
      body.sucursal_id,
      body.almacen_id,
      body.usuario_id,
      body.fecha_registro || new Date().toISOString().split('T')[0],
      generateNotaNumber(body.tipo_operacion, 1), // Se actualizará después
      body.motivo || null,
      body.estado || 'activo',
      body.referencia_id,
      body.monto_nc || null,
      body.monto_gravada_5 || 0,
      body.monto_gravada_10 || 0,
      body.monto_exenta || 0,
      body.monto_iva || 0
    ]);

    const newNotaId = notaResult.rows[0].nota_debito_id;

    // Actualizar número de nota
    const nroNota = generateNotaNumber(body.tipo_operacion, newNotaId);
    await pool.query(
      'UPDATE nota_debito_cabecera SET nro_nota = $1 WHERE nota_debito_id = $2',
      [nroNota, newNotaId]
    );

    // Crear detalles de la nota
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO nota_debito_detalle (nota_debito_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [newNotaId, item.producto_id, item.cantidad, item.precio_unitario || 0]
        );
      }
    }

    // Calcular monto total si no se proporcionó
    if (!body.monto_nc && body.items && body.items.length > 0) {
      const montoTotal = body.items.reduce((sum, item) => 
        sum + (item.cantidad * (item.precio_unitario || 0)), 0
      );
      await pool.query(
        'UPDATE nota_debito_cabecera SET monto_nd = $1 WHERE nota_debito_id = $2',
        [montoTotal, newNotaId]
      );
    }

    // Obtener la nota creada con información completa
    const getNotaQuery = `
      SELECT 
        nd.nota_debito_id,
        nd.tipo_operacion,
        nd.proveedor_id,
        nd.cliente_id,
        nd.sucursal_id,
        nd.almacen_id,
        nd.usuario_id,
        nd.fecha_registro,
        nd.nro_nota,
        nd.motivo,
        nd.estado,
        nd.referencia_id,
        nd.monto_nd,
        nd.monto_gravada_5,
        nd.monto_gravada_10,
        nd.monto_exenta,
        nd.monto_iva,
        p.nombre_proveedor as proveedor_nombre,
        c.nombre as cliente_nombre,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre
      FROM nota_debito_cabecera nd
      LEFT JOIN proveedores p ON nd.proveedor_id = p.proveedor_id
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON nd.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nd.almacen_id = a.almacen_id
      WHERE nd.nota_debito_id = $1
    `;

    const notaData = await pool.query(getNotaQuery, [newNotaId]);

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Nota de débito creada exitosamente',
      data: notaData.rows[0]
    };

    // Log de auditoría
    console.log('Nota de débito creada:', sanitizeForLog({
      nota_debito_id: newNotaId,
      nro_nota: nroNota,
      tipo_operacion: body.tipo_operacion,
      proveedor_id: body.proveedor_id,
      cliente_id: body.cliente_id,
      total_items: body.items?.length || 0,
      monto_nd: body.monto_nc,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear nota de débito:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}