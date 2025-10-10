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
    const cliente_id = searchParams.get('cliente_id')
    const estado = searchParams.get('estado')
    const estado_reclamo = searchParams.get('estado_reclamo')
    const recibido_por = searchParams.get('recibido_por')
    const gestionado_por = searchParams.get('gestionado_por')
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (fecha_desde) {
      whereConditions.push(`DATE(r.fecha_reclamo) >= $${queryParams.length + 1}`)
      queryParams.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push(`DATE(r.fecha_reclamo) <= $${queryParams.length + 1}`)
      queryParams.push(fecha_hasta)
    }
    if (sucursal_id) {
      whereConditions.push(`re.sucursal_id = $${queryParams.length + 1}`)
      queryParams.push(sucursal_id)
    }
    if (cliente_id) {
      whereConditions.push(`r.cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    if (estado) {
      whereConditions.push(`r.estado = $${queryParams.length + 1}`)
      queryParams.push(estado)
    }
    if (estado_reclamo) {
      whereConditions.push(`r.estado = $${queryParams.length + 1}`)
      queryParams.push(estado_reclamo)
    }
    if (recibido_por) {
      whereConditions.push(`r.recibido_por = $${queryParams.length + 1}`)
      queryParams.push(recibido_por)
    }
    if (gestionado_por) {
      whereConditions.push(`r.gestionado_por = $${queryParams.length + 1}`)
      queryParams.push(gestionado_por)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT r.reclamo_id) as total_registros,
        0 as valor_total,
        ROUND(AVG(1), 2) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM reclamos r
      LEFT JOIN orden_servicio os ON r.orden_servicio_id = os.orden_servicio_id
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        r.estado,
        COUNT(DISTINCT r.reclamo_id) as cantidad,
        ROUND((COUNT(DISTINCT r.reclamo_id) * 100.0 / (SELECT COUNT(DISTINCT r2.reclamo_id) FROM reclamos r2 LEFT JOIN orden_servicio os2 ON r2.orden_servicio_id = os2.orden_servicio_id LEFT JOIN presupuesto_servicios ps2 ON os2.presu_serv_id = ps2.presu_serv_id LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id ${whereClause.replace('r.', 'r2.').replace('os.', 'os2.').replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.')})), 2) as porcentaje
      FROM reclamos r
      LEFT JOIN orden_servicio os ON r.orden_servicio_id = os.orden_servicio_id
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      ${whereClause}
      GROUP BY r.estado
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Top clientes
    const porClienteQuery = `
      SELECT 
        c.cliente_id,
        c.nombre as cliente_nombre,
        COUNT(DISTINCT r.reclamo_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT r.reclamo_id) * 100.0 / (SELECT COUNT(DISTINCT r2.reclamo_id) FROM reclamos r2 LEFT JOIN orden_servicio os2 ON r2.orden_servicio_id = os2.orden_servicio_id LEFT JOIN presupuesto_servicios ps2 ON os2.presu_serv_id = ps2.presu_serv_id LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id ${whereClause.replace('r.', 'r2.').replace('os.', 'os2.').replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.')})), 2) as porcentaje
      FROM reclamos r
      LEFT JOIN clientes c ON r.cliente_id = c.cliente_id
      LEFT JOIN orden_servicio os ON r.orden_servicio_id = os.orden_servicio_id
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      ${whereClause}
      GROUP BY c.cliente_id, c.nombre
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porClienteResult = await pool.query(porClienteQuery, queryParams)

    // Top recibido por
    const porRecibidoPorQuery = `
      SELECT 
        u.usuario_id as tecnico_id,
        u.nombre as tecnico_nombre,
        COUNT(DISTINCT r.reclamo_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT r.reclamo_id) * 100.0 / (SELECT COUNT(DISTINCT r2.reclamo_id) FROM reclamos r2 LEFT JOIN orden_servicio os2 ON r2.orden_servicio_id = os2.orden_servicio_id LEFT JOIN presupuesto_servicios ps2 ON os2.presu_serv_id = ps2.presu_serv_id LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id ${whereClause.replace('r.', 'r2.').replace('os.', 'os2.').replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.')})), 2) as porcentaje
      FROM reclamos r
      LEFT JOIN usuarios u ON r.recibido_por = u.usuario_id
      LEFT JOIN orden_servicio os ON r.orden_servicio_id = os.orden_servicio_id
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      ${whereClause}
      GROUP BY u.usuario_id, u.nombre
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porRecibidoPorResult = await pool.query(porRecibidoPorQuery, queryParams)

    // Top gestionado por
    const porGestionadoPorQuery = `
      SELECT 
        u.usuario_id as tecnico_id,
        u.nombre as tecnico_nombre,
        COUNT(DISTINCT r.reclamo_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT r.reclamo_id) * 100.0 / (SELECT COUNT(DISTINCT r2.reclamo_id) FROM reclamos r2 LEFT JOIN orden_servicio os2 ON r2.orden_servicio_id = os2.orden_servicio_id LEFT JOIN presupuesto_servicios ps2 ON os2.presu_serv_id = ps2.presu_serv_id LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id ${whereClause.replace('r.', 'r2.').replace('os.', 'os2.').replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.')})), 2) as porcentaje
      FROM reclamos r
      LEFT JOIN usuarios u ON r.gestionado_por = u.usuario_id
      LEFT JOIN orden_servicio os ON r.orden_servicio_id = os.orden_servicio_id
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      ${whereClause}
      GROUP BY u.usuario_id, u.nombre
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porGestionadoPorResult = await pool.query(porGestionadoPorQuery, queryParams)

    // Distribución por sucursal
    const porSucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre as sucursal_nombre,
        COUNT(DISTINCT r.reclamo_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT r.reclamo_id) * 100.0 / (SELECT COUNT(DISTINCT r2.reclamo_id) FROM reclamos r2 LEFT JOIN orden_servicio os2 ON r2.orden_servicio_id = os2.orden_servicio_id LEFT JOIN presupuesto_servicios ps2 ON os2.presu_serv_id = ps2.presu_serv_id LEFT JOIN diagnostico d2 ON ps2.diagnostico_id = d2.diagnostico_id LEFT JOIN recepcion_equipo re2 ON d2.recepcion_id = re2.recepcion_id ${whereClause.replace('r.', 'r2.').replace('os.', 'os2.').replace('ps.', 'ps2.').replace('d.', 'd2.').replace('re.', 're2.')})), 2) as porcentaje
      FROM reclamos r
      LEFT JOIN orden_servicio os ON r.orden_servicio_id = os.orden_servicio_id
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN sucursales s ON re.sucursal_id = s.sucursal_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY cantidad_registros DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(r.fecha_reclamo, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM r.fecha_reclamo) as año,
        COUNT(DISTINCT r.reclamo_id) as cantidad_registros,
        CASE 
          WHEN COUNT(DISTINCT r.reclamo_id) > LAG(COUNT(DISTINCT r.reclamo_id)) OVER (ORDER BY TO_CHAR(r.fecha_reclamo, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(DISTINCT r.reclamo_id) < LAG(COUNT(DISTINCT r.reclamo_id)) OVER (ORDER BY TO_CHAR(r.fecha_reclamo, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM reclamos r
      LEFT JOIN orden_servicio os ON r.orden_servicio_id = os.orden_servicio_id
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      ${whereClause}
      GROUP BY TO_CHAR(r.fecha_reclamo, 'YYYY-MM'), EXTRACT(YEAR FROM r.fecha_reclamo)
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
      por_cliente: porClienteResult.rows,
      por_recibido_por: porRecibidoPorResult.rows,
      por_gestionado_por: porGestionadoPorResult.rows,
      por_sucursal: porSucursalResult.rows,
      tendencias_mensuales: tendenciasResult.rows
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando informe de reclamos:', error)
    return NextResponse.json({
      success: false,
      message: 'Error generando informe de reclamos'
    }, { status: 500 })
  }
}
