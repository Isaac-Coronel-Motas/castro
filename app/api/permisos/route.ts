import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validatePermisoData, 
  sanitizeForLog 
} from '@/lib/utils/auth';
import { 
  CreatePermisoRequest, 
  ApiResponse, 
  Permiso, 
  PaginationParams 
} from '@/lib/types/auth';

// GET /api/permisos - Listar permisos
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.leer')(request);
    
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

    // Construir consulta
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (p.nombre ILIKE $${paramCount} OR p.descripcion ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (activo !== null && activo !== undefined) {
      paramCount++;
      whereClause += ` AND p.activo = $${paramCount}`;
      queryParams.push(activo === 'true');
    }

    // Consulta principal
    const query = `
      SELECT 
        p.permiso_id,
        p.nombre,
        p.descripcion,
        p.activo,
        p.created_at,
        p.updated_at,
        p.id,
        COUNT(*) OVER() as total_count
      FROM permisos p
      ${whereClause}
      ORDER BY p.${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    const permisos = result.rows;
    const total = permisos.length > 0 ? parseInt(permisos[0].total_count) : 0;

    // Obtener roles que tienen cada permiso
    for (const permiso of permisos) {
      const rolesQuery = `
        SELECT r.rol_id, r.nombre, r.descripcion
        FROM roles r
        INNER JOIN rol_permisos rp ON r.rol_id = rp.rol_id
        WHERE rp.permiso_id = $1 AND r.activo = true
        ORDER BY r.nombre
      `;
      const rolesResult = await pool.query(rolesQuery, [permiso.permiso_id]);
      permiso.roles = rolesResult.rows;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Permisos obtenidos exitosamente',
      data: permisos.map(p => {
        const { total_count, ...permiso } = p;
        return permiso;
      }),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener permisos:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/permisos - Crear permiso
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreatePermisoRequest = await request.json();

    // Validar datos
    const validation = validatePermisoData(body);
    if (!validation.valid) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el nombre del permiso no exista
    const existingPermisoQuery = 'SELECT permiso_id FROM permisos WHERE nombre = $1';
    const existingPermiso = await pool.query(existingPermisoQuery, [body.nombre]);
    
    if (existingPermiso.rows.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Ya existe un permiso con ese nombre',
        error: 'Permiso duplicado'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Crear permiso
    const createPermisoQuery = `
      INSERT INTO permisos (nombre, descripcion, activo, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING permiso_id, created_at
    `;

    const permisoResult = await pool.query(createPermisoQuery, [
      body.nombre,
      body.descripcion || null,
      true
    ]);

    const newPermisoId = permisoResult.rows[0].permiso_id;

    // Obtener el permiso creado
    const getPermisoQuery = `
      SELECT 
        p.permiso_id,
        p.nombre,
        p.descripcion,
        p.activo,
        p.created_at,
        p.updated_at,
        p.id
      FROM permisos p
      WHERE p.permiso_id = $1
    `;

    const permisoData = await pool.query(getPermisoQuery, [newPermisoId]);

    const response: ApiResponse = {
      success: true,
      message: 'Permiso creado exitosamente',
      data: permisoData.rows[0]
    };

    // Log de auditoría
    console.log('Permiso creado:', sanitizeForLog({
      permiso_id: newPermisoId,
      nombre: body.nombre,
      descripcion: body.descripcion,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear permiso:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
