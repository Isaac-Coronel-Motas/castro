import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateDiagnosticoData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  generateDiagnosticoNumber,
  sanitizeForLog 
} from '@/lib/utils/servicios-tecnicos';
import { 
  CreateDiagnosticoRequest, 
  ServiciosTecnicosApiResponse, 
  FiltrosDiagnosticos 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/diagnosticos - Listar diagnósticos
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_diagnostico';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado_diagnostico = searchParams.get('estado_diagnostico');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const tecnico_id = searchParams.get('tecnico_id');
    const tipo_diag_id = searchParams.get('tipo_diag_id');
    const recepcion_id = searchParams.get('recepcion_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['d.observacion', 'd.motivo', 't.nombre', 'td.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado_diagnostico) {
      paramCount++;
      additionalConditions.push(`d.estado_diagnostico = $${paramCount}`);
      queryParams.push(estado_diagnostico);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`DATE(d.fecha_diagnostico) >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`DATE(d.fecha_diagnostico) <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (tecnico_id) {
      paramCount++;
      additionalConditions.push(`d.tecnico_id = $${paramCount}`);
      queryParams.push(parseInt(tecnico_id));
    }

    if (tipo_diag_id) {
      paramCount++;
      additionalConditions.push(`d.tipo_diag_id = $${paramCount}`);
      queryParams.push(parseInt(tipo_diag_id));
    }

    if (recepcion_id) {
      paramCount++;
      additionalConditions.push(`d.recepcion_id = $${paramCount}`);
      queryParams.push(parseInt(recepcion_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions, queryParams);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'd', 'fecha_diagnostico');

    // Consulta principal
    const query = `
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
        c.nombre as cliente_nombre,
        COUNT(dd.detalle_id) as total_equipos,
        CASE 
          WHEN d.estado_diagnostico = 'Pendiente' THEN 'Pendiente'
          WHEN d.estado_diagnostico = 'En proceso' THEN 'En Proceso'
          WHEN d.estado_diagnostico = 'Completado' THEN 'Completado'
          WHEN d.estado_diagnostico = 'Rechazado' THEN 'Rechazado'
          WHEN d.estado_diagnostico = 'Cancelado' THEN 'Cancelado'
        END as estado_display,
        CASE 
          WHEN d.estado_diagnostico = 'Pendiente' THEN 'Iniciar'
          WHEN d.estado_diagnostico = 'En proceso' THEN 'Completar'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM diagnostico d
      LEFT JOIN usuarios t ON d.tecnico_id = t.usuario_id
      LEFT JOIN tipo_diagnosticos td ON d.tipo_diag_id = td.tipo_diag_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN diagnostico_detalle dd ON d.diagnostico_id = dd.diagnostico_id
      ${whereClause}
      GROUP BY d.diagnostico_id, d.recepcion_id, d.fecha_diagnostico, d.tecnico_id, 
               d.observacion, d.estado_diagnostico, d.visita_tecnica_id, d.tipo_diag_id, 
               d.motivo, t.nombre, td.nombre, td.descripcion, re.nro_recepcion, c.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const diagnosticos = result.rows;
    const total = diagnosticos.length > 0 ? parseInt(diagnosticos[0].total_count) : 0;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Diagnósticos obtenidos exitosamente',
      data: diagnosticos.map(d => {
        const { total_count, ...diagnostico } = d;
        return diagnostico;
      }),
      pagination: {
        page,
        limit: limitParam,
        total,
        total_pages: Math.ceil(total / limitParam)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener diagnósticos:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/servicios/diagnosticos - Crear diagnóstico
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateDiagnosticoRequest = await request.json();

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

    // Verificar que el técnico existe
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

    // Verificar que el tipo de diagnóstico existe
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

    // Verificar que la recepción existe si se proporciona
    if (body.recepcion_id) {
      const recepcionQuery = 'SELECT recepcion_id FROM recepcion_equipo WHERE recepcion_id = $1';
      const recepcionResult = await pool.query(recepcionQuery, [body.recepcion_id]);
      
      if (recepcionResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'La recepción especificada no existe',
          error: 'Recepción inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que la visita técnica existe si se proporciona
    if (body.visita_tecnica_id) {
      const visitaQuery = 'SELECT visita_id FROM visita_tecnica WHERE visita_id = $1';
      const visitaResult = await pool.query(visitaQuery, [body.visita_tecnica_id]);
      
      if (visitaResult.rows.length === 0) {
        const response: ServiciosTecnicosApiResponse = {
          success: false,
          message: 'La visita técnica especificada no existe',
          error: 'Visita técnica inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que los equipos existen
    if (body.equipos && body.equipos.length > 0) {
      for (const equipo of body.equipos) {
        const equipoQuery = 'SELECT equipo_id FROM equipos WHERE equipo_id = $1';
        const equipoResult = await pool.query(equipoQuery, [equipo.equipo_id]);
        
        if (equipoResult.rows.length === 0) {
          const response: ServiciosTecnicosApiResponse = {
            success: false,
            message: `El equipo con ID ${equipo.equipo_id} no existe`,
            error: 'Equipo inválido'
          };
          return NextResponse.json(response, { status: 400 });
        }
      }
    }

    // Crear diagnóstico
    const createDiagnosticoQuery = `
      INSERT INTO diagnostico (
        recepcion_id, tecnico_id, observacion, estado_diagnostico, 
        visita_tecnica_id, tipo_diag_id, motivo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING diagnostico_id
    `;

    const diagnosticoResult = await pool.query(createDiagnosticoQuery, [
      body.recepcion_id || null,
      body.tecnico_id,
      body.observacion,
      body.estado_diagnostico || 'Pendiente',
      body.visita_tecnica_id || null,
      body.tipo_diag_id,
      body.motivo || null
    ]);

    const newDiagnosticoId = diagnosticoResult.rows[0].diagnostico_id;

    // Crear detalles del diagnóstico
    if (body.equipos && body.equipos.length > 0) {
      for (const equipo of body.equipos) {
        await pool.query(
          'INSERT INTO diagnostico_detalle (diagnostico_id, equipo_id, observacion, cantidad) VALUES ($1, $2, $3, $4)',
          [
            newDiagnosticoId, 
            equipo.equipo_id, 
            equipo.observacion || null,
            equipo.cantidad || 1
          ]
        );
      }
    }

    // Obtener el diagnóstico creado con información completa
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

    const diagnosticoData = await pool.query(getDiagnosticoQuery, [newDiagnosticoId]);

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Diagnóstico creado exitosamente',
      data: diagnosticoData.rows[0]
    };

    // Log de auditoría
    console.log('Diagnóstico creado:', sanitizeForLog({
      diagnostico_id: newDiagnosticoId,
      tecnico_id: body.tecnico_id,
      tipo_diag_id: body.tipo_diag_id,
      recepcion_id: body.recepcion_id,
      visita_tecnica_id: body.visita_tecnica_id,
      total_equipos: body.equipos?.length || 0,
      estado_diagnostico: body.estado_diagnostico || 'Pendiente',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear diagnóstico:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/servicios/diagnosticos/[id]/completar - Completar diagnóstico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const diagnosticoId = parseInt(params.id);

    if (isNaN(diagnosticoId)) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'ID de diagnóstico inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el diagnóstico existe
    const existingDiagnosticoQuery = 'SELECT diagnostico_id, estado_diagnostico FROM diagnostico WHERE diagnostico_id = $1';
    const existingDiagnostico = await pool.query(existingDiagnosticoQuery, [diagnosticoId]);
    
    if (existingDiagnostico.rows.length === 0) {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Diagnóstico no encontrado',
        error: 'Diagnóstico no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el diagnóstico puede ser completado
    if (existingDiagnostico.rows[0].estado_diagnostico !== 'En proceso') {
      const response: ServiciosTecnicosApiResponse = {
        success: false,
        message: 'Solo se pueden completar diagnósticos en proceso',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Marcar diagnóstico como completado
    await pool.query(
      'UPDATE diagnostico SET estado_diagnostico = $1 WHERE diagnostico_id = $2',
      ['Completado', diagnosticoId]
    );

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Diagnóstico completado exitosamente'
    };

    // Log de auditoría
    console.log('Diagnóstico completado:', sanitizeForLog({
      diagnostico_id: diagnosticoId,
      nro_diagnostico: generateDiagnosticoNumber(diagnosticoId),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al completar diagnóstico:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
