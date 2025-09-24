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
  UpdatePermisoRequest, 
  ApiResponse, 
  Permiso 
} from '@/lib/types/auth';

// GET /api/permisos/[id] - Obtener permiso por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permisoId = parseInt(params.id);

    if (isNaN(permisoId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de permiso inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener permiso
    const permisoQuery = `
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

    const permisoResult = await pool.query(permisoQuery, [permisoId]);
    
    if (permisoResult.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Permiso no encontrado',
        error: 'Permiso no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const permiso = permisoResult.rows[0];

    // Obtener roles que tienen este permiso
    const rolesQuery = `
      SELECT 
        r.rol_id,
        r.nombre,
        r.descripcion,
        r.activo
      FROM roles r
      INNER JOIN rol_permisos rp ON r.rol_id = rp.rol_id
      WHERE rp.permiso_id = $1
      ORDER BY r.nombre
    `;
    const rolesResult = await pool.query(rolesQuery, [permisoId]);
    permiso.roles = rolesResult.rows;

    const response: ApiResponse = {
      success: true,
      message: 'Permiso obtenido exitosamente',
      data: permiso
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener permiso:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/permisos/[id] - Actualizar permiso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permisoId = parseInt(params.id);

    if (isNaN(permisoId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de permiso inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdatePermisoRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
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
    }

    // Verificar que el permiso existe
    const existingPermisoQuery = 'SELECT permiso_id, nombre FROM permisos WHERE permiso_id = $1';
    const existingPermiso = await pool.query(existingPermisoQuery, [permisoId]);
    
    if (existingPermiso.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Permiso no encontrado',
        error: 'Permiso no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el nombre no esté en uso por otro permiso
    if (body.nombre) {
      const duplicateQuery = `
        SELECT permiso_id FROM permisos 
        WHERE permiso_id != $1 AND nombre = $2
      `;
      const duplicateResult = await pool.query(duplicateQuery, [permisoId, body.nombre]);
      
      if (duplicateResult.rows.length > 0) {
        const response: ApiResponse = {
          success: false,
          message: 'Ya existe otro permiso con ese nombre',
          error: 'Permiso duplicado'
        };
        return NextResponse.json(response, { status: 409 });
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

    if (updateFields.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar permiso
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    paramCount++;
    updateValues.push(permisoId);

    const updateQuery = `
      UPDATE permisos 
      SET ${updateFields.join(', ')}
      WHERE permiso_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener permiso actualizado
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

    const permisoData = await pool.query(getPermisoQuery, [permisoId]);

    const response: ApiResponse = {
      success: true,
      message: 'Permiso actualizado exitosamente',
      data: permisoData.rows[0]
    };

    // Log de auditoría
    console.log('Permiso actualizado:', sanitizeForLog({
      permiso_id: permisoId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/permisos/[id] - Eliminar permiso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permisoId = parseInt(params.id);

    if (isNaN(permisoId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de permiso inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('administracion.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el permiso existe
    const existingPermisoQuery = 'SELECT permiso_id, nombre FROM permisos WHERE permiso_id = $1';
    const existingPermiso = await pool.query(existingPermisoQuery, [permisoId]);
    
    if (existingPermiso.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Permiso no encontrado',
        error: 'Permiso no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si hay roles que tienen este permiso
    const rolesQuery = `
      SELECT COUNT(*) as count FROM rol_permisos 
      WHERE permiso_id = $1
    `;
    const rolesResult = await pool.query(rolesQuery, [permisoId]);
    const rolesCount = parseInt(rolesResult.rows[0].count);

    if (rolesCount > 0) {
      const response: ApiResponse = {
        success: false,
        message: `No se puede eliminar el permiso porque está asignado a ${rolesCount} rol(es)`,
        error: 'Permiso en uso'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar permiso
    const deleteQuery = 'DELETE FROM permisos WHERE permiso_id = $1';
    await pool.query(deleteQuery, [permisoId]);

    const response: ApiResponse = {
      success: true,
      message: 'Permiso eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Permiso eliminado:', sanitizeForLog({
      permiso_id: permisoId,
      nombre: existingPermiso.rows[0].nombre,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar permiso:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
