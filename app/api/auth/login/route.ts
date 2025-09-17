import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  verifyPassword, 
  generateToken, 
  generateRefreshToken, 
  isUserLocked, 
  calculateLockoutTime,
  sanitizeForLog 
} from '@/lib/utils/auth';
import { LoginRequest, LoginResponse, ApiResponse } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password, remember_me = false } = body;

    // Validar datos de entrada
    if (!username || !password) {
      const response: ApiResponse = {
        success: false,
        message: 'Username y password son requeridos',
        error: 'Datos de entrada inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Buscar usuario por username o email
    const userQuery = `
      SELECT 
        u.*,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE (u.username = $1 OR u.email = $1) 
        AND u.activo = true 
        AND u.is_deleted = false
    `;

    const userResult = await pool.query(userQuery, [username]);
    
    if (userResult.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Credenciales inválidas',
        error: 'Usuario no encontrado'
      };
      return NextResponse.json(response, { status: 401 });
    }

    const user = userResult.rows[0];

    // Verificar si el usuario está bloqueado
    if (isUserLocked(user.failed_attempts, user.locked_until)) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuario bloqueado por intentos fallidos. Intente más tarde.',
        error: 'Usuario bloqueado'
      };
      return NextResponse.json(response, { status: 423 });
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      // Incrementar intentos fallidos
      const newFailedAttempts = user.failed_attempts + 1;
      const shouldLock = newFailedAttempts >= 5;
      
      const updateQuery = `
        UPDATE usuarios 
        SET 
          failed_attempts = $1,
          last_login_attempt = CURRENT_TIMESTAMP,
          locked_until = $2
        WHERE usuario_id = $3
      `;
      
      await pool.query(updateQuery, [
        newFailedAttempts,
        shouldLock ? calculateLockoutTime() : null,
        user.usuario_id
      ]);

      const response: ApiResponse = {
        success: false,
        message: shouldLock 
          ? 'Usuario bloqueado por intentos fallidos. Intente más tarde.'
          : 'Credenciales inválidas',
        error: shouldLock ? 'Usuario bloqueado' : 'Contraseña incorrecta'
      };
      return NextResponse.json(response, { status: shouldLock ? 423 : 401 });
    }

    // Obtener permisos del usuario
    const permissionsQuery = `
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
    `;

    const permissionsResult = await pool.query(permissionsQuery, [user.rol_id]);
    const permisos = permissionsResult.rows.map(row => row.nombre);

    // Obtener sucursales del usuario
    const sucursalesQuery = `
      SELECT s.sucursal_id, s.nombre
      FROM sucursales s
      INNER JOIN usuarios_sucursales us ON s.sucursal_id = us.id_sucursal
      WHERE us.id_usuario = $1
    `;

    const sucursalesResult = await pool.query(sucursalesQuery, [user.usuario_id]);
    const sucursales = sucursalesResult.rows;

    // Resetear intentos fallidos y actualizar último login
    const resetQuery = `
      UPDATE usuarios 
      SET 
        failed_attempts = 0,
        locked_until = NULL,
        last_login_attempt = CURRENT_TIMESTAMP
      WHERE usuario_id = $1
    `;
    
    await pool.query(resetQuery, [user.usuario_id]);

    // Generar tokens
    const tokenPayload = {
      usuario_id: user.usuario_id,
      username: user.username,
      email: user.email,
      rol_id: user.rol_id,
      permisos
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.usuario_id);

    // Guardar refresh token en la base de datos (opcional)
    // Aquí podrías crear una tabla de refresh_tokens si quieres invalidar tokens específicos

    // Preparar datos del usuario para la respuesta
    const userData = {
      usuario_id: user.usuario_id,
      nombre: user.nombre,
      email: user.email,
      username: user.username,
      rol_id: user.rol_id,
      rol_nombre: user.rol_nombre,
      activo: user.activo,
      is_2fa_enabled: user.is_2fa_enabled,
      sucursales
    };

    const response: LoginResponse = {
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: userData,
        token,
        refresh_token: refreshToken,
        expires_in: remember_me ? 7 * 24 * 60 * 60 : 60 * 60, // 7 días o 1 hora
        permisos
      }
    };

    // Log de auditoría
    console.log('Login exitoso:', sanitizeForLog({
      usuario_id: user.usuario_id,
      username: user.username,
      ip: request.ip || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en login:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
