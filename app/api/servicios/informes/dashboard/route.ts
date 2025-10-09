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
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (fecha_desde) {
      whereConditions.push(`DATE(fecha_solicitud) >= $${queryParams.length + 1}`)
      queryParams.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push(`DATE(fecha_solicitud) <= $${queryParams.length + 1}`)
      queryParams.push(fecha_hasta)
    }
    if (sucursal_id) {
      whereConditions.push(`sucursal_id = $${queryParams.length + 1}`)
      queryParams.push(sucursal_id)
    }
    if (tecnico_id) {
      whereConditions.push(`tecnico_id = $${queryParams.length + 1}`)
      queryParams.push(tecnico_id)
    }
    if (cliente_id) {
      whereConditions.push(`cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    if (estado) {
      whereConditions.push(`estado = $${queryParams.length + 1}`)
      queryParams.push(estado)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen general
    const resumenQuery = `
      SELECT 
        (SELECT COUNT(*) FROM solicitud_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}) as total_solicitudes,
        (SELECT COUNT(*) FROM recepcion_equipo ${whereClause.replace('fecha_solicitud', 'fecha_recepcion')}) as total_recepciones,
        (SELECT COUNT(*) FROM diagnostico ${whereClause.replace('fecha_solicitud', 'fecha_diagnostico')}) as total_diagnosticos,
        (SELECT COUNT(*) FROM presupuesto_servicios ${whereClause.replace('fecha_solicitud', 'fecha_presupuesto')}) as total_presupuestos,
        (SELECT COUNT(*) FROM orden_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}) as total_ordenes,
        (SELECT COUNT(*) FROM salida_equipo ${whereClause.replace('fecha_solicitud', 'fecha_salida')}) as total_retiros,
        (SELECT COUNT(*) FROM reclamos ${whereClause.replace('fecha_solicitud', 'fecha_reclamo')}) as total_reclamos,
        (SELECT COALESCE(SUM(monto_presu_ser), 0) FROM presupuesto_servicios ${whereClause.replace('fecha_solicitud', 'fecha_presupuesto')}) as valor_total_presupuestos,
        (SELECT COALESCE(SUM(monto_servicio), 0) FROM orden_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}) as valor_total_ordenes,
        (SELECT COALESCE(SUM(monto_presu_ser), 0) FROM presupuesto_servicios ${whereClause.replace('fecha_solicitud', 'fecha_presupuesto')}) + 
        (SELECT COALESCE(SUM(monto_servicio), 0) FROM orden_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}) as valor_total_general
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado - Solicitudes
    const solicitudesEstadoQuery = `
      SELECT 
        estado_solicitud as estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM solicitud_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')})), 2) as porcentaje
      FROM solicitud_servicio
      ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}
      GROUP BY estado_solicitud
      ORDER BY cantidad DESC
    `

    const solicitudesEstadoResult = await pool.query(solicitudesEstadoQuery, queryParams)

    // Distribución por estado - Recepciones
    const recepcionesEstadoQuery = `
      SELECT 
        estado_recepcion as estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM recepcion_equipo ${whereClause.replace('fecha_solicitud', 'fecha_recepcion')})), 2) as porcentaje
      FROM recepcion_equipo
      ${whereClause.replace('fecha_solicitud', 'fecha_recepcion')}
      GROUP BY estado_recepcion
      ORDER BY cantidad DESC
    `

    const recepcionesEstadoResult = await pool.query(recepcionesEstadoQuery, queryParams)

    // Distribución por estado - Diagnósticos
    const diagnosticosEstadoQuery = `
      SELECT 
        estado_diagnostico as estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM diagnostico ${whereClause.replace('fecha_solicitud', 'fecha_diagnostico')})), 2) as porcentaje
      FROM diagnostico
      ${whereClause.replace('fecha_solicitud', 'fecha_diagnostico')}
      GROUP BY estado_diagnostico
      ORDER BY cantidad DESC
    `

    const diagnosticosEstadoResult = await pool.query(diagnosticosEstadoQuery, queryParams)

    // Distribución por estado - Presupuestos
    const presupuestosEstadoQuery = `
      SELECT 
        estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM presupuesto_servicios ${whereClause.replace('fecha_solicitud', 'fecha_presupuesto')})), 2) as porcentaje
      FROM presupuesto_servicios
      ${whereClause.replace('fecha_solicitud', 'fecha_presupuesto')}
      GROUP BY estado
      ORDER BY cantidad DESC
    `

    const presupuestosEstadoResult = await pool.query(presupuestosEstadoQuery, queryParams)

    // Distribución por estado - Órdenes
    const ordenesEstadoQuery = `
      SELECT 
        estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orden_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')})), 2) as porcentaje
      FROM orden_servicio
      ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}
      GROUP BY estado
      ORDER BY cantidad DESC
    `

    const ordenesEstadoResult = await pool.query(ordenesEstadoQuery, queryParams)

    // Distribución por estado - Reclamos
    const reclamosEstadoQuery = `
      SELECT 
        estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reclamos ${whereClause.replace('fecha_solicitud', 'fecha_reclamo')})), 2) as porcentaje
      FROM reclamos
      ${whereClause.replace('fecha_solicitud', 'fecha_reclamo')}
      GROUP BY estado
      ORDER BY cantidad DESC
    `

    const reclamosEstadoResult = await pool.query(reclamosEstadoQuery, queryParams)

    // Top técnicos
    const topTecnicosQuery = `
      SELECT 
        u.usuario_id as tecnico_id,
        u.nombre as tecnico_nombre,
        COUNT(*) as cantidad_registros,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM (
            SELECT tecnico_id FROM diagnostico ${whereClause.replace('fecha_solicitud', 'fecha_diagnostico')}
            UNION ALL
            SELECT tecnico_id FROM orden_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}
          ) AS all_tecnicos
        )), 2) as porcentaje
      FROM (
        SELECT tecnico_id FROM diagnostico ${whereClause.replace('fecha_solicitud', 'fecha_diagnostico')}
        UNION ALL
        SELECT tecnico_id FROM orden_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}
      ) AS combined_tecnicos
      LEFT JOIN usuarios u ON combined_tecnicos.tecnico_id = u.usuario_id
      GROUP BY u.usuario_id, u.nombre
      ORDER BY cantidad_registros DESC
      LIMIT 10
    `

    const topTecnicosResult = await pool.query(topTecnicosQuery, queryParams)

    // Top clientes
    const topClientesQuery = `
      SELECT 
        c.cliente_id,
        c.nombre as cliente_nombre,
        COUNT(*) as cantidad_registros,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM (
            SELECT cliente_id FROM solicitud_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}
            UNION ALL
            SELECT cliente_id FROM reclamos ${whereClause.replace('fecha_solicitud', 'fecha_reclamo')}
          ) AS all_clientes
        )), 2) as porcentaje
      FROM (
        SELECT cliente_id FROM solicitud_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}
        UNION ALL
        SELECT cliente_id FROM reclamos ${whereClause.replace('fecha_solicitud', 'fecha_reclamo')}
      ) AS combined_clientes
      LEFT JOIN clientes c ON combined_clientes.cliente_id = c.cliente_id
      GROUP BY c.cliente_id, c.nombre
      ORDER BY cantidad_registros DESC
      LIMIT 10
    `

    const topClientesResult = await pool.query(topClientesQuery, queryParams)

    // Distribución por sucursal
    const sucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre as sucursal_nombre,
        COUNT(*) as cantidad_registros,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM (
            SELECT sucursal_id FROM solicitud_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}
            UNION ALL
            SELECT sucursal_id FROM recepcion_equipo ${whereClause.replace('fecha_solicitud', 'fecha_recepcion')}
            UNION ALL
            SELECT sucursal_id FROM presupuesto_servicios ${whereClause.replace('fecha_solicitud', 'fecha_presupuesto')}
          ) AS all_sucursales
        )), 2) as porcentaje
      FROM (
        SELECT sucursal_id FROM solicitud_servicio ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}
        UNION ALL
        SELECT sucursal_id FROM recepcion_equipo ${whereClause.replace('fecha_solicitud', 'fecha_recepcion')}
        UNION ALL
        SELECT sucursal_id FROM presupuesto_servicios ${whereClause.replace('fecha_solicitud', 'fecha_presupuesto')}
      ) AS combined_sucursales
      LEFT JOIN sucursales s ON combined_sucursales.sucursal_id = s.sucursal_id
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY cantidad_registros DESC
    `

    const sucursalResult = await pool.query(sucursalQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(fecha_solicitud, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM fecha_solicitud) as año,
        COUNT(*) as cantidad_registros,
        CASE 
          WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_solicitud, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_solicitud, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM solicitud_servicio
      ${whereClause.replace('fecha_solicitud', 'fecha_solicitud')}
      GROUP BY TO_CHAR(fecha_solicitud, 'YYYY-MM'), EXTRACT(YEAR FROM fecha_solicitud)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasResult = await pool.query(tendenciasQuery, queryParams)

    const informe = {
      resumen_general: {
        total_solicitudes: parseInt(resumen.total_solicitudes) || 0,
        total_recepciones: parseInt(resumen.total_recepciones) || 0,
        total_diagnosticos: parseInt(resumen.total_diagnosticos) || 0,
        total_presupuestos: parseInt(resumen.total_presupuestos) || 0,
        total_ordenes: parseInt(resumen.total_ordenes) || 0,
        total_retiros: parseInt(resumen.total_retiros) || 0,
        total_reclamos: parseInt(resumen.total_reclamos) || 0,
        valor_total_presupuestos: parseFloat(resumen.valor_total_presupuestos) || 0,
        valor_total_ordenes: parseFloat(resumen.valor_total_ordenes) || 0,
        valor_total_general: parseFloat(resumen.valor_total_general) || 0
      },
      distribucion_por_estado: {
        solicitudes: solicitudesEstadoResult.rows,
        recepciones: recepcionesEstadoResult.rows,
        diagnosticos: diagnosticosEstadoResult.rows,
        presupuestos: presupuestosEstadoResult.rows,
        ordenes: ordenesEstadoResult.rows,
        reclamos: reclamosEstadoResult.rows
      },
      top_tecnicos: topTecnicosResult.rows,
      top_clientes: topClientesResult.rows,
      distribucion_por_sucursal: sucursalResult.rows,
      tendencias_mensuales: tendenciasResult.rows
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando dashboard:', error)
    return NextResponse.json({
      success: false,
      message: 'Error generando dashboard de servicios técnicos'
    }, { status: 500 })
  }
}
