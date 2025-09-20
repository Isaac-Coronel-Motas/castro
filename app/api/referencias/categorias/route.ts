import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateCategoriaData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  canDeleteCategoria,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  CreateCategoriaRequest, 
  ReferenciasApiResponse, 
  ReferenciasPaginationParams 
} from '@/lib/types/referencias';

// GET /api/referencias/categorias - Listar categorías
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('categorias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'nombre_categoria';
    const sort_order = searchParams.get('sort_order') || 'asc';
    const estado = searchParams.get('estado');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['c.nombre_categoria'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado !== null && estado !== undefined) {
      paramCount++;
      additionalConditions.push(`c.estado = $${paramCount}`);
      queryParams.push(estado === 'true');
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'nombre_categoria');

    // Consulta principal
    const query = `
      SELECT 
        c.categoria_id,
        c.nombre_categoria,
        c.estado,
        COUNT(p.producto_id) as productos_count,
        COUNT(*) OVER() as total_count
      FROM categorias c
      LEFT JOIN productos p ON c.categoria_id = p.categoria_id
      ${whereClause}
      GROUP BY c.categoria_id, c.nombre_categoria, c.estado
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const categorias = result.rows;
    const total = categorias.length > 0 ? parseInt(categorias[0].total_count) : 0;

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Categorías obtenidas exitosamente',
      data: categorias.map(c => {
        const { total_count, ...categoria } = c;
        return categoria;
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
    console.error('Error al obtener categorías:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/referencias/categorias - Crear categoría
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('categorias.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateCategoriaRequest = await request.json();

    // Validar datos
    const validation = validateCategoriaData(body);
    if (!validation.valid) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el nombre de la categoría no exista
    const existingCategoriaQuery = 'SELECT categoria_id FROM categorias WHERE nombre_categoria = $1';
    const existingCategoria = await pool.query(existingCategoriaQuery, [body.nombre_categoria]);
    
    if (existingCategoria.rows.length > 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Ya existe una categoría con ese nombre',
        error: 'Categoría duplicada'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Crear categoría
    const createCategoriaQuery = `
      INSERT INTO categorias (nombre_categoria, estado)
      VALUES ($1, $2)
      RETURNING categoria_id
    `;

    const categoriaResult = await pool.query(createCategoriaQuery, [
      body.nombre_categoria,
      body.estado !== undefined ? body.estado : true
    ]);

    const newCategoriaId = categoriaResult.rows[0].categoria_id;

    // Obtener la categoría creada
    const getCategoriaQuery = `
      SELECT 
        c.categoria_id,
        c.nombre_categoria,
        c.estado,
        COUNT(p.producto_id) as productos_count
      FROM categorias c
      LEFT JOIN productos p ON c.categoria_id = p.categoria_id
      WHERE c.categoria_id = $1
      GROUP BY c.categoria_id, c.nombre_categoria, c.estado
    `;

    const categoriaData = await pool.query(getCategoriaQuery, [newCategoriaId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Categoría creada exitosamente',
      data: categoriaData.rows[0]
    };

    // Log de auditoría
    console.log('Categoría creada:', sanitizeForLog({
      categoria_id: newCategoriaId,
      nombre_categoria: body.nombre_categoria,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
