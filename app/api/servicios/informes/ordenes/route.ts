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
    const estado_orden = searchParams.get('estado_orden')
    const forma_cobro = searchParams.get('forma_cobro')
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (fecha_desde) {
      whereConditions.push(`DATE(os.fecha_orden) >= $${queryParams.length + 1}`)
      queryParams.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push(`DATE(os.fecha_orden) <= $${queryParams.length + 1}`)
      queryParams.push(fecha_hasta)
    }
    if (sucursal_id) {
      whereConditions.push(`os.sucursal_id = $${queryParams.length + 1}`)
      queryParams.push(sucursal_id)
    }
    if (tecnico_id) {
      whereConditions.push(`os.tecnico_id = $${queryParams.length + 1}`)
      queryParams.push(tecnico_id)
    }
    if (cliente_id) {
      whereConditions.push(`ss.cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    if (estado) {
      whereConditions.push(`os.estado_ord_serv = $${queryParams.length + 1}`)
      queryParams.push(estado)
    }
    if (estado_orden) {
      whereConditions.push(`os.estado_ord_serv = $${queryParams.length + 1}`)
      queryParams.push(estado_orden)
    }
    if (forma_cobro) {
      whereConditions.push(`os.forma_cobro = $${queryParams.length + 1}`)
      queryParams.push(forma_cobro)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT os.orden_id) as total_registros,
        COALESCE(SUM(os.monto_total), 0) as valor_total,
        ROUND(AVG(os.monto_total), 2) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM orden_servicio os
      LEFT JOIN solicitud_servicio ss ON os.solicitud_id = ss.solicitud_id
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        os.estado_ord_serv as estado,
        COUNT(DISTINCT os.orden_id) as cantidad,
        ROUND((COUNT(DISTINCT os.orden_id) * 100.0 / (SELECT COUNT(DISTINCT os2.orden_id) FROM orden_servicio os2 LEFT JOIN solicitud_servicio ss2 ON os2.solicitud_id = ss2.solicitud_id ${whereClause.replace('os.', 'os2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM orden_servicio os
      LEFT JOIN solicitud_servicio ss ON os.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY os.estado_ord_serv
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Top técnicos
    const porTecnicoQuery = `
      SELECT 
        t.tecnico_id,
        t.nombre as tecnico_nombre,
        COUNT(DISTINCT os.orden_id) as cantidad_registros,
        COALESCE(SUM(os.monto_total), 0) as valor_total,
        ROUND((COUNT(DISTINCT os.orden_id) * 100.0 / (SELECT COUNT(DISTINCT os2.orden_id) FROM orden_servicio os2 LEFT JOIN solicitud_servicio ss2 ON os2.solicitud_id = ss2.solicitud_id ${whereClause.replace('os.', 'os2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM orden_servicio os
      LEFT JOIN tecnicos t ON os.tecnico_id = t.tecnico_id
      LEFT JOIN solicitud_servicio ss ON os.solicitud_id = ss.solicitud_id
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
        COUNT(DISTINCT os.orden_id) as cantidad_registros,
        COALESCE(SUM(os.monto_total), 0) as valor_total,
        ROUND((COUNT(DISTINCT os.orden_id) * 100.0 / (SELECT COUNT(DISTINCT os2.orden_id) FROM orden_servicio os2 LEFT JOIN solicitud_servicio ss2 ON os2.solicitud_id = ss2.solicitud_id ${whereClause.replace('os.', 'os2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM orden_servicio os
      LEFT JOIN solicitud_servicio ss ON os.solicitud_id = ss.solicitud_id
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
        COUNT(DISTINCT os.orden_id) as cantidad_registros,
        COALESCE(SUM(os.monto_total), 0) as valor_total,
        ROUND((COUNT(DISTINCT os.orden_id) * 100.0 / (SELECT COUNT(DISTINCT os2.orden_id) FROM orden_servicio os2 LEFT JOIN solicitud_servicio ss2 ON os2.solicitud_id = ss2.solicitud_id ${whereClause.replace('os.', 'os2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM orden_servicio os
      LEFT JOIN sucursales s ON os.sucursal_id = s.sucursal_id
      LEFT JOIN solicitud_servicio ss ON os.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY cantidad_registros DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Distribución por forma de cobro
    const porFormaCobroQuery = `
      SELECT 
        os.forma_cobro as cliente_id,
        os.forma_cobro as cliente_nombre,
        COUNT(DISTINCT os.orden_id) as cantidad_registros,
        COALESCE(SUM(os.monto_total), 0) as valor_total,
        ROUND((COUNT(DISTINCT os.orden_id) * 100.0 / (SELECT COUNT(DISTINCT os2.orden_id) FROM orden_servicio os2 LEFT JOIN solicitud_servicio ss2 ON os2.solicitud_id = ss2.solicitud_id ${whereClause.replace('os.', 'os2.').replace('ss.', 'ss2.')})), 2) as porcentaje
      FROM orden_servicio os
      LEFT JOIN solicitud_servicio ss ON os.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY os.forma_cobro
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porFormaCobroResult = await pool.query(porFormaCobroQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(os.fecha_orden, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM os.fecha_orden) as año,
        COUNT(DISTINCT os.orden_id) as cantidad_registros,
        COALESCE(SUM(os.monto_total), 0) as valor_total,
        CASE 
          WHEN COUNT(DISTINCT os.orden_id) > LAG(COUNT(DISTINCT os.orden_id)) OVER (ORDER BY TO_CHAR(os.fecha_orden, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(DISTINCT os.orden_id) < LAG(COUNT(DISTINCT os.orden_id)) OVER (ORDER BY TO_CHAR(os.fecha_orden, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM orden_servicio os
      LEFT JOIN solicitud_servicio ss ON os.solicitud_id = ss.solicitud_id
      ${whereClause}
      GROUP BY TO_CHAR(os.fecha_orden, 'YYYY-MM'), EXTRACT(YEAR FROM os.fecha_orden)
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
      por_forma_cobro: porFormaCobroResult.rows,
      tendencias_mensuales: tendenciasResult.rows
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando informe de órdenes:', error)
    return NextResponse.json({
      success: false,
      message: 'Error generando informe de órdenes'
    }, { status: 500 })
  }
}
