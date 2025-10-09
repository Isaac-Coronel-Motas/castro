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
    const estado_diagnostico = searchParams.get('estado_diagnostico')
    const tipo_diagnostico_id = searchParams.get('tipo_diagnostico_id')
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (fecha_desde) {
      whereConditions.push(`DATE(d.fecha_diagnostico) >= $${queryParams.length + 1}`)
      queryParams.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push(`DATE(d.fecha_diagnostico) <= $${queryParams.length + 1}`)
      queryParams.push(fecha_hasta)
    }
    if (sucursal_id) {
      whereConditions.push(`d.sucursal_id = $${queryParams.length + 1}`)
      queryParams.push(sucursal_id)
    }
    if (tecnico_id) {
      whereConditions.push(`d.tecnico_id = $${queryParams.length + 1}`)
      queryParams.push(tecnico_id)
    }
    if (cliente_id) {
      whereConditions.push(`ss.cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    if (estado) {
      whereConditions.push(`d.estado_diagnostico = $${queryParams.length + 1}`)
      queryParams.push(estado)
    }
    if (estado_diagnostico) {
      whereConditions.push(`d.estado_diagnostico = $${queryParams.length + 1}`)
      queryParams.push(estado_diagnostico)
    }
    if (tipo_diagnostico_id) {
      whereConditions.push(`d.tipo_diagnostico_id = $${queryParams.length + 1}`)
      queryParams.push(tipo_diagnostico_id)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT d.diagnostico_id) as total_registros,
        0 as valor_total,
        ROUND(AVG(1), 2) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM diagnostico d
      LEFT JOIN solicitud_servicio ss ON d.solicitud_id = ss.solicitud_id
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        d.estado_diagnostico as estado,
        COUNT(DISTINCT d.diagnostico_id) as cantidad,
        ROUND((COUNT(DISTINCT d.diagnostico_id) * 100.0 / (SELECT COUNT(DISTINCT d2.diagnostico_id) FROM diagnostico d2 LEFT JOIN solicitud_servicio ss2 ON d2.solicitud_id = ss2.solicitud_id ${whereClause.replace('d.', 'd2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM diagnostico d
      LEFT JOIN solicitud_servicio ss ON d.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY d.estado_diagnostico
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Top técnicos
    const porTecnicoQuery = `
      SELECT 
        t.tecnico_id,
        t.nombre as tecnico_nombre,
        COUNT(DISTINCT d.diagnostico_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT d.diagnostico_id) * 100.0 / (SELECT COUNT(DISTINCT d2.diagnostico_id) FROM diagnostico d2 LEFT JOIN solicitud_servicio ss2 ON d2.solicitud_id = ss2.solicitud_id ${whereClause.replace('d.', 'd2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM diagnostico d
      LEFT JOIN tecnicos t ON d.tecnico_id = t.tecnico_id
      LEFT JOIN solicitud_servicio ss ON d.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY t.tecnico_id, t.nombre
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porTecnicoResult = await pool.query(porTecnicoQuery, queryParams)

    // Top clientes
    const porClienteQuery = `
      SELECT 
        c.cliente_id,
        c.nombre as cliente_nombre,
        COUNT(DISTINCT d.diagnostico_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT d.diagnostico_id) * 100.0 / (SELECT COUNT(DISTINCT d2.diagnostico_id) FROM diagnostico d2 LEFT JOIN solicitud_servicio ss2 ON d2.solicitud_id = ss2.solicitud_id ${whereClause.replace('d.', 'd2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM diagnostico d
      LEFT JOIN solicitud_servicio ss ON d.solicitud_id = ss.solicitud_id
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
        COUNT(DISTINCT d.diagnostico_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT d.diagnostico_id) * 100.0 / (SELECT COUNT(DISTINCT d2.diagnostico_id) FROM diagnostico d2 LEFT JOIN solicitud_servicio ss2 ON d2.solicitud_id = ss2.solicitud_id ${whereClause.replace('d.', 'd2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM diagnostico d
      LEFT JOIN sucursales s ON d.sucursal_id = s.sucursal_id
      LEFT JOIN solicitud_servicio ss ON d.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY cantidad_registros DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Distribución por tipo de diagnóstico
    const porTipoDiagnosticoQuery = `
      SELECT 
        td.tipo_diagnostico_id as cliente_id,
        td.descripcion as cliente_nombre,
        COUNT(DISTINCT d.diagnostico_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT d.diagnostico_id) * 100.0 / (SELECT COUNT(DISTINCT d2.diagnostico_id) FROM diagnostico d2 LEFT JOIN solicitud_servicio ss2 ON d2.solicitud_id = ss2.solicitud_id ${whereClause.replace('d.', 'd2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM diagnostico d
      LEFT JOIN tipo_diagnostico td ON d.tipo_diagnostico_id = td.tipo_diagnostico_id
      LEFT JOIN solicitud_servicio ss ON d.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY td.tipo_diagnostico_id, td.descripcion
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porTipoDiagnosticoResult = await pool.query(porTipoDiagnosticoQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(d.fecha_diagnostico, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM d.fecha_diagnostico) as año,
        COUNT(DISTINCT d.diagnostico_id) as cantidad_registros,
        CASE 
          WHEN COUNT(DISTINCT d.diagnostico_id) > LAG(COUNT(DISTINCT d.diagnostico_id)) OVER (ORDER BY TO_CHAR(d.fecha_diagnostico, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(DISTINCT d.diagnostico_id) < LAG(COUNT(DISTINCT d.diagnostico_id)) OVER (ORDER BY TO_CHAR(d.fecha_diagnostico, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM diagnostico d
      LEFT JOIN solicitud_servicio ss ON d.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY TO_CHAR(d.fecha_diagnostico, 'YYYY-MM'), EXTRACT(YEAR FROM d.fecha_diagnostico)
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
      por_tipo_diagnostico: porTipoDiagnosticoResult.rows,
      tendencias_mensuales: tendenciasResult.rows
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando informe de diagnósticos:', error)
    return NextResponse.json({
      success: false,
      message: 'Error generando informe de diagnósticos'
    }, { status: 500 })
  }
}
