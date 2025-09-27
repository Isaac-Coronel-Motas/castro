import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateSolicitudServicioData, 
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  UpdateSolicitudServicioRequest,
  ServiciosTecnicosApiResponse
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/solicitudes-de-cliente/[id] - Obtener solicitud por ID
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

    const solicitudId = parseInt(params.id);
    
    if (isNaN(solicitudId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de solicitud inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Consulta principal con todos los detalles
    const query = `
      SELECT 
        ss.solicitud_id,
        ss.fecha_solicitud,
        ss.cliente_id,
        ss.direccion,
        ss.sucursal_id,
        ss.descripcion_problema,
        ss.recepcionado_por,
        ss.fecha_programada,
        ss.estado_solicitud,
        ss.observaciones,
        ss.ciudad_id,
        ss.nro_solicitud,
        ss.tipo_atencion,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        c.direccion as cliente_direccion,
        s.nombre as sucursal_nombre,
        ci.nombre as ciudad_nombre,
        u.nombre as recepcionado_por_nombre,
        vt.visita_id,
        vt.tecnico_id,
        vt.fecha_visita,
        vt.estado_visita,
        t.nombre as tecnico_nombre,
        COUNT(ssd.detalle_id) as total_servicios,
        COALESCE(SUM(ssd.cantidad * COALESCE(ssd.precio_unitario, 0)), 0) as monto_total
      FROM solicitud_servicio ss
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON ss.sucursal_id = s.sucursal_id
      LEFT JOIN ciudades ci ON ss.ciudad_id = ci.id
      LEFT JOIN usuarios u ON ss.recepcionado_por = u.usuario_id
      LEFT JOIN visita_tecnica vt ON ss.solicitud_id = vt.solicitud_id
      LEFT JOIN usuarios t ON vt.tecnico_id = t.usuario_id
      LEFT JOIN solicitud_servicio_det ssd ON ss.solicitud_id = ssd.solicitud_id
      WHERE ss.solicitud_id = $1
      GROUP BY ss.solicitud_id, ss.fecha_solicitud, ss.cliente_id, ss.direccion, 
               ss.sucursal_id, ss.descripcion_problema, ss.recepcionado_por, 
               ss.fecha_programada, ss.estado_solicitud, ss.observaciones, 
               ss.ciudad_id, ss.nro_solicitud, ss.tipo_atencion, c.nombre, 
               c.telefono, c.email, c.direccion, s.nombre, ci.nombre, u.nombre, 
               vt.visita_id, vt.tecnico_id, vt.fecha_visita, vt.estado_visita, t.nombre
    `;

    const result = await pool.query(query, [solicitudId]);
    
    if (result.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Solicitud no encontrada',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const solicitud = result.rows[0];

    // Obtener detalles de servicios
    const serviciosQuery = `
      SELECT 
        ssd.detalle_id,
        ssd.servicio_id,
        ssd.cantidad,
        ssd.precio_unitario,
        ssd.observaciones,
        s.nombre as servicio_nombre,
        s.descripcion as servicio_descripcion
      FROM solicitud_servicio_det ssd
      LEFT JOIN servicios s ON ssd.servicio_id = s.servicio_id
      WHERE ssd.solicitud_id = $1
    `;

    const serviciosResult = await pool.query(serviciosQuery, [solicitudId]);
    solicitud.servicios = serviciosResult.rows;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Solicitud obtenida exitosamente',
      data: solicitud
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/servicios/solicitudes-de-cliente/[id] - Actualizar solicitud
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.editar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const solicitudId = parseInt(params.id);
    
    if (isNaN(solicitudId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de solicitud inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: UpdateSolicitudServicioRequest = await request.json();

    // Verificar que la solicitud existe
    const existeQuery = 'SELECT solicitud_id FROM solicitud_servicio WHERE solicitud_id = $1';
    const existeResult = await pool.query(existeQuery, [solicitudId]);
    
    if (existeResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Solicitud no encontrada',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Validar datos si se proporcionan
    if (body.cliente_id || body.sucursal_id || body.recepcionado_por) {
      const validation = validateSolicitudServicioData(body as any);
      if (!validation.valid) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'Validación fallida',
          data: validation.errors
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar referencias si se proporcionan
    if (body.cliente_id) {
      const clienteQuery = 'SELECT cliente_id FROM clientes WHERE cliente_id = $1';
      const clienteResult = await pool.query(clienteQuery, [body.cliente_id]);
      
      if (clienteResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'El cliente especificado no existe',
          error: 'Cliente inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    if (body.sucursal_id) {
      const sucursalQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
      const sucursalResult = await pool.query(sucursalQuery, [body.sucursal_id]);
      
      if (sucursalResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'La sucursal especificada no existe',
          error: 'Sucursal inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    if (body.recepcionado_por) {
      const usuarioQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
      const usuarioResult = await pool.query(usuarioQuery, [body.recepcionado_por]);
      
      if (usuarioResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'El usuario especificado no existe',
          error: 'Usuario inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Construir query de actualización dinámicamente
    const updateFields: string[] = [];
    const updateParams: any[] = [];
    let paramIndex = 1;

    if (body.cliente_id !== undefined) {
      updateFields.push(`cliente_id = $${paramIndex++}`);
      updateParams.push(body.cliente_id);
    }
    if (body.direccion !== undefined) {
      updateFields.push(`direccion = $${paramIndex++}`);
      updateParams.push(body.direccion);
    }
    if (body.sucursal_id !== undefined) {
      updateFields.push(`sucursal_id = $${paramIndex++}`);
      updateParams.push(body.sucursal_id);
    }
    if (body.descripcion_problema !== undefined) {
      updateFields.push(`descripcion_problema = $${paramIndex++}`);
      updateParams.push(body.descripcion_problema);
    }
    if (body.recepcionado_por !== undefined) {
      updateFields.push(`recepcionado_por = $${paramIndex++}`);
      updateParams.push(body.recepcionado_por);
    }
    if (body.fecha_programada !== undefined) {
      updateFields.push(`fecha_programada = $${paramIndex++}`);
      updateParams.push(body.fecha_programada);
    }
    if (body.estado_solicitud !== undefined) {
      updateFields.push(`estado_solicitud = $${paramIndex++}`);
      updateParams.push(body.estado_solicitud);
    }
    if (body.observaciones !== undefined) {
      updateFields.push(`observaciones = $${paramIndex++}`);
      updateParams.push(body.observaciones);
    }
    if (body.ciudad_id !== undefined) {
      updateFields.push(`ciudad_id = $${paramIndex++}`);
      updateParams.push(body.ciudad_id);
    }
    if (body.tipo_atencion !== undefined) {
      updateFields.push(`tipo_atencion = $${paramIndex++}`);
      updateParams.push(body.tipo_atencion);
    }

    if (updateFields.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'No se proporcionaron campos para actualizar',
        error: 'Sin campos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateParams.push(solicitudId);

    const updateQuery = `
      UPDATE solicitud_servicio 
      SET ${updateFields.join(', ')}
      WHERE solicitud_id = $${paramIndex}
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, updateParams);
    const solicitudActualizada = updateResult.rows[0];

    // Actualizar detalles de servicios si se proporcionan
    if (body.servicios !== undefined) {
      // Eliminar detalles existentes
      await pool.query('DELETE FROM solicitud_servicio_det WHERE solicitud_id = $1', [solicitudId]);

      // Insertar nuevos detalles
      if (body.servicios.length > 0) {
        for (const servicio of body.servicios) {
          const detalleQuery = `
            INSERT INTO solicitud_servicio_det (
              solicitud_id, servicio_id, cantidad, precio_unitario, observaciones
            ) VALUES ($1, $2, $3, $4, $5)
          `;
          
          await pool.query(detalleQuery, [
            solicitudId,
            servicio.servicio_id,
            servicio.cantidad,
            servicio.precio_unitario || null,
            servicio.observaciones || null
          ]);
        }
      }
    }

    // Obtener la solicitud completa actualizada
    const selectQuery = `
      SELECT 
        ss.*,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        s.nombre as sucursal_nombre,
        ci.nombre as ciudad_nombre,
        u.nombre as recepcionado_por_nombre
      FROM solicitud_servicio ss
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON ss.sucursal_id = s.sucursal_id
      LEFT JOIN ciudades ci ON ss.ciudad_id = ci.id
      LEFT JOIN usuarios u ON ss.recepcionado_por = u.usuario_id
      WHERE ss.solicitud_id = $1
    `;

    const selectResult = await pool.query(selectQuery, [solicitudId]);
    const solicitudCompleta = selectResult.rows[0];

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Solicitud actualizada exitosamente',
      data: solicitudCompleta
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/servicios/solicitudes-de-cliente/[id] - Eliminar solicitud
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

    const solicitudId = parseInt(params.id);
    
    if (isNaN(solicitudId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de solicitud inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la solicitud existe
    const existeQuery = 'SELECT solicitud_id FROM solicitud_servicio WHERE solicitud_id = $1';
    const existeResult = await pool.query(existeQuery, [solicitudId]);
    
    if (existeResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Solicitud no encontrada',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si tiene dependencias (visitas técnicas, órdenes de servicio, etc.)
    const dependenciasQuery = `
      SELECT 
        (SELECT COUNT(*) FROM visita_tecnica WHERE solicitud_id = $1) as visitas_count,
        (SELECT COUNT(*) FROM orden_servicio WHERE solicitud_id = $1) as ordenes_count,
        (SELECT COUNT(*) FROM presupuesto_servicio WHERE solicitud_id = $1) as presupuestos_count
    `;
    
    const dependenciasResult = await pool.query(dependenciasQuery, [solicitudId]);
    const dependencias = dependenciasResult.rows[0];

    if (dependencias.visitas_count > 0 || dependencias.ordenes_count > 0 || dependencias.presupuestos_count > 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'No se puede eliminar la solicitud porque tiene dependencias asociadas',
        error: 'Dependencias existentes',
        data: {
          visitas: dependencias.visitas_count,
          ordenes: dependencias.ordenes_count,
          presupuestos: dependencias.presupuestos_count
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Eliminar detalles de servicios primero
    await pool.query('DELETE FROM solicitud_servicio_det WHERE solicitud_id = $1', [solicitudId]);

    // Eliminar la solicitud
    const deleteQuery = 'DELETE FROM solicitud_servicio WHERE solicitud_id = $1 RETURNING *';
    const deleteResult = await pool.query(deleteQuery, [solicitudId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Solicitud eliminada exitosamente',
      data: deleteResult.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
