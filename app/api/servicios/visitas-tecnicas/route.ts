import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams
} from '@/lib/utils/servicios-tecnicos';
import { ServiciosTecnicosApiResponse } from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/visitas-tecnicas - Listar visitas técnicas
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_visita';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado_visita = searchParams.get('estado_visita');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const tecnico_id = searchParams.get('tecnico_id');
    const sucursal_id = searchParams.get('sucursal_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['vt.nro_visita', 'vt.motivo_estado', 'c.nombre', 't.nombre'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado_visita) {
      paramCount++;
      additionalConditions.push(`vt.estado_visita = $${paramCount}`);
      queryParams.push(estado_visita);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`DATE(vt.fecha_visita) >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`DATE(vt.fecha_visita) <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (tecnico_id) {
      paramCount++;
      additionalConditions.push(`vt.tecnico_id = $${paramCount}`);
      queryParams.push(parseInt(tecnico_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`vt.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions, queryParams);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'vt', 'fecha_visita');

    // Consulta principal
    const query = `
      SELECT 
        vt.visita_id,
        vt.solicitud_id,
        vt.fecha_visita,
        vt.creado_por,
        vt.tecnico_id,
        vt.estado_visita,
        vt.sucursal_id,
        vt.fecha_creacion,
        vt.nro_visita,
        vt.motivo_estado,
        vt.motivo_cambio_id,
        vt.reclamo_id,
        t.nombre as tecnico_nombre,
        c.nombre as cliente_nombre,
        s.nombre as sucursal_nombre,
        ss.nro_solicitud,
        CASE 
          WHEN vt.estado_visita = 'Pendiente' THEN 'Pendiente'
          WHEN vt.estado_visita = 'Realizada' THEN 'Realizada'
          WHEN vt.estado_visita = 'Reprogramada' THEN 'Reprogramada'
          WHEN vt.estado_visita = 'Cancelada' THEN 'Cancelada'
        END as estado_display,
        CASE 
          WHEN vt.estado_visita = 'Pendiente' THEN 'Iniciar'
          WHEN vt.estado_visita = 'Realizada' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM visita_tecnica vt
      LEFT JOIN usuarios t ON vt.tecnico_id = t.usuario_id
      LEFT JOIN solicitud_servicio ss ON vt.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON vt.sucursal_id = s.sucursal_id
      ${whereClause}
      GROUP BY vt.visita_id, vt.solicitud_id, vt.fecha_visita, vt.creado_por, 
               vt.tecnico_id, vt.estado_visita, vt.sucursal_id, vt.fecha_creacion, 
               vt.nro_visita, vt.motivo_estado, vt.motivo_cambio_id, vt.reclamo_id, 
               t.nombre, c.nombre, s.nombre, ss.nro_solicitud
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const visitas = result.rows;
    const total = visitas.length > 0 ? parseInt(visitas[0].total_count) : 0;

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Visitas técnicas obtenidas exitosamente',
      data: visitas.map(v => {
        const { total_count, ...visita } = v;
        return visita;
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
    console.error('Error al obtener visitas técnicas:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
