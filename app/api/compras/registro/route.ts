import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateRegistroCompraData, 
  buildAdvancedSearchWhereClause,
  buildAdvancedOrderByClause,
  buildPaginationParams,
  generateFacturaNumber,
  calculateDaysToExpiration,
  determineExpirationStatus,
  calculateParaguayanIVA,
  sanitizeForLog 
} from '@/lib/utils/compras-adicionales';
import { 
  CreateRegistroCompraRequest, 
  ComprasAdicionalesApiResponse, 
  FiltrosRegistroCompras 
} from '@/lib/types/compras-adicionales';

// GET /api/compras/registro - Listar registro de compras
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_registro_compras')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_compra';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const proveedor_id = searchParams.get('proveedor_id');
    const sucursal_id = searchParams.get('sucursal_id');
    const almacen_id = searchParams.get('almacen_id');
    const tipo_documento_id = searchParams.get('tipo_documento_id');
    const estado_vencimiento = searchParams.get('estado_vencimiento');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['cc.nro_factura', 'cc.timbrado', 'p.nombre_proveedor', 'cc.observaciones'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`cc.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`cc.fecha_compra >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`cc.fecha_compra <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (proveedor_id) {
      paramCount++;
      additionalConditions.push(`cc.proveedor_id = $${paramCount}`);
      queryParams.push(parseInt(proveedor_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`cc.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    if (almacen_id) {
      paramCount++;
      additionalConditions.push(`cc.almacen_id = $${paramCount}`);
      queryParams.push(parseInt(almacen_id));
    }

    if (tipo_documento_id) {
      paramCount++;
      additionalConditions.push(`cc.tipo_doc_id = $${paramCount}`);
      queryParams.push(parseInt(tipo_documento_id));
    }

    const { whereClause, params } = buildAdvancedSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildAdvancedOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_compra');

    // Consulta principal
    const query = `
      SELECT 
        cc.compra_id,
        cc.proveedor_id,
        cc.usuario_id,
        cc.fecha_compra,
        cc.monto_compra,
        cc.estado,
        cc.observaciones,
        cc.almacen_id,
        cc.orden_compra_id,
        cc.sucursal_id,
        cc.condicion_pago,
        cc.timbrado,
        cc.nro_factura,
        cc.fecha_comprobante,
        cc.tipo_doc_id,
        cc.monto_gravada_5,
        cc.monto_gravada_10,
        cc.monto_exenta,
        cc.monto_iva,
        p.nombre_proveedor as proveedor_nombre,
        u.nombre as usuario_nombre,
        a.nombre as almacen_nombre,
        s.nombre as sucursal_nombre,
        td.descripcion as tipo_documento_nombre,
        COUNT(dc.detalle_compra_id) as total_items,
        COALESCE(SUM(dc.cantidad * dc.precio_unitario), 0) as monto_total_items,
        cpp.cuenta_pagar_id,
        cpp.fecha_emision as fecha_emision_cuenta,
        cpp.fecha_vencimiento,
        cpp.monto_adeudado,
        cpp.saldo_pendiente,
        cpp.estado as estado_cuenta,
        CASE 
          WHEN cpp.fecha_vencimiento IS NOT NULL THEN 
            EXTRACT(DAYS FROM (cpp.fecha_vencimiento - CURRENT_DATE))
          ELSE NULL
        END as dias_vencimiento,
        CASE 
          WHEN cpp.fecha_vencimiento IS NOT NULL THEN
            CASE 
              WHEN cpp.fecha_vencimiento < CURRENT_DATE THEN 'vencida'
              WHEN cpp.fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days' THEN 'por_vencer'
              ELSE 'vigente'
            END
          ELSE 'sin_vencimiento'
        END as estado_vencimiento,
        COUNT(*) OVER() as total_count
      FROM compra_cabecera cc
      LEFT JOIN proveedores p ON cc.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON cc.usuario_id = u.usuario_id
      LEFT JOIN almacenes a ON cc.almacen_id = a.almacen_id
      LEFT JOIN sucursales s ON cc.sucursal_id = s.sucursal_id
      LEFT JOIN tipo_documento td ON cc.tipo_doc_id = td.tipo_doc_id
      LEFT JOIN detalle_compras dc ON cc.compra_id = dc.compra_id
      LEFT JOIN cuentas_por_pagar cpp ON cc.compra_id = cpp.compra_id
      ${whereClause}
      GROUP BY cc.compra_id, cc.proveedor_id, cc.usuario_id, cc.fecha_compra, 
               cc.monto_compra, cc.estado, cc.observaciones, cc.almacen_id, 
               cc.orden_compra_id, cc.sucursal_id, cc.condicion_pago, cc.timbrado, 
               cc.nro_factura, cc.fecha_comprobante, cc.tipo_doc_id, cc.monto_gravada_5, 
               cc.monto_gravada_10, cc.monto_exenta, cc.monto_iva, p.nombre_proveedor, 
               u.nombre, a.nombre, s.nombre, td.descripcion, cpp.cuenta_pagar_id, 
               cpp.fecha_emision, cpp.fecha_vencimiento, cpp.monto_adeudado, 
               cpp.saldo_pendiente, cpp.estado
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const compras = result.rows;
    const total = compras.length > 0 ? parseInt(compras[0].total_count) : 0;

    // Filtrar por estado de vencimiento si se especifica
    let comprasFiltradas = compras;
    if (estado_vencimiento) {
      comprasFiltradas = compras.filter(compra => 
        compra.estado_vencimiento === estado_vencimiento
      );
    }

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Registro de compras obtenido exitosamente',
      data: comprasFiltradas.map(c => {
        const { total_count, ...compra } = c;
        return compra;
      }),
      pagination: {
        page,
        limit: limitParam,
        total: comprasFiltradas.length,
        total_pages: Math.ceil(comprasFiltradas.length / limitParam)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener registro de compras:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/compras/registro - Crear registro de compra
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_registro_compras')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateRegistroCompraRequest = await request.json();

    // Validar datos
    const validation = validateRegistroCompraData(body);
    if (!validation.valid) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el proveedor existe
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

    // Verificar que el tipo de documento existe
    const tipoDocQuery = 'SELECT tipo_doc_id FROM tipo_documento WHERE tipo_doc_id = $1';
    const tipoDocResult = await pool.query(tipoDocQuery, [body.tipo_doc_id]);
    
    if (tipoDocResult.rows.length === 0) {
      const response: ComprasAdicionalesApiResponse = {
        success: false,
        message: 'El tipo de documento especificado no existe',
        error: 'Tipo de documento inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el almacén existe si se proporciona
    if (body.almacen_id) {
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

    // Calcular IVA si no se proporciona
    let montoIva = body.monto_iva;
    if (!montoIva && body.monto_gravada_5 !== undefined && body.monto_gravada_10 !== undefined) {
      montoIva = calculateParaguayanIVA(body.monto_gravada_5, body.monto_gravada_10);
    }

    // Crear compra
    const createCompraQuery = `
      INSERT INTO compra_cabecera (
        proveedor_id, usuario_id, fecha_compra, monto_compra, estado, observaciones,
        almacen_id, orden_compra_id, sucursal_id, condicion_pago, timbrado, nro_factura,
        fecha_comprobante, tipo_doc_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING compra_id
    `;

    const compraResult = await pool.query(createCompraQuery, [
      body.proveedor_id,
      body.usuario_id || null,
      body.fecha_compra || new Date().toISOString().split('T')[0],
      body.monto_compra,
      body.estado || 'pendiente',
      body.observaciones || null,
      body.almacen_id || null,
      body.orden_compra_id || null,
      body.sucursal_id,
      body.condicion_pago || null,
      body.timbrado || null,
      body.nro_factura || generateFacturaNumber(1), // Se actualizará después
      body.fecha_comprobante || null,
      body.tipo_doc_id,
      body.monto_gravada_5 || 0,
      body.monto_gravada_10 || 0,
      body.monto_exenta || 0,
      montoIva || 0
    ]);

    const newCompraId = compraResult.rows[0].compra_id;

    // Actualizar número de factura
    const nroFactura = generateFacturaNumber(newCompraId);
    await pool.query(
      'UPDATE compra_cabecera SET nro_factura = $1 WHERE compra_id = $2',
      [nroFactura, newCompraId]
    );

    // Crear detalles de la compra
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        await pool.query(
          'INSERT INTO detalle_compras (compra_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [newCompraId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }
    }

    // Crear cuenta por pagar si se proporciona fecha de vencimiento
    if (body.fecha_vencimiento) {
      await pool.query(
        'INSERT INTO cuentas_por_pagar (compra_id, proveedor_id, fecha_emision, fecha_vencimiento, monto_adeudado, saldo_pendiente, estado) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          newCompraId,
          body.proveedor_id,
          body.fecha_comprobante || body.fecha_compra || new Date().toISOString().split('T')[0],
          body.fecha_vencimiento,
          body.monto_compra,
          body.monto_compra,
          'pendiente'
        ]
      );
    }

    // Obtener la compra creada con información completa
    const getCompraQuery = `
      SELECT 
        cc.compra_id,
        cc.proveedor_id,
        cc.usuario_id,
        cc.fecha_compra,
        cc.monto_compra,
        cc.estado,
        cc.observaciones,
        cc.almacen_id,
        cc.orden_compra_id,
        cc.sucursal_id,
        cc.condicion_pago,
        cc.timbrado,
        cc.nro_factura,
        cc.fecha_comprobante,
        cc.tipo_doc_id,
        cc.monto_gravada_5,
        cc.monto_gravada_10,
        cc.monto_exenta,
        cc.monto_iva,
        p.nombre_proveedor as proveedor_nombre,
        u.nombre as usuario_nombre,
        a.nombre as almacen_nombre,
        s.nombre as sucursal_nombre,
        td.descripcion as tipo_documento_nombre
      FROM compra_cabecera cc
      LEFT JOIN proveedores p ON cc.proveedor_id = p.proveedor_id
      LEFT JOIN usuarios u ON cc.usuario_id = u.usuario_id
      LEFT JOIN almacenes a ON cc.almacen_id = a.almacen_id
      LEFT JOIN sucursales s ON cc.sucursal_id = s.sucursal_id
      LEFT JOIN tipo_documento td ON cc.tipo_doc_id = td.tipo_doc_id
      WHERE cc.compra_id = $1
    `;

    const compraData = await pool.query(getCompraQuery, [newCompraId]);

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Registro de compra creado exitosamente',
      data: compraData.rows[0]
    };

    // Log de auditoría
    console.log('Registro de compra creado:', sanitizeForLog({
      compra_id: newCompraId,
      nro_factura: nroFactura,
      proveedor_id: body.proveedor_id,
      monto_compra: body.monto_compra,
      total_items: body.items?.length || 0,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear registro de compra:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
