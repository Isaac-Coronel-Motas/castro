import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateNotaDebitoCompraData, 
  buildAdvancedSearchWhereClause,
  buildAdvancedOrderByClause,
  buildPaginationParams,
  generateNotaNumber,
  sanitizeForLog 
} from '@/lib/utils/compras-adicionales';
import { 
  CreateNotaDebitoCompraRequest, 
  ComprasAdicionalesApiResponse, 
  FiltrosNotasDebitoCompra 
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
    const limit = parseInt(searchParams.get('limit') || '10');
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
    const orderByClause = buildAdvancedOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'fecha_registro');

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
        nd.monto_exento,
        nd.total_iva,
        nd.total_nota,
        p.nombre_proveedor,
        c.nombre as cliente_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre,
        u.nombre as usuario_nombre,
        CASE 
          WHEN nd.estado = 'activo' THEN 'Activa'
          WHEN nd.estado = 'anulada' THEN 'Anulada'
          ELSE nd.estado
        END as estado_display,
        COUNT(*) OVER() as total_count
      FROM nota_debito_cabecera nd
      LEFT JOIN proveedores p ON nd.proveedor_id = p.proveedor_id
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON nd.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nd.almacen_id = a.almacen_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const notasDebito = result.rows;
    const total = notasDebito.length > 0 ? parseInt(notasDebito[0].total_count) : 0;

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Notas de débito obtenidas exitosamente',
      data: notasDebito.map(nd => {
        const { total_count, ...notaDebito } = nd;
        return notaDebito;
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

    const body: CreateNotaDebitoCompraRequest = await request.json();

    // Validar datos
    const validation = validateNotaDebitoCompraData(body);
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
      const clienteQuery = 'SELECT cliente_id FROM clientes WHERE cliente_id = $1 AND estado = true';
      const clienteResult = await pool.query(clienteQuery, [body.cliente_id]);
      
      if (clienteResult.rows.length === 0) {
        const response: ComprasAdicionalesApiResponse = {
          success: false,
          message: 'El cliente especificado no existe o está inactivo',
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

    // Generar número de nota
    const nroNota = await generateNotaNumber('ND');

    // Crear nota de débito
    const createNotaQuery = `
      INSERT INTO nota_debito_cabecera (
        tipo_operacion, proveedor_id, cliente_id, sucursal_id, almacen_id, 
        usuario_id, fecha_registro, nro_nota, motivo, estado, referencia_id,
        monto_nd, monto_gravada_5, monto_gravada_10, monto_exento, total_iva, total_nota
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
      nroNota,
      body.motivo,
      body.estado || 'activo',
      body.referencia_id,
      body.monto_nd || 0,
      body.monto_gravada_5 || 0,
      body.monto_gravada_10 || 0,
      body.monto_exento || 0,
      body.total_iva || 0,
      body.total_nota || 0
    ]);

    const newNotaId = notaResult.rows[0].nota_debito_id;

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
        nd.monto_exento,
        nd.total_iva,
        nd.total_nota,
        p.nombre_proveedor,
        c.nombre as cliente_nombre,
        s.nombre as sucursal_nombre,
        a.nombre as almacen_nombre,
        u.nombre as usuario_nombre
      FROM nota_debito_cabecera nd
      LEFT JOIN proveedores p ON nd.proveedor_id = p.proveedor_id
      LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON nd.sucursal_id = s.sucursal_id
      LEFT JOIN almacenes a ON nd.almacen_id = a.almacen_id
      LEFT JOIN usuarios u ON nd.usuario_id = u.usuario_id
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
      monto_nd: body.monto_nd,
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
