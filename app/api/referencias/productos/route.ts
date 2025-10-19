import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateProductoData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  CreateProductoRequest, 
  ReferenciasApiResponse, 
  ReferenciasPaginationParams 
} from '@/lib/types/referencias';

// GET /api/referencias/productos - Listar productos
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'producto_id';
    const sort_order = searchParams.get('sort_order') || 'asc';
    const estado = searchParams.get('estado');
    const categoria_id = searchParams.get('categoria_id');
    const marca_id = searchParams.get('marca_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['p.nombre_producto', 'p.descripcion_producto', 'p.cod_product'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado !== null && estado !== undefined) {
      paramCount++;
      additionalConditions.push(`p.estado = $${paramCount}`);
      queryParams.push(estado === 'true');
    }

    if (categoria_id) {
      paramCount++;
      additionalConditions.push(`p.categoria_id = $${paramCount}`);
      queryParams.push(categoria_id);
    }

    if (marca_id) {
      paramCount++;
      additionalConditions.push(`p.marca_id = $${paramCount}`);
      queryParams.push(marca_id);
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order, 'p.producto_id');

    // Agregar parámetros de paginación
    paramCount += params.length;
    const limitParamStr = `$${paramCount + 1}`;
    const offsetParamStr = `$${paramCount + 2}`;

    // Consulta principal - simplificada para evitar problemas con JOINs
    const query = `
      SELECT 
        p.producto_id,
        p.nombre_producto,
        p.descripcion_producto,
        p.precio_unitario,
        p.stock,
        p.categoria_id,
        p.impuesto_id,
        p.precio_costo,
        p.precio_venta,
        p.stock_minimo,
        p.stock_maximo,
        p.marca_id,
        p.unidad_id,
        p.cod_product,
        p.estado
      FROM productos p
      ${whereClause}
      ${orderByClause}
      LIMIT ${limitParamStr} OFFSET ${offsetParamStr}
    `;

    console.log('🔍 Parámetros de consulta:', {
      queryParams,
      params,
      limitParam,
      offsetParam,
      allParams: [...queryParams, ...params, limitParam, offsetParam]
    });
    
    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);

    // Consulta para contar total - simplificada
    const countQuery = `
      SELECT COUNT(*) as total
      FROM productos p
      ${whereClause}
    `;

    console.log('🔍 Consulta de conteo:', {
      countQuery,
      countParams: [...queryParams, ...params]
    });
    
    const countResult = await pool.query(countQuery, [...queryParams, ...params]);
    const total = parseInt(countResult.rows[0].total);

    const response: ReferenciasApiResponse = {
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener productos:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/referencias/productos - Crear producto
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateProductoRequest = await request.json();

    // Validar datos
    const validation = validateProductoData(body);
    if (!validation.valid) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el código de producto no exista si se proporciona
    if (body.cod_product) {
      const existingCodQuery = 'SELECT producto_id FROM productos WHERE cod_product = $1';
      const existingCod = await pool.query(existingCodQuery, [body.cod_product]);
      
      if (existingCod.rows.length > 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Ya existe un producto con ese código',
          error: 'Código duplicado'
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Verificar que la categoría existe si se proporciona
    if (body.categoria_id) {
      const categoriaQuery = 'SELECT categoria_id FROM categorias WHERE categoria_id = $1 AND estado = true';
      const categoriaResult = await pool.query(categoriaQuery, [body.categoria_id]);
      
      if (categoriaResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'La categoría especificada no existe o está inactiva',
          error: 'Categoría inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que la marca existe si se proporciona
    if (body.marca_id) {
      const marcaQuery = 'SELECT marca_id FROM marcas WHERE marca_id = $1';
      const marcaResult = await pool.query(marcaQuery, [body.marca_id]);
      
      if (marcaResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'La marca especificada no existe',
          error: 'Marca inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    console.log('🔍 Creando producto con datos:', {
      nombre_producto: body.nombre_producto,
      categoria_id: body.categoria_id,
      marca_id: body.marca_id,
      estado: body.estado !== undefined ? body.estado : true
    });

    // Crear producto
    const createProductoQuery = `
      INSERT INTO productos (
        nombre_producto, descripcion_producto, precio_unitario, stock, 
        categoria_id, impuesto_id, precio_costo, precio_venta, 
        stock_minimo, stock_maximo, marca_id, unidad_id, cod_product, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING producto_id
    `;

    console.log('🔍 Consulta SQL:', createProductoQuery);
    console.log('🔍 Parámetros:', [
      body.nombre_producto,
      body.descripcion_producto || null,
      body.precio_unitario || null,
      body.stock || 0,
      body.categoria_id || null,
      body.impuesto_id || null,
      body.precio_costo || null,
      body.precio_venta || null,
      body.stock_minimo || null,
      body.stock_maximo || null,
      body.marca_id || null,
      body.unidad_id || null,
      body.cod_product || null,
      body.estado !== undefined ? body.estado : true
    ]);

    const productoResult = await pool.query(createProductoQuery, [
      body.nombre_producto,
      body.descripcion_producto || null,
      body.precio_unitario || null,
      body.stock || 0,
      body.categoria_id || null,
      body.impuesto_id || null,
      body.precio_costo || null,
      body.precio_venta || null,
      body.stock_minimo || null,
      body.stock_maximo || null,
      body.marca_id || null,
      body.unidad_id || null,
      body.cod_product || null,
      body.estado !== undefined ? body.estado : true
    ]);

    const newProductoId = productoResult.rows[0].producto_id;

    // Obtener el producto creado - simplificado
    const getProductoQuery = `
      SELECT 
        p.producto_id,
        p.nombre_producto,
        p.descripcion_producto,
        p.precio_unitario,
        p.stock,
        p.categoria_id,
        p.impuesto_id,
        p.precio_costo,
        p.precio_venta,
        p.stock_minimo,
        p.stock_maximo,
        p.marca_id,
        p.unidad_id,
        p.cod_product,
        p.estado
      FROM productos p
      WHERE p.producto_id = $1
    `;

    const productoData = await pool.query(getProductoQuery, [newProductoId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Producto creado exitosamente',
      data: productoData.rows[0]
    };

    // Log de auditoría
    console.log('Producto creado:', sanitizeForLog({
      producto_id: newProductoId,
      nombre_producto: body.nombre_producto,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear producto:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}