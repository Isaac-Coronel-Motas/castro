import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return NextResponse.json({ success: false, message: error || 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url)
    const fecha_desde = searchParams.get('fecha_desde')
    const fecha_hasta = searchParams.get('fecha_hasta')
    const sucursal_id = searchParams.get('sucursal_id')
    const tecnico_id = searchParams.get('tecnico_id')
    const cliente_id = searchParams.get('cliente_id')
    const estado = searchParams.get('estado')
    const estado_presupuesto = searchParams.get('estado_presupuesto')
    const tipo_presupuesto = searchParams.get('tipo_presupuesto')
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (fecha_desde) {
      whereConditions.push(`DATE(ps.fecha_presupuesto) >= $${queryParams.length + 1}`)
      queryParams.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push(`DATE(ps.fecha_presupuesto) <= $${queryParams.length + 1}`)
      queryParams.push(fecha_hasta)
    }
    if (sucursal_id) {
      whereConditions.push(`ps.sucursal_id = $${queryParams.length + 1}`)
      queryParams.push(sucursal_id)
    }
    if (tecnico_id) {
      whereConditions.push(`ps.usuario_id = $${queryParams.length + 1}`)
      queryParams.push(tecnico_id)
    }
    if (cliente_id) {
      whereConditions.push(`ss.cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    if (estado) {
      whereConditions.push(`ps.estado = $${queryParams.length + 1}`)
      queryParams.push(estado)
    }
    if (estado_presupuesto) {
      whereConditions.push(`ps.estado = $${queryParams.length + 1}`)
      queryParams.push(estado_presupuesto)
    }
    if (tipo_presupuesto) {
      whereConditions.push(`ps.tipo_presu = $${queryParams.length + 1}`)
      queryParams.push(tipo_presupuesto)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT ps.presu_serv_id) as total_registros,
        COALESCE(SUM(ps.monto_presu_ser), 0) as valor_total,
        ROUND(AVG(ps.monto_presu_ser), 2) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM presupuesto_servicios ps
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        ps.estado,
        COUNT(DISTINCT ps.presu_serv_id) as cantidad,
        ROUND((COUNT(DISTINCT ps.presu_serv_id) * 100.0 / (SELECT COUNT(DISTINCT ps2.presu_serv_id) FROM presupuesto_servicios ps2 LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id ${whereClause.replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM presupuesto_servicios ps
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY ps.estado
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Top técnicos
    const porTecnicoQuery = `
      SELECT 
        u.usuario_id as tecnico_id,
        u.nombre as tecnico_nombre,
        COUNT(DISTINCT ps.presu_serv_id) as cantidad_registros,
        COALESCE(SUM(ps.monto_presu_ser), 0) as valor_total,
        ROUND((COUNT(DISTINCT ps.presu_serv_id) * 100.0 / (SELECT COUNT(DISTINCT ps2.presu_serv_id) FROM presupuesto_servicios ps2 LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id ${whereClause.replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM presupuesto_servicios ps
      LEFT JOIN usuarios u ON ps.usuario_id = u.usuario_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY u.usuario_id, u.nombre
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porTecnicoResult = await pool.query(porTecnicoQuery, queryParams)

    // Top clientes
    const porClienteQuery = `
      SELECT 
        c.cliente_id,
        c.nombre as cliente_nombre,
        COUNT(DISTINCT ps.presu_serv_id) as cantidad_registros,
        COALESCE(SUM(ps.monto_presu_ser), 0) as valor_total,
        ROUND((COUNT(DISTINCT ps.presu_serv_id) * 100.0 / (SELECT COUNT(DISTINCT ps2.presu_serv_id) FROM presupuesto_servicios ps2 LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id ${whereClause.replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM presupuesto_servicios ps
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      ${whereClause}
      GROUP BY c.cliente_id, c.nombre
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porClienteResult = await pool.query(porClienteQuery, queryParams)

    // Distribución por sucursal
    const porSucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre as sucursal_nombre,
        COUNT(DISTINCT ps.presu_serv_id) as cantidad_registros,
        COALESCE(SUM(ps.monto_presu_ser), 0) as valor_total,
        ROUND((COUNT(DISTINCT ps.presu_serv_id) * 100.0 / (SELECT COUNT(DISTINCT ps2.presu_serv_id) FROM presupuesto_servicios ps2 LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id ${whereClause.replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM presupuesto_servicios ps
      LEFT JOIN sucursales s ON ps.sucursal_id = s.sucursal_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY cantidad_registros DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Distribución por tipo de presupuesto
    const porTipoPresupuestoQuery = `
      SELECT 
        ps.tipo_presu as tipo_presupuesto,
        ps.tipo_presu as tipo_presupuesto_nombre,
        COUNT(DISTINCT ps.presu_serv_id) as cantidad_registros,
        COALESCE(SUM(ps.monto_presu_ser), 0) as valor_total,
        ROUND((COUNT(DISTINCT ps.presu_serv_id) * 100.0 / (SELECT COUNT(DISTINCT ps2.presu_serv_id) FROM presupuesto_servicios ps2 LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id ${whereClause.replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM presupuesto_servicios ps
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY ps.tipo_presu
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porTipoPresupuestoResult = await pool.query(porTipoPresupuestoQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(ps.fecha_presupuesto, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM ps.fecha_presupuesto) as año,
        COUNT(DISTINCT ps.presu_serv_id) as cantidad_registros,
        COALESCE(SUM(ps.monto_presu_ser), 0) as valor_total,
        CASE 
          WHEN COUNT(DISTINCT ps.presu_serv_id) > LAG(COUNT(DISTINCT ps.presu_serv_id)) OVER (ORDER BY TO_CHAR(ps.fecha_presupuesto, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(DISTINCT ps.presu_serv_id) < LAG(COUNT(DISTINCT ps.presu_serv_id)) OVER (ORDER BY TO_CHAR(ps.fecha_presupuesto, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM presupuesto_servicios ps
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY TO_CHAR(ps.fecha_presupuesto, 'YYYY-MM'), EXTRACT(YEAR FROM ps.fecha_presupuesto)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasResult = await pool.query(tendenciasQuery, queryParams)

    const informe = {
      resumen: {
        total_registros: parseInt(resumen.total_registros) || 0,
        valor_total: parseFloat(resumen.valor_total) || 0,
        promedio_por_registro: parseFloat(resumen.promedio_por_registro) || 0,
        tendencia_periodo_anterior: parseFloat(resumen.tendencia_periodo_anterior) || 0,
        porcentaje_cambio: parseFloat(resumen.porcentaje_cambio) || 0
      },
      por_estado: porEstadoResult.rows,
      por_tecnico: porTecnicoResult.rows,
      por_cliente: porClienteResult.rows,
      por_sucursal: porSucursalResult.rows,
      por_tipo_presupuesto: porTipoPresupuestoResult.rows,
      tendencias_mensuales: tendenciasResult.rows
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando informe de presupuestos:', error)
    return NextResponse.json({
      success: false,
      message: 'Error generando informe de presupuestos'
    }, { status: 500 })
  }
}
