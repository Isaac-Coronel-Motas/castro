import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateMarcaData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  canDeleteMarca,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  CreateMarcaRequest, 
  ReferenciasApiResponse, 
  ReferenciasPaginationParams 
} from '@/lib/types/referencias';

// GET /api/referencias/marcas - Listar marcas
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'descripcion';
    const sort_order = searchParams.get('sort_order') || 'asc';

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['m.descripcion'];
    const { whereClause, params } = buildSearchWhereClause(searchFields, search);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'descripcion');

    // Consulta principal
    const query = `
      SELECT 
        m.marca_id,
        m.descripcion,
        COUNT(p.producto_id) as productos_count,
        COUNT(*) OVER() as total_count
      FROM marcas m
      LEFT JOIN productos p ON m.marca_id = p.marca_id
      ${whereClause}
      GROUP BY m.marca_id, m.descripcion
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const marcas = result.rows;
    const total = marcas.length > 0 ? parseInt(marcas[0].total_count) : 0;

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Marcas obtenidas exitosamente',
      data: marcas.map(m => {
        const { total_count, ...marca } = m;
        return marca;
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
    console.error('Error al obtener marcas:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/referencias/marcas - Crear marca
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateMarcaRequest = await request.json();

    // Validar datos
    const validation = validateMarcaData(body);
    if (!validation.valid) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la descripción de la marca no exista
    const existingMarcaQuery = 'SELECT marca_id FROM marcas WHERE descripcion = $1';
    const existingMarca = await pool.query(existingMarcaQuery, [body.descripcion]);
    
    if (existingMarca.rows.length > 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Ya existe una marca con esa descripción',
        error: 'Marca duplicada'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Crear marca
    const createMarcaQuery = `
      INSERT INTO marcas (descripcion)
      VALUES ($1)
      RETURNING marca_id
    `;

    const marcaResult = await pool.query(createMarcaQuery, [body.descripcion]);

    const newMarcaId = marcaResult.rows[0].marca_id;

    // Obtener la marca creada
    const getMarcaQuery = `
      SELECT 
        m.marca_id,
        m.descripcion,
        COUNT(p.producto_id) as productos_count
      FROM marcas m
      LEFT JOIN productos p ON m.marca_id = p.marca_id
      WHERE m.marca_id = $1
      GROUP BY m.marca_id, m.descripcion
    `;

    const marcaData = await pool.query(getMarcaQuery, [newMarcaId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Marca creada exitosamente',
      data: marcaData.rows[0]
    };

    // Log de auditoría
    console.log('Marca creada:', sanitizeForLog({
      marca_id: newMarcaId,
      descripcion: body.descripcion,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear marca:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
