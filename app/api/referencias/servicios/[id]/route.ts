import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateServicioData, 
  canDeleteServicio,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  UpdateServicioRequest, 
  ReferenciasApiResponse 
} from '@/lib/types/referencias';

// GET /api/referencias/servicios/[id] - Obtener servicio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const servicioId = parseInt(params.id);

    if (isNaN(servicioId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de servicio inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Obtener servicio
    const query = `
      SELECT 
        s.servicio_id,
        s.nombre,
        s.descripcion,
        s.precio_base,
        s.tipo_serv_id,
        ts.nombre as tipo_servicio_nombre,
        ts.descripcion as tipo_servicio_descripcion
      FROM servicios s
      LEFT JOIN tipo_servicio ts ON s.tipo_serv_id = ts.tipo_serv_id
      WHERE s.servicio_id = $1
    `;

    const result = await pool.query(query, [servicioId]);

    if (result.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Servicio no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Servicio obtenido exitosamente',
      data: result.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener servicio:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/referencias/servicios/[id] - Actualizar servicio
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const servicioId = parseInt(params.id);

    if (isNaN(servicioId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de servicio inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: UpdateServicioRequest = await request.json();

    // Validar datos
    const validation = validateServicioData(body);
    if (!validation.valid) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el servicio existe
    const existingServicioQuery = 'SELECT servicio_id FROM servicios WHERE servicio_id = $1';
    const existingServicio = await pool.query(existingServicioQuery, [servicioId]);
    
    if (existingServicio.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Servicio no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el tipo de servicio existe si se proporciona
    if (body.tipo_serv_id) {
      const tipoServicioQuery = 'SELECT tipo_serv_id FROM tipo_servicio WHERE tipo_serv_id = $1 AND activo = true';
      const tipoServicioResult = await pool.query(tipoServicioQuery, [body.tipo_serv_id]);
      
      if (tipoServicioResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'El tipo de servicio especificado no existe o está inactivo',
          error: 'Tipo de servicio inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Actualizar servicio
    const updateServicioQuery = `
      UPDATE servicios 
      SET nombre = $1, descripcion = $2, precio_base = $3, tipo_serv_id = $4
      WHERE servicio_id = $5
      RETURNING servicio_id
    `;

    await pool.query(updateServicioQuery, [
      body.nombre,
      body.descripcion || null,
      body.precio_base || null,
      body.tipo_serv_id || null,
      servicioId
    ]);

    // Obtener el servicio actualizado
    const getServicioQuery = `
      SELECT 
        s.servicio_id,
        s.nombre,
        s.descripcion,
        s.precio_base,
        s.tipo_serv_id,
        ts.nombre as tipo_servicio_nombre,
        ts.descripcion as tipo_servicio_descripcion
      FROM servicios s
      LEFT JOIN tipo_servicio ts ON s.tipo_serv_id = ts.tipo_serv_id
      WHERE s.servicio_id = $1
    `;

    const servicioData = await pool.query(getServicioQuery, [servicioId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: servicioData.rows[0]
    };

    // Log de auditoría
    console.log('Servicio actualizado:', sanitizeForLog({
      servicio_id: servicioId,
      nombre: body.nombre,
      tipo_serv_id: body.tipo_serv_id,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/referencias/servicios/[id] - Eliminar servicio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const servicioId = parseInt(params.id);

    if (isNaN(servicioId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de servicio inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el servicio existe
    const existingServicioQuery = 'SELECT servicio_id, nombre FROM servicios WHERE servicio_id = $1';
    const existingServicio = await pool.query(existingServicioQuery, [servicioId]);
    
    if (existingServicio.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Servicio no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si se puede eliminar
    const canDelete = await canDeleteServicio(servicioId);
    if (!canDelete.canDelete) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: canDelete.reason || 'No se puede eliminar el servicio',
        error: 'Eliminación no permitida'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar servicio
    const deleteServicioQuery = 'DELETE FROM servicios WHERE servicio_id = $1';
    await pool.query(deleteServicioQuery, [servicioId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Servicio eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Servicio eliminado:', sanitizeForLog({
      servicio_id: servicioId,
      nombre: existingServicio.rows[0].nombre,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
