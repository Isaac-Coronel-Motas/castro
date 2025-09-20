import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateRolData, 
  sanitizeForLog 
} from '@/lib/utils/auth';
import { 
  CreateRolRequest, 
  ApiResponse, 
  Rol, 
  PaginationParams 
} from '@/lib/types/auth';

// GET /api/roles - Listar roles
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('roles.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const activo = searchParams.get('activo');

    const offset = (page - 1) * limit;

    // Construir consulta
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (r.nombre ILIKE $${paramCount} OR r.descripcion ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (activo !== null && activo !== undefined) {
      paramCount++;
      whereClause += ` AND r.activo = $${paramCount}`;
      queryParams.push(activo === 'true');
    }

    // Consulta principal
    const query = `
      SELECT 
        r.rol_id,
        r.nombre,
        r.descripcion,
        r.activo,
        r.created_at,
        r.updated_at,
        r.id,
        COUNT(*) OVER() as total_count
      FROM roles r
      ${whereClause}
      ORDER BY r.${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    const roles = result.rows;
    const total = roles.length > 0 ? parseInt(roles[0].total_count) : 0;

    // Obtener permisos para cada rol
    for (const rol of roles) {
      const permisosQuery = `
        SELECT p.permiso_id, p.nombre, p.descripcion
        FROM permisos p
        INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
        WHERE rp.rol_id = $1 AND p.activo = true
        ORDER BY p.nombre
      `;
      const permisosResult = await pool.query(permisosQuery, [rol.rol_id]);
      rol.permisos = permisosResult.rows;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Roles obtenidos exitosamente',
      data: roles.map(r => {
        const { total_count, ...rol } = r;
        return rol;
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
    console.error('Error al obtener roles:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/roles - Crear rol
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('roles.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateRolRequest = await request.json();

    // Validar datos
    const validation = validateRolData(body);
    if (!validation.valid) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el nombre del rol no exista
    const existingRolQuery = 'SELECT rol_id FROM roles WHERE nombre = $1';
    const existingRol = await pool.query(existingRolQuery, [body.nombre]);
    
    if (existingRol.rows.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Ya existe un rol con ese nombre',
        error: 'Rol duplicado'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Verificar que todos los permisos existen
    if (body.permisos && body.permisos.length > 0) {
      const permisosQuery = `
        SELECT permiso_id FROM permisos 
        WHERE permiso_id = ANY($1) AND activo = true
      `;
      const permisosResult = await pool.query(permisosQuery, [body.permisos]);
      
      if (permisosResult.rows.length !== body.permisos.length) {
        const response: ApiResponse = {
          success: false,
          message: 'Algunos permisos no existen o están inactivos',
          error: 'Permisos inválidos'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Crear rol
    const createRolQuery = `
      INSERT INTO roles (nombre, descripcion, activo, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING rol_id, created_at
    `;

    const rolResult = await pool.query(createRolQuery, [
      body.nombre,
      body.descripcion || null,
      true
    ]);

    const newRolId = rolResult.rows[0].rol_id;

    // Asignar permisos si se proporcionan
    if (body.permisos && body.permisos.length > 0) {
      for (const permisoId of body.permisos) {
        await pool.query(
          'INSERT INTO rol_permisos (rol_id, permiso_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
          [newRolId, permisoId]
        );
      }
    }

    // Obtener el rol creado con información completa
    const getRolQuery = `
      SELECT 
        r.rol_id,
        r.nombre,
        r.descripcion,
        r.activo,
        r.created_at,
        r.updated_at,
        r.id
      FROM roles r
      WHERE r.rol_id = $1
    `;

    const rolData = await pool.query(getRolQuery, [newRolId]);

    // Obtener permisos del rol
    const permisosQuery = `
      SELECT p.permiso_id, p.nombre, p.descripcion
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
      ORDER BY p.nombre
    `;
    const permisosResult = await pool.query(permisosQuery, [newRolId]);

    const response: ApiResponse = {
      success: true,
      message: 'Rol creado exitosamente',
      data: {
        ...rolData.rows[0],
        permisos: permisosResult.rows
      }
    };

    // Log de auditoría
    console.log('Rol creado:', sanitizeForLog({
      rol_id: newRolId,
      nombre: body.nombre,
      descripcion: body.descripcion,
      permisos: body.permisos,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear rol:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
