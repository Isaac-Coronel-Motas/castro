import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/ventas/cobros/stats - Estadísticas de cobros
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const caja_id = searchParams.get('caja_id');
    const usuario_id = searchParams.get('usuario_id');

    // Construir condiciones adicionales
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`c.fecha_cobro >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`c.fecha_cobro <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (caja_id) {
      paramCount++;
      additionalConditions.push(`c.caja_id = $${paramCount}`);
      queryParams.push(parseInt(caja_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`c.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    const whereClause = additionalConditions.length > 0 
      ? `WHERE ${additionalConditions.join(' AND ')}`
      : '';

    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_cobros,
        COALESCE(SUM(c.monto), 0) as monto_total,
        COALESCE(AVG(c.monto), 0) as promedio_cobro
      FROM cobros c
      ${whereClause}
    `;

    const statsResult = await pool.query(statsQuery, queryParams);
    const generalStats = statsResult.rows[0];

    // Estadísticas del día actual
    const todayQuery = `
      SELECT 
        COUNT(*) as cobros_hoy,
        COALESCE(SUM(c.monto), 0) as monto_hoy
      FROM cobros c
      WHERE c.fecha_cobro = CURRENT_DATE
      ${additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : ''}
    `;

    const todayResult = await pool.query(todayQuery, queryParams);
    const todayStats = todayResult.rows[0];

    // Estadísticas del mes actual
    const monthQuery = `
      SELECT 
        COUNT(*) as cobros_mes,
        COALESCE(SUM(c.monto), 0) as monto_mes
      FROM cobros c
      WHERE DATE_TRUNC('month', c.fecha_cobro) = DATE_TRUNC('month', CURRENT_DATE)
      ${additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : ''}
    `;

    const monthResult = await pool.query(monthQuery, queryParams);
    const monthStats = monthResult.rows[0];

    // Estadísticas por forma de cobro
    const formasCobroQuery = `
      SELECT 
        fc.nombre as forma_cobro,
        COUNT(*) as cantidad,
        COALESCE(SUM(c.monto), 0) as monto_total
      FROM cobros c
      LEFT JOIN ventas v ON c.venta_id = v.venta_id
      LEFT JOIN formas_cobro fc ON v.forma_cobro_id = fc.forma_cobro_id
      ${whereClause}
      GROUP BY fc.nombre
      ORDER BY monto_total DESC
    `;

    const formasCobroResult = await pool.query(formasCobroQuery, queryParams);

    // Estadísticas por caja
    const cajasQuery = `
      SELECT 
        caja.nro_caja,
        s.nombre as sucursal,
        COUNT(*) as cantidad,
        COALESCE(SUM(c.monto), 0) as monto_total
      FROM cobros c
      LEFT JOIN cajas caja ON c.caja_id = caja.caja_id
      LEFT JOIN sucursales s ON caja.sucursal_id = s.sucursal_id
      ${whereClause}
      GROUP BY caja.nro_caja, s.nombre
      ORDER BY monto_total DESC
    `;

    const cajasResult = await pool.query(cajasQuery, queryParams);

    // Estadísticas por usuario
    const usuariosQuery = `
      SELECT 
        u.nombre as usuario,
        COUNT(*) as cantidad,
        COALESCE(SUM(c.monto), 0) as monto_total
      FROM cobros c
      LEFT JOIN usuarios u ON c.usuario_id = u.usuario_id
      ${whereClause}
      GROUP BY u.nombre
      ORDER BY monto_total DESC
    `;

    const usuariosResult = await pool.query(usuariosQuery, queryParams);

    // Estadísticas por día (últimos 30 días)
    const dailyQuery = `
      SELECT 
        c.fecha_cobro,
        COUNT(*) as cantidad,
        COALESCE(SUM(c.monto), 0) as monto_total
      FROM cobros c
      WHERE c.fecha_cobro >= CURRENT_DATE - INTERVAL '30 days'
      ${additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : ''}
      GROUP BY c.fecha_cobro
      ORDER BY c.fecha_cobro DESC
    `;

    const dailyResult = await pool.query(dailyQuery, queryParams);

    const response = {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        general: {
          total_cobros: parseInt(generalStats.total_cobros),
          monto_total: parseFloat(generalStats.monto_total),
          promedio_cobro: parseFloat(generalStats.promedio_cobro)
        },
        hoy: {
          cobros_hoy: parseInt(todayStats.cobros_hoy),
          monto_hoy: parseFloat(todayStats.monto_hoy)
        },
        mes: {
          cobros_mes: parseInt(monthStats.cobros_mes),
          monto_mes: parseFloat(monthStats.monto_mes)
        },
        por_forma_cobro: formasCobroResult.rows.map(row => ({
          forma_cobro: row.forma_cobro || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          monto_total: parseFloat(row.monto_total)
        })),
        por_caja: cajasResult.rows.map(row => ({
          caja: `Caja ${row.nro_caja}`,
          sucursal: row.sucursal || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          monto_total: parseFloat(row.monto_total)
        })),
        por_usuario: usuariosResult.rows.map(row => ({
          usuario: row.usuario || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          monto_total: parseFloat(row.monto_total)
        })),
        por_dia: dailyResult.rows.map(row => ({
          fecha: row.fecha_cobro,
          cantidad: parseInt(row.cantidad),
          monto_total: parseFloat(row.monto_total)
        }))
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener estadísticas de cobros:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
