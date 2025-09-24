import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/ventas/presupuestos-servicios/stats - Estadísticas de presupuestos de servicios
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const usuario_id = searchParams.get('usuario_id');
    const sucursal_id = searchParams.get('sucursal_id');
    const estado = searchParams.get('estado');
    const tipo_presu = searchParams.get('tipo_presu');

    // Construir condiciones adicionales
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`ps.fecha_presupuesto >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`ps.fecha_presupuesto <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`ps.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`ps.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    if (estado) {
      paramCount++;
      additionalConditions.push(`ps.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (tipo_presu) {
      paramCount++;
      additionalConditions.push(`ps.tipo_presu = $${paramCount}`);
      queryParams.push(tipo_presu);
    }

    const whereClause = additionalConditions.length > 0 
      ? `WHERE ${additionalConditions.join(' AND ')}`
      : '';

    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_presupuestos,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_total,
        COALESCE(AVG(ps.monto_presu_ser), 0) as promedio_presupuesto
      FROM presupuesto_servicios ps
      ${whereClause}
    `;

    const statsResult = await pool.query(statsQuery, queryParams);
    const generalStats = statsResult.rows[0];

    // Estadísticas del día actual
    const todayQuery = `
      SELECT 
        COUNT(*) as presupuestos_hoy,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_hoy
      FROM presupuesto_servicios ps
      WHERE ps.fecha_presupuesto = CURRENT_DATE
      ${additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : ''}
    `;

    const todayResult = await pool.query(todayQuery, queryParams);
    const todayStats = todayResult.rows[0];

    // Estadísticas del mes actual
    const monthQuery = `
      SELECT 
        COUNT(*) as presupuestos_mes,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_mes
      FROM presupuesto_servicios ps
      WHERE DATE_TRUNC('month', ps.fecha_presupuesto) = DATE_TRUNC('month', CURRENT_DATE)
      ${additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : ''}
    `;

    const monthResult = await pool.query(monthQuery, queryParams);
    const monthStats = monthResult.rows[0];

    // Estadísticas por estado
    const estadoQuery = `
      SELECT 
        ps.estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_total
      FROM presupuesto_servicios ps
      ${whereClause}
      GROUP BY ps.estado
      ORDER BY monto_total DESC
    `;

    const estadoResult = await pool.query(estadoQuery, queryParams);

    // Estadísticas por tipo
    const tipoQuery = `
      SELECT 
        ps.tipo_presu,
        COUNT(*) as cantidad,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_total
      FROM presupuesto_servicios ps
      ${whereClause}
      GROUP BY ps.tipo_presu
      ORDER BY monto_total DESC
    `;

    const tipoResult = await pool.query(tipoQuery, queryParams);

    // Estadísticas por usuario
    const usuariosQuery = `
      SELECT 
        u.nombre as usuario,
        COUNT(*) as cantidad,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_total
      FROM presupuesto_servicios ps
      LEFT JOIN usuarios u ON ps.usuario_id = u.usuario_id
      ${whereClause}
      GROUP BY u.nombre
      ORDER BY monto_total DESC
    `;

    const usuariosResult = await pool.query(usuariosQuery, queryParams);

    // Estadísticas por día (últimos 30 días)
    const dailyQuery = `
      SELECT 
        ps.fecha_presupuesto,
        COUNT(*) as cantidad,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_total
      FROM presupuesto_servicios ps
      WHERE ps.fecha_presupuesto >= CURRENT_DATE - INTERVAL '30 days'
      ${additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : ''}
      GROUP BY ps.fecha_presupuesto
      ORDER BY ps.fecha_presupuesto DESC
    `;

    const dailyResult = await pool.query(dailyQuery, queryParams);

    const response = {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        general: {
          total_presupuestos: parseInt(generalStats.total_presupuestos),
          monto_total: parseFloat(generalStats.monto_total),
          promedio_presupuesto: parseFloat(generalStats.promedio_presupuesto)
        },
        hoy: {
          presupuestos_hoy: parseInt(todayStats.presupuestos_hoy),
          monto_hoy: parseFloat(todayStats.monto_hoy)
        },
        mes: {
          presupuestos_mes: parseInt(monthStats.presupuestos_mes),
          monto_mes: parseFloat(monthStats.monto_mes)
        },
        por_estado: estadoResult.rows.map(row => ({
          estado: row.estado || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          monto_total: parseFloat(row.monto_total)
        })),
        por_tipo: tipoResult.rows.map(row => ({
          tipo: row.tipo_presu || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          monto_total: parseFloat(row.monto_total)
        })),
        por_usuario: usuariosResult.rows.map(row => ({
          usuario: row.usuario || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          monto_total: parseFloat(row.monto_total)
        })),
        por_dia: dailyResult.rows.map(row => ({
          fecha: row.fecha_presupuesto,
          cantidad: parseInt(row.cantidad),
          monto_total: parseFloat(row.monto_total)
        }))
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener estadísticas de presupuestos:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
