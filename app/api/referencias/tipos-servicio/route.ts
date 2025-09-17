import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateTipoServicioData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  canDeleteTipoServicio,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  CreateTipoServicioRequest, 
  ReferenciasApiResponse, 
  ReferenciasPaginationParams 
} from '@/lib/types/referencias';

// GET /api/referencias/tipos-servicio - Listar tipos de servicio
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
    const activo = searchParams.get('activo');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['ts.nombre', 'ts.descripcion'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (activo !== null && activo !== undefined) {
      paramCount++;
      additionalConditions.push(`ts.activo = $${paramCount}`);
      queryParams.push(activo === 'true');
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'nombre');

    // Consulta principal
    const query = `
      SELECT 
        ts.tipo_serv_id,
        ts.descripcion,
        ts.nombre,
        ts.activo,
        COUNT(s.servicio_id) as servicios_count,
        COUNT(*) OVER() as total_count
      FROM tipo_servicio ts
      LEFT JOIN servicios s ON ts.tipo_serv_id = s.tipo_serv_id
      ${whereClause}
      GROUP BY ts.tipo_serv_id, ts.descripcion, ts.nombre, ts.activo
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const tiposServicio = result.rows;
    const total = tiposServicio.length > 0 ? parseInt(tiposServicio[0].total_count) : 0;

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Tipos de servicio obtenidos exitosamente',
      data: tiposServicio.map(ts => {
        const { total_count, ...tipoServicio } = ts;
        return tipoServicio;
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
    console.error('Error al obtener tipos de servicio:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/referencias/tipos-servicio - Crear tipo de servicio
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_servicios')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateTipoServicioRequest = await request.json();

    // Validar datos
    const validation = validateTipoServicioData(body);
    if (!validation.valid) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el nombre del tipo de servicio no exista
    const existingTipoQuery = 'SELECT tipo_serv_id FROM tipo_servicio WHERE nombre = $1';
    const existingTipo = await pool.query(existingTipoQuery, [body.nombre]);
    
    if (existingTipo.rows.length > 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Ya existe un tipo de servicio con ese nombre',
        error: 'Tipo de servicio duplicado'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Crear tipo de servicio
    const createTipoQuery = `
      INSERT INTO tipo_servicio (descripcion, nombre, activo)
      VALUES ($1, $2, $3)
      RETURNING tipo_serv_id
    `;

    const tipoResult = await pool.query(createTipoQuery, [
      body.descripcion,
      body.nombre,
      body.activo !== undefined ? body.activo : true
    ]);

    const newTipoId = tipoResult.rows[0].tipo_serv_id;

    // Obtener el tipo de servicio creado
    const getTipoQuery = `
      SELECT 
        ts.tipo_serv_id,
        ts.descripcion,
        ts.nombre,
        ts.activo,
        COUNT(s.servicio_id) as servicios_count
      FROM tipo_servicio ts
      LEFT JOIN servicios s ON ts.tipo_serv_id = s.tipo_serv_id
      WHERE ts.tipo_serv_id = $1
      GROUP BY ts.tipo_serv_id, ts.descripcion, ts.nombre, ts.activo
    `;

    const tipoData = await pool.query(getTipoQuery, [newTipoId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Tipo de servicio creado exitosamente',
      data: tipoData.rows[0]
    };

    // Log de auditoría
    console.log('Tipo de servicio creado:', sanitizeForLog({
      tipo_serv_id: newTipoId,
      nombre: body.nombre,
      descripcion: body.descripcion,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear tipo de servicio:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
