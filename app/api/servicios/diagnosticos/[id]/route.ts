import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateDiagnosticoData,
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  UpdateDiagnosticoRequest, 
  ServiciosTecnicosApiResponse 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/diagnosticos/[id] - Obtener diagnóstico individual
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

    const diagnosticoId = parseInt(params.id);

    if (isNaN(diagnosticoId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de diagnóstico inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Query para obtener diagnóstico con información completa
    const diagnosticoQuery = `
      SELECT 
        d.diagnostico_id,
        d.recepcion_id,
        d.fecha_diagnostico,
        d.tecnico_id,
        d.observacion,
        d.estado_diagnostico,
        d.visita_tecnica_id,
        d.tipo_diag_id,
        d.motivo,
        t.nombre as tecnico_nombre,
        td.nombre as tipo_diagnostico_nombre,
        td.descripcion as tipo_diagnostico_descripcion,
        re.nro_recepcion,
        c.nombre as cliente_nombre
      FROM diagnostico d
      LEFT JOIN usuarios t ON d.tecnico_id = t.usuario_id
      LEFT JOIN tipo_diagnosticos td ON d.tipo_diag_id = td.tipo_diag_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      WHERE d.diagnostico_id = $1
    `;

    const diagnosticoResult = await pool.query(diagnosticoQuery, [diagnosticoId]);

    if (diagnosticoResult.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Diagnóstico no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const diagnostico = diagnosticoResult.rows[0];

    // Query para obtener detalles del diagnóstico
    const detallesQuery = `
      SELECT 
        dd.detalle_id,
        dd.diagnostico_id,
        dd.equipo_id,
        dd.observacion,
        dd.cantidad,
        e.nombre_equipo,
        e.numero_serie,
        e.marca,
        e.modelo
      FROM diagnostico_detalle dd
      LEFT JOIN equipos e ON dd.equipo_id = e.equipo_id
      WHERE dd.diagnostico_id = $1
      ORDER BY dd.detalle_id
    `;

    const detallesResult = await pool.query(detallesQuery, [diagnosticoId]);
    const detalles = detallesResult.rows;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Diagnóstico obtenido exitosamente',
      data: {
        ...diagnostico,
        equipos: detalles
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error obteniendo diagnóstico:', error);
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/servicios/diagnosticos/[id] - Actualizar diagnóstico
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

    const diagnosticoId = parseInt(params.id);

    if (isNaN(diagnosticoId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de diagnóstico inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: UpdateDiagnosticoRequest = await request.json();

    // Validar datos
    const validation = validateDiagnosticoData(body);
    if (!validation.valid) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el diagnóstico existe
    const existingDiagnosticoQuery = 'SELECT diagnostico_id, estado_diagnostico FROM diagnostico WHERE diagnostico_id = $1';
    const existingDiagnostico = await pool.query(existingDiagnosticoQuery, [diagnosticoId]);

    if (existingDiagnostico.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Diagnóstico no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el diagnóstico puede ser modificado
    if (existingDiagnostico.rows[0].estado_diagnostico === 'Completado') {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'No se puede modificar un diagnóstico completado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el técnico existe
    if (body.tecnico_id) {
      const tecnicoQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
      const tecnicoResult = await pool.query(tecnicoQuery, [body.tecnico_id]);
      
      if (tecnicoResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'El técnico especificado no existe',
          error: 'Técnico inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el tipo de diagnóstico existe
    if (body.tipo_diag_id) {
      const tipoDiagQuery = 'SELECT tipo_diag_id FROM tipo_diagnosticos WHERE tipo_diag_id = $1 AND activo = true';
      const tipoDiagResult = await pool.query(tipoDiagQuery, [body.tipo_diag_id]);
      
      if (tipoDiagResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'El tipo de diagnóstico especificado no existe o está inactivo',
          error: 'Tipo de diagnóstico inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Validar restricción de relación única
    // Si ambos campos tienen valores válidos (no null, no 0), rechazar
    if (body.recepcion_id && body.visita_tecnica_id && body.visita_tecnica_id !== 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Un diagnóstico debe estar asociado solo a una recepción O a una visita técnica, no a ambas',
        error: 'Relación inválida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.tecnico_id !== undefined) {
      paramCount++;
      updateFields.push(`tecnico_id = $${paramCount}`);
      updateValues.push(body.tecnico_id);
    }

    if (body.observacion !== undefined) {
      paramCount++;
      updateFields.push(`observacion = $${paramCount}`);
      updateValues.push(body.observacion);
    }

    if (body.estado_diagnostico !== undefined) {
      paramCount++;
      updateFields.push(`estado_diagnostico = $${paramCount}`);
      updateValues.push(body.estado_diagnostico);
    }

    if (body.tipo_diag_id !== undefined) {
      paramCount++;
      updateFields.push(`tipo_diag_id = $${paramCount}`);
      updateValues.push(body.tipo_diag_id);
    }

    if (body.recepcion_id !== undefined) {
      paramCount++;
      updateFields.push(`recepcion_id = $${paramCount}`);
      updateValues.push(body.recepcion_id);
      
      // Si se está estableciendo recepcion_id, asegurar que visita_tecnica_id sea NULL
      // Esto incluye el caso cuando visita_tecnica_id es 0 (que debe tratarse como NULL)
      if (body.visita_tecnica_id === undefined || body.visita_tecnica_id === 0) {
        paramCount++;
        updateFields.push(`visita_tecnica_id = $${paramCount}`);
        updateValues.push(null);
      }
    }

    if (body.visita_tecnica_id !== undefined && body.visita_tecnica_id !== 0) {
      paramCount++;
      updateFields.push(`visita_tecnica_id = $${paramCount}`);
      updateValues.push(body.visita_tecnica_id);
      
      // Si se está estableciendo visita_tecnica_id válido, asegurar que recepcion_id sea NULL
      if (body.recepcion_id === undefined) {
        paramCount++;
        updateFields.push(`recepcion_id = $${paramCount}`);
        updateValues.push(null);
      }
    }

    if (updateFields.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar diagnóstico
    paramCount++;
    updateValues.push(diagnosticoId);

    const updateQuery = `
      UPDATE diagnostico 
      SET ${updateFields.join(', ')}
      WHERE diagnostico_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Actualizar detalles si se proporcionan
    if (body.equipos && body.equipos.length > 0) {
      // Eliminar detalles existentes
      await pool.query('DELETE FROM diagnostico_detalle WHERE diagnostico_id = $1', [diagnosticoId]);

      // Insertar nuevos detalles
      for (const equipo of body.equipos) {
        await pool.query(
          'INSERT INTO diagnostico_detalle (diagnostico_id, equipo_id, observacion, cantidad) VALUES ($1, $2, $3, $4)',
          [diagnosticoId, equipo.equipo_id, equipo.observacion || null, equipo.cantidad || 1]
        );
      }
    }

    // Obtener diagnóstico actualizado
    const getDiagnosticoQuery = `
      SELECT 
        d.diagnostico_id,
        d.recepcion_id,
        d.fecha_diagnostico,
        d.tecnico_id,
        d.observacion,
        d.estado_diagnostico,
        d.visita_tecnica_id,
        d.tipo_diag_id,
        d.motivo,
        t.nombre as tecnico_nombre,
        td.nombre as tipo_diagnostico_nombre,
        td.descripcion as tipo_diagnostico_descripcion
      FROM diagnostico d
      LEFT JOIN usuarios t ON d.tecnico_id = t.usuario_id
      LEFT JOIN tipo_diagnosticos td ON d.tipo_diag_id = td.tipo_diag_id
      WHERE d.diagnostico_id = $1
    `;

    const diagnosticoData = await pool.query(getDiagnosticoQuery, [diagnosticoId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Diagnóstico actualizado exitosamente',
      data: diagnosticoData.rows[0]
    };

    // Log de auditoría
    console.log('Diagnóstico actualizado:', sanitizeForLog({
      diagnostico_id: diagnosticoId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error actualizando diagnóstico:', error);
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/servicios/diagnosticos/[id] - Eliminar diagnóstico
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

    const diagnosticoId = parseInt(params.id);

    if (isNaN(diagnosticoId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de diagnóstico inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el diagnóstico existe
    const existingDiagnosticoQuery = 'SELECT diagnostico_id, estado_diagnostico FROM diagnostico WHERE diagnostico_id = $1';
    const existingDiagnostico = await pool.query(existingDiagnosticoQuery, [diagnosticoId]);

    if (existingDiagnostico.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Diagnóstico no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el diagnóstico puede ser eliminado
    if (existingDiagnostico.rows[0].estado_diagnostico === 'Completado') {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'No se puede eliminar un diagnóstico completado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Eliminar diagnóstico (los detalles se eliminan automáticamente por CASCADE)
    await pool.query('DELETE FROM diagnostico WHERE diagnostico_id = $1', [diagnosticoId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Diagnóstico eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Diagnóstico eliminado:', sanitizeForLog({
      diagnostico_id: diagnosticoId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error eliminando diagnóstico:', error);
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
