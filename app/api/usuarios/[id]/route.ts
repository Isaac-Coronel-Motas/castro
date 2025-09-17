import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  canModifyUser,
  canDeleteUser,
  createAuthErrorResponse, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateUsuarioData, 
  hashPassword, 
  sanitizeForLog 
} from '@/lib/utils/auth';
import { 
  UpdateUsuarioRequest, 
  ApiResponse, 
  Usuario 
} from '@/lib/types/auth';

// GET /api/usuarios/[id] - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuarioId = parseInt(params.id);

    if (isNaN(usuarioId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de usuario inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('leer_usuarios')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener usuario
    const userQuery = `
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
        u.rol_id,
        u.id_empleado,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = $1 AND u.is_deleted = false
    `;

    const userResult = await pool.query(userQuery, [usuarioId]);
    
    if (userResult.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const usuario = userResult.rows[0];

    // Obtener sucursales
    const sucursalesQuery = `
      SELECT s.sucursal_id, s.nombre
      FROM sucursales s
      INNER JOIN usuarios_sucursales us ON s.sucursal_id = us.id_sucursal
      WHERE us.id_usuario = $1
    `;
    const sucursalesResult = await pool.query(sucursalesQuery, [usuarioId]);
    usuario.sucursales = sucursalesResult.rows;

    // Obtener permisos del usuario
    const permissionsQuery = `
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
    `;
    const permissionsResult = await pool.query(permissionsQuery, [usuario.rol_id]);
    usuario.permisos = permissionsResult.rows.map(row => row.nombre);

    const response: ApiResponse = {
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: usuario
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/usuarios/[id] - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuarioId = parseInt(params.id);

    if (isNaN(usuarioId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de usuario inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos de modificación
    const { authorized, error } = canModifyUser(usuarioId, request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateUsuarioRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
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
    }

    // Verificar que el usuario existe
    const existingUserQuery = `
      SELECT usuario_id, email, username FROM usuarios 
      WHERE usuario_id = $1 AND is_deleted = false
    `;
    const existingUser = await pool.query(existingUserQuery, [usuarioId]);
    
    if (existingUser.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el email y username no estén en uso por otro usuario
    if (body.email || body.username) {
      const duplicateQuery = `
        SELECT usuario_id FROM usuarios 
        WHERE usuario_id != $1 AND (email = $2 OR username = $3) AND is_deleted = false
      `;
      const duplicateResult = await pool.query(duplicateQuery, [
        usuarioId, 
        body.email || existingUser.rows[0].email, 
        body.username || existingUser.rows[0].username
      ]);
      
      if (duplicateResult.rows.length > 0) {
        const response: ApiResponse = {
          success: false,
          message: 'El email o username ya está en uso por otro usuario',
          error: 'Usuario duplicado'
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Verificar que el rol existe si se proporciona
    if (body.rol_id) {
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
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.nombre !== undefined) {
      paramCount++;
      updateFields.push(`nombre = $${paramCount}`);
      updateValues.push(body.nombre);
    }

    if (body.email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(body.email);
    }

    if (body.username !== undefined) {
      paramCount++;
      updateFields.push(`username = $${paramCount}`);
      updateValues.push(body.username);
    }

    if (body.password !== undefined) {
      paramCount++;
      const hashedPassword = await hashPassword(body.password);
      updateFields.push(`password = $${paramCount}`);
      updateValues.push(hashedPassword);
      updateFields.push(`password_changed_at = CURRENT_TIMESTAMP`);
    }

    if (body.rol_id !== undefined) {
      paramCount++;
      updateFields.push(`rol_id = $${paramCount}`);
      updateValues.push(body.rol_id);
    }

    if (body.id_empleado !== undefined) {
      paramCount++;
      updateFields.push(`id_empleado = $${paramCount}`);
      updateValues.push(body.id_empleado);
    }

    if (body.activo !== undefined) {
      paramCount++;
      updateFields.push(`activo = $${paramCount}`);
      updateValues.push(body.activo);
    }

    if (updateFields.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Agregar campos de auditoría
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    // Actualizar usuario
    paramCount++;
    updateValues.push(usuarioId);

    const updateQuery = `
      UPDATE usuarios 
      SET ${updateFields.join(', ')}
      WHERE usuario_id = $${paramCount}
      RETURNING usuario_id, updated_at
    `;

    await pool.query(updateQuery, updateValues);

    // Actualizar sucursales si se proporcionan
    if (body.sucursales !== undefined) {
      // Eliminar sucursales actuales
      await pool.query('DELETE FROM usuarios_sucursales WHERE id_usuario = $1', [usuarioId]);
      
      // Agregar nuevas sucursales
      if (body.sucursales.length > 0) {
        for (const sucursalId of body.sucursales) {
          await pool.query(
            'INSERT INTO usuarios_sucursales (id_usuario, id_sucursal) VALUES ($1, $2)',
            [usuarioId, sucursalId]
          );
        }
      }
    }

    // Obtener usuario actualizado
    const getUserQuery = `
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
        u.rol_id,
        u.id_empleado,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = $1
    `;

    const userData = await pool.query(getUserQuery, [usuarioId]);

    // Obtener sucursales actualizadas
    const sucursalesQuery = `
      SELECT s.sucursal_id, s.nombre
      FROM sucursales s
      INNER JOIN usuarios_sucursales us ON s.sucursal_id = us.id_sucursal
      WHERE us.id_usuario = $1
    `;
    const sucursalesResult = await pool.query(sucursalesQuery, [usuarioId]);

    const response: ApiResponse = {
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        ...userData.rows[0],
        sucursales: sucursalesResult.rows
      }
    };

    // Log de auditoría
    console.log('Usuario actualizado:', sanitizeForLog({
      usuario_id: usuarioId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/usuarios/[id] - Eliminar usuario (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuarioId = parseInt(params.id);

    if (isNaN(usuarioId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de usuario inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos de eliminación
    const { authorized, error } = canDeleteUser(usuarioId, request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el usuario existe
    const existingUserQuery = `
      SELECT usuario_id, nombre, username FROM usuarios 
      WHERE usuario_id = $1 AND is_deleted = false
    `;
    const existingUser = await pool.query(existingUserQuery, [usuarioId]);
    
    if (existingUser.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Realizar soft delete
    const deleteQuery = `
      UPDATE usuarios 
      SET 
        is_deleted = true,
        deleted_at = CURRENT_TIMESTAMP,
        activo = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE usuario_id = $1
    `;

    await pool.query(deleteQuery, [usuarioId]);

    const response: ApiResponse = {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Usuario eliminado:', sanitizeForLog({
      usuario_id: usuarioId,
      nombre: existingUser.rows[0].nombre,
      username: existingUser.rows[0].username,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
