import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthErrorResponse, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateUsuarioData, 
  hashPassword, 
  sanitizeForLog 
} from '@/lib/utils/auth';
import { 
  CreateUsuarioRequest, 
  ApiResponse, 
  Usuario, 
  PaginationParams 
} from '@/lib/types/auth';

// GET /api/usuarios - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_usuarios')(request);
    
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
    let whereClause = 'WHERE u.is_deleted = false';
    const queryParams: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (u.nombre ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.username ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (activo !== null && activo !== undefined) {
      paramCount++;
      whereClause += ` AND u.activo = $${paramCount}`;
      queryParams.push(activo === 'true');
    }

    // Consulta principal
    const query = `
      SELECT 
        u.usuario_id,
        u.nombre,
        u.email,
        u.username,
        u.activo,
        u.created_at,
        u.updated_at,
        u.last_login_attempt,
        u.is_2fa_enabled,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion,
        COUNT(*) OVER() as total_count
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      ${whereClause}
      ORDER BY u.${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    const usuarios = result.rows;
    const total = usuarios.length > 0 ? parseInt(usuarios[0].total_count) : 0;

    // Obtener sucursales para cada usuario
    for (const usuario of usuarios) {
      const sucursalesQuery = `
        SELECT s.sucursal_id, s.nombre
        FROM sucursales s
        INNER JOIN usuarios_sucursales us ON s.sucursal_id = us.id_sucursal
        WHERE us.id_usuario = $1
      `;
      const sucursalesResult = await pool.query(sucursalesQuery, [usuario.usuario_id]);
      usuario.sucursales = sucursalesResult.rows;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: usuarios.map(u => {
        const { total_count, ...usuario } = u;
        return usuario;
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
    console.error('Error al obtener usuarios:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/usuarios - Crear usuario
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('crear_usuarios')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateUsuarioRequest = await request.json();

    // Validar datos
    const validation = validateUsuarioData(body);
    if (!validation.valid) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el email y username no existan
    const existingUserQuery = `
      SELECT usuario_id FROM usuarios 
      WHERE (email = $1 OR username = $2) AND is_deleted = false
    `;
    const existingUser = await pool.query(existingUserQuery, [body.email, body.username]);
    
    if (existingUser.rows.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'El email o username ya existe',
        error: 'Usuario duplicado'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Verificar que el rol existe
    const rolQuery = 'SELECT rol_id FROM roles WHERE rol_id = $1 AND activo = true';
    const rolResult = await pool.query(rolQuery, [body.rol_id]);
    
    if (rolResult.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'El rol especificado no existe',
        error: 'Rol inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Encriptar contraseña
    const hashedPassword = await hashPassword(body.password);

    // Crear usuario
    const createUserQuery = `
      INSERT INTO usuarios (
        nombre, email, username, password, rol_id, id_empleado, 
        activo, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING usuario_id, created_at
    `;

    const userResult = await pool.query(createUserQuery, [
      body.nombre,
      body.email,
      body.username,
      hashedPassword,
      body.rol_id,
      body.id_empleado || null,
      true
    ]);

    const newUserId = userResult.rows[0].usuario_id;

    // Asignar sucursales si se proporcionan
    if (body.sucursales && body.sucursales.length > 0) {
      for (const sucursalId of body.sucursales) {
        await pool.query(
          'INSERT INTO usuarios_sucursales (id_usuario, id_sucursal) VALUES ($1, $2)',
          [newUserId, sucursalId]
        );
      }
    }

    // Obtener el usuario creado con información completa
    const getUserQuery = `
      SELECT 
        u.usuario_id,
        u.nombre,
        u.email,
        u.username,
        u.activo,
        u.created_at,
        u.updated_at,
        u.is_2fa_enabled,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = $1
    `;

    const userData = await pool.query(getUserQuery, [newUserId]);

    // Obtener sucursales
    const sucursalesQuery = `
      SELECT s.sucursal_id, s.nombre
      FROM sucursales s
      INNER JOIN usuarios_sucursales us ON s.sucursal_id = us.id_sucursal
      WHERE us.id_usuario = $1
    `;
    const sucursalesResult = await pool.query(sucursalesQuery, [newUserId]);

    const response: ApiResponse = {
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        ...userData.rows[0],
        sucursales: sucursalesResult.rows
      }
    };

    // Log de auditoría
    console.log('Usuario creado:', sanitizeForLog({
      usuario_id: newUserId,
      nombre: body.nombre,
      email: body.email,
      username: body.username,
      rol_id: body.rol_id,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
