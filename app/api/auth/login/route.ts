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
import { decryptCredentials } from '@/lib/utils/server-encryption';
import { LoginRequest, LoginResponse, ApiResponse } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username: encryptedUsername, password: encryptedPassword, remember_me = false } = body;
    const ip_origen = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Desencriptar credenciales
    let username: string;
    let password: string;
    
    try {
      const decrypted = decryptCredentials(encryptedUsername, encryptedPassword);
      username = decrypted.username;
      password = decrypted.password;
    } catch (decryptError) {
      console.error('Error desencriptando credenciales:', decryptError);
      const response: ApiResponse = {
        success: false,
        message: 'Error de seguridad en la transmisión de datos',
        error: 'Credenciales encriptadas inválidas'
      };
      return NextResponse.json(response, { status: 400 });
    }

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

    // Verificar bloqueo por intentos fallidos en la última hora
    const accesosQuery = `
      SELECT 
        COUNT(*) as intentos_fallidos,
        MAX(fecha_acceso) as ultimo_intento
      FROM accesos 
      WHERE usuario_id = $1 
        AND tipo_acceso = 'fallido'
        AND fecha_acceso > NOW() - INTERVAL '1 hour'
    `;

    const accesosResult = await pool.query(accesosQuery, [user.usuario_id]);
    const intentosFallidos = parseInt(accesosResult.rows[0].intentos_fallidos);
    const ultimoIntento = accesosResult.rows[0].ultimo_intento;

    // Si hay 3 o más intentos fallidos, verificar si han pasado 15 minutos
    if (intentosFallidos >= 3 && ultimoIntento) {
      const tiempoTranscurrido = Date.now() - new Date(ultimoIntento).getTime();
      const quinceMinutos = 15 * 60 * 1000; // 15 minutos en milisegundos
      
      if (tiempoTranscurrido < quinceMinutos) {
        const tiempoRestante = Math.ceil((quinceMinutos - tiempoTranscurrido) / 1000 / 60);
        const response: ApiResponse = {
          success: false,
          message: `Usuario bloqueado por seguridad. Intente nuevamente en ${tiempoRestante} minutos.`,
          error: 'Usuario bloqueado por seguridad'
        };
        return NextResponse.json(response, { status: 423 });
      }
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      // Registrar intento fallido en la tabla accesos
      const insertAccesoQuery = `
        INSERT INTO accesos (usuario_id, tipo_acceso, ip_origen, info_extra)
        VALUES ($1, 'fallido', $2, $3)
      `;
      
      const infoExtra = JSON.stringify({
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      await pool.query(insertAccesoQuery, [user.usuario_id, ip_origen, infoExtra]);

      // Verificar si ahora está bloqueado (3 intentos en la última hora)
      const newIntentosFallidos = intentosFallidos + 1;
      
      const response: ApiResponse = {
        success: false,
        message: newIntentosFallidos >= 3 
          ? 'Usuario bloqueado por seguridad. Intente nuevamente en 15 minutos.'
          : `Credenciales inválidas. Intentos restantes: ${3 - newIntentosFallidos}`,
        error: newIntentosFallidos >= 3 ? 'Usuario bloqueado por seguridad' : 'Contraseña incorrecta'
      };
      return NextResponse.json(response, { status: newIntentosFallidos >= 3 ? 423 : 401 });
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

    // Registrar acceso exitoso
    const insertAccesoExitosoQuery = `
      INSERT INTO accesos (usuario_id, tipo_acceso, ip_origen, info_extra)
      VALUES ($1, 'exitoso', $2, $3)
    `;
    
    const infoExtraExitoso = JSON.stringify({
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      remember_me: remember_me
    });
    
    await pool.query(insertAccesoExitosoQuery, [user.usuario_id, ip_origen, infoExtraExitoso]);

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
