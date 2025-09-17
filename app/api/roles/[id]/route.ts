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
  UpdateRolRequest, 
  ApiResponse, 
  Rol 
} from '@/lib/types/auth';

// GET /api/roles/[id] - Obtener rol por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rolId = parseInt(params.id);

    if (isNaN(rolId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de rol inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('leer_roles')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener rol
    const rolQuery = `
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

    const rolResult = await pool.query(rolQuery, [rolId]);
    
    if (rolResult.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Rol no encontrado',
        error: 'Rol no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const rol = rolResult.rows[0];

    // Obtener permisos del rol
    const permisosQuery = `
      SELECT p.permiso_id, p.nombre, p.descripcion
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
      ORDER BY p.nombre
    `;
    const permisosResult = await pool.query(permisosQuery, [rolId]);
    rol.permisos = permisosResult.rows;

    // Obtener usuarios que tienen este rol
    const usuariosQuery = `
      SELECT 
        u.usuario_id,
        u.nombre,
        u.email,
        u.username,
        u.activo
      FROM usuarios u
      WHERE u.rol_id = $1 AND u.is_deleted = false
      ORDER BY u.nombre
    `;
    const usuariosResult = await pool.query(usuariosQuery, [rolId]);
    rol.usuarios = usuariosResult.rows;

    const response: ApiResponse = {
      success: true,
      message: 'Rol obtenido exitosamente',
      data: rol
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener rol:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/roles/[id] - Actualizar rol
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rolId = parseInt(params.id);

    if (isNaN(rolId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de rol inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('actualizar_roles')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateRolRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
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
    }

    // Verificar que el rol existe
    const existingRolQuery = 'SELECT rol_id, nombre FROM roles WHERE rol_id = $1';
    const existingRol = await pool.query(existingRolQuery, [rolId]);
    
    if (existingRol.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Rol no encontrado',
        error: 'Rol no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el nombre no esté en uso por otro rol
    if (body.nombre) {
      const duplicateQuery = `
        SELECT rol_id FROM roles 
        WHERE rol_id != $1 AND nombre = $2
      `;
      const duplicateResult = await pool.query(duplicateQuery, [rolId, body.nombre]);
      
      if (duplicateResult.rows.length > 0) {
        const response: ApiResponse = {
          success: false,
          message: 'Ya existe otro rol con ese nombre',
          error: 'Rol duplicado'
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Verificar que todos los permisos existen si se proporcionan
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

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.nombre !== undefined) {
      paramCount++;
      updateFields.push(`nombre = $${paramCount}`);
      updateValues.push(body.nombre);
    }

    if (body.descripcion !== undefined) {
      paramCount++;
      updateFields.push(`descripcion = $${paramCount}`);
      updateValues.push(body.descripcion);
    }

    if (body.activo !== undefined) {
      paramCount++;
      updateFields.push(`activo = $${paramCount}`);
      updateValues.push(body.activo);
    }

    if (updateFields.length === 0 && !body.permisos) {
      const response: ApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar rol si hay campos para actualizar
    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      paramCount++;
      updateValues.push(rolId);

      const updateQuery = `
        UPDATE roles 
        SET ${updateFields.join(', ')}
        WHERE rol_id = $${paramCount}
      `;

      await pool.query(updateQuery, updateValues);
    }

    // Actualizar permisos si se proporcionan
    if (body.permisos !== undefined) {
      // Eliminar permisos actuales
      await pool.query('DELETE FROM rol_permisos WHERE rol_id = $1', [rolId]);
      
      // Agregar nuevos permisos
      if (body.permisos.length > 0) {
        for (const permisoId of body.permisos) {
          await pool.query(
            'INSERT INTO rol_permisos (rol_id, permiso_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [rolId, permisoId]
          );
        }
      }
    }

    // Obtener rol actualizado
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

    const rolData = await pool.query(getRolQuery, [rolId]);

    // Obtener permisos actualizados
    const permisosQuery = `
      SELECT p.permiso_id, p.nombre, p.descripcion
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
      ORDER BY p.nombre
    `;
    const permisosResult = await pool.query(permisosQuery, [rolId]);

    const response: ApiResponse = {
      success: true,
      message: 'Rol actualizado exitosamente',
      data: {
        ...rolData.rows[0],
        permisos: permisosResult.rows
      }
    };

    // Log de auditoría
    console.log('Rol actualizado:', sanitizeForLog({
      rol_id: rolId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar rol:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/roles/[id] - Eliminar rol
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rolId = parseInt(params.id);

    if (isNaN(rolId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de rol inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('eliminar_roles')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el rol existe
    const existingRolQuery = 'SELECT rol_id, nombre FROM roles WHERE rol_id = $1';
    const existingRol = await pool.query(existingRolQuery, [rolId]);
    
    if (existingRol.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Rol no encontrado',
        error: 'Rol no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si hay usuarios asignados a este rol
    const usuariosQuery = `
      SELECT COUNT(*) as count FROM usuarios 
      WHERE rol_id = $1 AND is_deleted = false
    `;
    const usuariosResult = await pool.query(usuariosQuery, [rolId]);
    const usuariosCount = parseInt(usuariosResult.rows[0].count);

    if (usuariosCount > 0) {
      const response: ApiResponse = {
        success: false,
        message: `No se puede eliminar el rol porque tiene ${usuariosCount} usuario(s) asignado(s)`,
        error: 'Rol en uso'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar permisos del rol
    await pool.query('DELETE FROM rol_permisos WHERE rol_id = $1', [rolId]);

    // Eliminar rol
    const deleteQuery = 'DELETE FROM roles WHERE rol_id = $1';
    await pool.query(deleteQuery, [rolId]);

    const response: ApiResponse = {
      success: true,
      message: 'Rol eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Rol eliminado:', sanitizeForLog({
      rol_id: rolId,
      nombre: existingRol.rows[0].nombre,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar rol:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
