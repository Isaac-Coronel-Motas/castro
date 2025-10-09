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
    const entregado_por = searchParams.get('entregado_por')
    const retirado_por = searchParams.get('retirado_por')
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (fecha_desde) {
      whereConditions.push(`DATE(se.fecha_salida) >= $${queryParams.length + 1}`)
      queryParams.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push(`DATE(se.fecha_salida) <= $${queryParams.length + 1}`)
      queryParams.push(fecha_hasta)
    }
    if (sucursal_id) {
      whereConditions.push(`se.sucursal_id = $${queryParams.length + 1}`)
      queryParams.push(sucursal_id)
    }
    if (cliente_id) {
      whereConditions.push(`ss.cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    if (entregado_por) {
      whereConditions.push(`se.entregado_por = $${queryParams.length + 1}`)
      queryParams.push(entregado_por)
    }
    if (retirado_por) {
      whereConditions.push(`se.retirado_por = $${queryParams.length + 1}`)
      queryParams.push(retirado_por)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT se.salida_id) as total_registros,
        0 as valor_total,
        ROUND(AVG(1), 2) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM salida_equipo se
      LEFT JOIN solicitud_servicio ss ON se.solicitud_id = ss.solicitud_id
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Top entregado por
    const porEntregadoPorQuery = `
      SELECT 
        se.entregado_por as tecnico_id,
        se.entregado_por as tecnico_nombre,
        COUNT(DISTINCT se.salida_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT se.salida_id) * 100.0 / (SELECT COUNT(DISTINCT se2.salida_id) FROM salida_equipo se2 LEFT JOIN solicitud_servicio ss2 ON se2.solicitud_id = ss2.solicitud_id ${whereClause.replace('se.', 'se2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM salida_equipo se
      LEFT JOIN solicitud_servicio ss ON se.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY se.entregado_por
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porEntregadoPorResult = await pool.query(porEntregadoPorQuery, queryParams)

    // Top retirado por
    const porRetiradoPorQuery = `
      SELECT 
        se.retirado_por as tecnico_id,
        se.retirado_por as tecnico_nombre,
        COUNT(DISTINCT se.salida_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT se.salida_id) * 100.0 / (SELECT COUNT(DISTINCT se2.salida_id) FROM salida_equipo se2 LEFT JOIN solicitud_servicio ss2 ON se2.solicitud_id = ss2.solicitud_id ${whereClause.replace('se.', 'se2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM salida_equipo se
      LEFT JOIN solicitud_servicio ss ON se.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY se.retirado_por
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porRetiradoPorResult = await pool.query(porRetiradoPorQuery, queryParams)

    // Top clientes
    const porClienteQuery = `
      SELECT 
        c.cliente_id,
        c.nombre as cliente_nombre,
        COUNT(DISTINCT se.salida_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT se.salida_id) * 100.0 / (SELECT COUNT(DISTINCT se2.salida_id) FROM salida_equipo se2 LEFT JOIN solicitud_servicio ss2 ON se2.solicitud_id = ss2.solicitud_id ${whereClause.replace('se.', 'se2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM salida_equipo se
      LEFT JOIN solicitud_servicio ss ON se.solicitud_id = ss.solicitud_id
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
        COUNT(DISTINCT se.salida_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT se.salida_id) * 100.0 / (SELECT COUNT(DISTINCT se2.salida_id) FROM salida_equipo se2 LEFT JOIN solicitud_servicio ss2 ON se2.solicitud_id = ss2.solicitud_id ${whereClause.replace('se.', 'se2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM salida_equipo se
      LEFT JOIN sucursales s ON se.sucursal_id = s.sucursal_id
      LEFT JOIN solicitud_servicio ss ON se.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY cantidad_registros DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(se.fecha_salida, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM se.fecha_salida) as año,
        COUNT(DISTINCT se.salida_id) as cantidad_registros,
        CASE 
          WHEN COUNT(DISTINCT se.salida_id) > LAG(COUNT(DISTINCT se.salida_id)) OVER (ORDER BY TO_CHAR(se.fecha_salida, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(DISTINCT se.salida_id) < LAG(COUNT(DISTINCT se.salida_id)) OVER (ORDER BY TO_CHAR(se.fecha_salida, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM salida_equipo se
      LEFT JOIN solicitud_servicio ss ON se.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY TO_CHAR(se.fecha_salida, 'YYYY-MM'), EXTRACT(YEAR FROM se.fecha_salida)
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
      por_entregado_por: porEntregadoPorResult.rows,
      por_retirado_por: porRetiradoPorResult.rows,
      por_cliente: porClienteResult.rows,
      por_sucursal: porSucursalResult.rows,
      tendencias_mensuales: tendenciasResult.rows
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando informe de retiro:', error)
    return NextResponse.json({
      success: false,
      message: 'Error generando informe de retiro'
    }, { status: 500 })
  }
}
