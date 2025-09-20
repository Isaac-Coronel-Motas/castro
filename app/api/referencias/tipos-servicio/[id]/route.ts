import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateTipoServicioData, 
  canDeleteTipoServicio,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  UpdateTipoServicioRequest, 
  ReferenciasApiResponse 
} from '@/lib/types/referencias';

// GET /api/referencias/tipos-servicio/[id] - Obtener tipo de servicio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tipoServId = parseInt(params.id);

    if (isNaN(tipoServId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de tipo de servicio inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('tipos-servicio.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener tipo de servicio
    const tipoQuery = `
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

    const tipoResult = await pool.query(tipoQuery, [tipoServId]);
    
    if (tipoResult.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Tipo de servicio no encontrado',
        error: 'Tipo de servicio no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Tipo de servicio obtenido exitosamente',
      data: tipoResult.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener tipo de servicio:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/referencias/tipos-servicio/[id] - Actualizar tipo de servicio
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tipoServId = parseInt(params.id);

    if (isNaN(tipoServId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de tipo de servicio inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('tipos-servicio.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateTipoServicioRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
      const validation = validateTipoServicioData(body as any);
      if (!validation.valid) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'Validación fallida',
          data: validation.errors
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el tipo de servicio existe
    const existingTipoQuery = 'SELECT tipo_serv_id, nombre FROM tipo_servicio WHERE tipo_serv_id = $1';
    const existingTipo = await pool.query(existingTipoQuery, [tipoServId]);
    
    if (existingTipo.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Tipo de servicio no encontrado',
        error: 'Tipo de servicio no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el nombre no esté en uso por otro tipo de servicio
    if (body.nombre) {
      const duplicateQuery = `
        SELECT tipo_serv_id FROM tipo_servicio 
        WHERE tipo_serv_id != $1 AND nombre = $2
      `;
      const duplicateResult = await pool.query(duplicateQuery, [tipoServId, body.nombre]);
      
      if (duplicateResult.rows.length > 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Ya existe otro tipo de servicio con ese nombre',
          error: 'Tipo de servicio duplicado'
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.descripcion !== undefined) {
      paramCount++;
      updateFields.push(`descripcion = $${paramCount}`);
      updateValues.push(body.descripcion);
    }

    if (body.nombre !== undefined) {
      paramCount++;
      updateFields.push(`nombre = $${paramCount}`);
      updateValues.push(body.nombre);
    }

    if (body.activo !== undefined) {
      paramCount++;
      updateFields.push(`activo = $${paramCount}`);
      updateValues.push(body.activo);
    }

    if (updateFields.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar tipo de servicio
    paramCount++;
    updateValues.push(tipoServId);

    const updateQuery = `
      UPDATE tipo_servicio 
      SET ${updateFields.join(', ')}
      WHERE tipo_serv_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener tipo de servicio actualizado
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

    const tipoData = await pool.query(getTipoQuery, [tipoServId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Tipo de servicio actualizado exitosamente',
      data: tipoData.rows[0]
    };

    // Log de auditoría
    console.log('Tipo de servicio actualizado:', sanitizeForLog({
      tipo_serv_id: tipoServId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar tipo de servicio:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/referencias/tipos-servicio/[id] - Eliminar tipo de servicio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tipoServId = parseInt(params.id);

    if (isNaN(tipoServId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de tipo de servicio inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('tipos-servicio.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el tipo de servicio existe
    const existingTipoQuery = 'SELECT tipo_serv_id, nombre FROM tipo_servicio WHERE tipo_serv_id = $1';
    const existingTipo = await pool.query(existingTipoQuery, [tipoServId]);
    
    if (existingTipo.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Tipo de servicio no encontrado',
        error: 'Tipo de servicio no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si hay servicios asociados al tipo de servicio
    const serviciosQuery = `
      SELECT COUNT(*) as count FROM servicios 
      WHERE tipo_serv_id = $1
    `;
    const serviciosResult = await pool.query(serviciosQuery, [tipoServId]);
    const serviciosCount = parseInt(serviciosResult.rows[0].count);

    if (!canDeleteTipoServicio(serviciosCount)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: `No se puede eliminar el tipo de servicio porque tiene ${serviciosCount} servicio(s) asociado(s)`,
        error: 'Tipo de servicio en uso'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar tipo de servicio
    const deleteQuery = 'DELETE FROM tipo_servicio WHERE tipo_serv_id = $1';
    await pool.query(deleteQuery, [tipoServId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Tipo de servicio eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Tipo de servicio eliminado:', sanitizeForLog({
      tipo_serv_id: tipoServId,
      nombre: existingTipo.rows[0].nombre,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar tipo de servicio:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
