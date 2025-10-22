import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateRecepcionEquipoData, 
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  CreateRecepcionEquipoRequest, 
  ServiciosTecnicosApiResponse 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/recepcion-equipos/[id] - Obtener recepción específica
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

    const recepcionId = parseInt(params.id);
    
    if (isNaN(recepcionId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de recepción inválido',
        error: 'Parámetro inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Consulta principal con información completa
    const query = `
      SELECT 
        re.recepcion_id,
        re.fecha_recepcion,
        re.usuario_id,
        re.sucursal_id,
        re.estado_recepcion,
        re.observaciones,
        re.nro_recepcion,
        re.solicitud_id,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        s.nombre as sucursal_nombre,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        sol.nro_solicitud,
        sol.direccion as solicitud_direccion
      FROM recepcion_equipo re
      LEFT JOIN usuarios u ON re.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON re.sucursal_id = s.sucursal_id
      LEFT JOIN solicitudes_servicio sol ON re.solicitud_id = sol.solicitud_id
      LEFT JOIN clientes c ON sol.cliente_id = c.cliente_id
      WHERE re.recepcion_id = $1
    `;

    const result = await pool.query(query, [recepcionId]);
    
    if (result.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Recepción no encontrada',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const recepcion = result.rows[0];

    // Obtener equipos de la recepción
    const equiposQuery = `
      SELECT 
        red.detalle_id,
        red.recepcion_id,
        red.equipo_id,
        red.cantidad,
        red.observaciones,
        e.numero_serie as equipo_numero_serie,
        te.nombre as tipo_equipo_nombre,
        e.estado as equipo_estado
      FROM recepcion_equipo_detalle red
      LEFT JOIN equipos e ON red.equipo_id = e.equipo_id
      LEFT JOIN tipos_equipo te ON e.tipo_equipo_id = te.tipo_equipo_id
      WHERE red.recepcion_id = $1
      ORDER BY red.detalle_id
    `;

    const equiposResult = await pool.query(equiposQuery, [recepcionId]);
    recepcion.equipos = equiposResult.rows;
    recepcion.total_equipos = equiposResult.rows.length;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Recepción obtenida exitosamente',
      data: recepcion
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error obteniendo recepción:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error de base de datos'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/servicios/recepcion-equipos/[id] - Actualizar recepción específica
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

    const recepcionId = parseInt(params.id);
    
    if (isNaN(recepcionId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de recepción inválido',
        error: 'Parámetro inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    // Validar datos
    const validation = validateRecepcionEquipoData(body);
    if (!validation.valid) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la recepción existe
    const checkQuery = 'SELECT recepcion_id, estado_recepcion FROM recepcion_equipo WHERE recepcion_id = $1';
    const checkResult = await pool.query(checkQuery, [recepcionId]);
    
    if (checkResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Recepción no encontrada',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Construir consulta de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    // Campos que se pueden actualizar
    const allowedFields = [
      'usuario_id',
      'sucursal_id', 
      'estado_recepcion',
      'observaciones'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(body[field]);
      }
    });

    if (updateFields.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Datos vacíos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Agregar fecha de actualización
    paramCount++;
    updateFields.push(`fecha_recepcion = $${paramCount}`);
    updateValues.push(new Date().toISOString());

    // Agregar ID al final
    paramCount++;
    updateValues.push(recepcionId);

    const updateQuery = `
      UPDATE recepcion_equipo 
      SET ${updateFields.join(', ')}
      WHERE recepcion_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Error actualizando recepción',
        error: 'Actualización fallida'
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Recepción actualizada exitosamente',
      data: result.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error actualizando recepción:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error de base de datos'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/servicios/recepcion-equipos/[id] - Eliminar recepción específica
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

    const recepcionId = parseInt(params.id);
    
    if (isNaN(recepcionId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de recepción inválido',
        error: 'Parámetro inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la recepción existe
    const checkQuery = 'SELECT recepcion_id, estado_recepcion FROM recepcion_equipo WHERE recepcion_id = $1';
    const checkResult = await pool.query(checkQuery, [recepcionId]);
    
    if (checkResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Recepción no encontrada',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si hay diagnósticos asociados
    const diagnosticoQuery = 'SELECT diagnostico_id FROM diagnostico WHERE recepcion_id = $1';
    const diagnosticoResult = await pool.query(diagnosticoQuery, [recepcionId]);
    
    if (diagnosticoResult.rows.length > 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'No se puede eliminar la recepción porque tiene diagnósticos asociados',
        error: 'Restricción de integridad'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Eliminar detalles primero (por restricciones de clave foránea)
    await pool.query('DELETE FROM recepcion_equipo_detalle WHERE recepcion_id = $1', [recepcionId]);

    // Eliminar la recepción
    const deleteQuery = 'DELETE FROM recepcion_equipo WHERE recepcion_id = $1 RETURNING *';
    const result = await pool.query(deleteQuery, [recepcionId]);

    if (result.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Error eliminando recepción',
        error: 'Eliminación fallida'
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Recepción eliminada exitosamente',
      data: result.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error eliminando recepción:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error de base de datos'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
