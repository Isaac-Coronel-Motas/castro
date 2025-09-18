import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateServicioData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  canDeleteServicio,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  CreateServicioRequest, 
  ReferenciasApiResponse, 
  ReferenciasPaginationParams 
} from '@/lib/types/referencias';

// GET /api/referencias/servicios - Listar servicios
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_servicios')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'nombre';
    const sort_order = searchParams.get('sort_order') || 'asc';
    const tipo_serv_id = searchParams.get('tipo_serv_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['s.nombre', 's.descripcion'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (tipo_serv_id) {
      paramCount++;
      additionalConditions.push(`s.tipo_serv_id = $${paramCount}`);
      queryParams.push(parseInt(tipo_serv_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'nombre');

    // Consulta principal
    const query = `
      SELECT 
        s.servicio_id,
        s.nombre,
        s.descripcion,
        s.precio_base,
        s.tipo_serv_id,
        ts.nombre as tipo_servicio_nombre,
        ts.descripcion as tipo_servicio_descripcion,
        COUNT(*) OVER() as total_count
      FROM servicios s
      LEFT JOIN tipo_servicio ts ON s.tipo_serv_id = ts.tipo_serv_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const servicios = result.rows;
    const total = servicios.length > 0 ? parseInt(servicios[0].total_count) : 0;

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Servicios obtenidos exitosamente',
      data: servicios.map(s => {
        const { total_count, ...servicio } = s;
        return servicio;
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
    console.error('Error al obtener servicios:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/referencias/servicios - Crear servicio
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_servicios')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateServicioRequest = await request.json();

    // Validar datos
    const validation = validateServicioData(body);
    if (!validation.valid) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el tipo de servicio existe si se proporciona
    if (body.tipo_serv_id) {
      const tipoServicioQuery = 'SELECT tipo_serv_id FROM tipo_servicio WHERE tipo_serv_id = $1 AND activo = true';
      const tipoServicioResult = await pool.query(tipoServicioQuery, [body.tipo_serv_id]);
      
      if (tipoServicioResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'El tipo de servicio especificado no existe o está inactivo',
          error: 'Tipo de servicio inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Crear servicio
    const createServicioQuery = `
      INSERT INTO servicios (nombre, descripcion, precio_base, tipo_serv_id)
      VALUES ($1, $2, $3, $4)
      RETURNING servicio_id
    `;

    const servicioResult = await pool.query(createServicioQuery, [
      body.nombre,
      body.descripcion || null,
      body.precio_base || null,
      body.tipo_serv_id || null
    ]);

    const newServicioId = servicioResult.rows[0].servicio_id;

    // Obtener el servicio creado con información completa
    const getServicioQuery = `
      SELECT 
        s.servicio_id,
        s.nombre,
        s.descripcion,
        s.precio_base,
        s.tipo_serv_id,
        ts.nombre as tipo_servicio_nombre,
        ts.descripcion as tipo_servicio_descripcion
      FROM servicios s
      LEFT JOIN tipo_servicio ts ON s.tipo_serv_id = ts.tipo_serv_id
      WHERE s.servicio_id = $1
    `;

    const servicioData = await pool.query(getServicioQuery, [newServicioId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Servicio creado exitosamente',
      data: servicioData.rows[0]
    };

    // Log de auditoría
    console.log('Servicio creado:', sanitizeForLog({
      servicio_id: newServicioId,
      nombre: body.nombre,
      tipo_serv_id: body.tipo_serv_id,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear servicio:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
