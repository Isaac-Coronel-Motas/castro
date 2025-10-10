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
    const estado_recepcion = searchParams.get('estado_recepcion')
    const equipo_id = searchParams.get('equipo_id')
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (fecha_desde) {
      whereConditions.push(`DATE(re.fecha_recepcion) >= $${queryParams.length + 1}`)
      queryParams.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push(`DATE(re.fecha_recepcion) <= $${queryParams.length + 1}`)
      queryParams.push(fecha_hasta)
    }
    if (sucursal_id) {
      whereConditions.push(`re.sucursal_id = $${queryParams.length + 1}`)
      queryParams.push(sucursal_id)
    }
    if (tecnico_id) {
      whereConditions.push(`re.usuario_id = $${queryParams.length + 1}`)
      queryParams.push(tecnico_id)
    }
    if (cliente_id) {
      whereConditions.push(`ss.cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    if (estado) {
      whereConditions.push(`re.estado_recepcion = $${queryParams.length + 1}`)
      queryParams.push(estado)
    }
    if (estado_recepcion) {
      whereConditions.push(`re.estado_recepcion = $${queryParams.length + 1}`)
      queryParams.push(estado_recepcion)
    }
    if (equipo_id) {
      whereConditions.push(`red.equipo_id = $${queryParams.length + 1}`)
      queryParams.push(equipo_id)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT re.recepcion_id) as total_registros,
        0 as valor_total,
        ROUND(AVG(1), 2) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM recepcion_equipo re
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN recepcion_equipo_detalle red ON re.recepcion_id = red.recepcion_id
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        re.estado_recepcion as estado,
        COUNT(DISTINCT re.recepcion_id) as cantidad,
        ROUND((COUNT(DISTINCT re.recepcion_id) * 100.0 / (SELECT COUNT(DISTINCT re2.recepcion_id) FROM recepcion_equipo re2 LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id LEFT JOIN recepcion_equipo_detalle red2 ON re2.recepcion_id = red2.recepcion_id ${whereClause.replace('re.', 're2.').replace('ss.', 'ss2.').replace('red.', 'red2.')})), 2) as porcentaje
      FROM recepcion_equipo re
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN recepcion_equipo_detalle red ON re.recepcion_id = red.recepcion_id
      ${whereClause}
      GROUP BY re.estado_recepcion
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Top técnicos
    const porTecnicoQuery = `
      SELECT 
        u.usuario_id as tecnico_id,
        u.nombre as tecnico_nombre,
        COUNT(DISTINCT re.recepcion_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT re.recepcion_id) * 100.0 / (SELECT COUNT(DISTINCT re2.recepcion_id) FROM recepcion_equipo re2 LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id LEFT JOIN recepcion_equipo_detalle red2 ON re2.recepcion_id = red2.recepcion_id ${whereClause.replace('re.', 're2.').replace('ss.', 'ss2.').replace('red.', 'red2.')})), 2) as porcentaje
      FROM recepcion_equipo re
      LEFT JOIN usuarios u ON re.usuario_id = u.usuario_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN recepcion_equipo_detalle red ON re.recepcion_id = red.recepcion_id
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
        COUNT(DISTINCT re.recepcion_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT re.recepcion_id) * 100.0 / (SELECT COUNT(DISTINCT re2.recepcion_id) FROM recepcion_equipo re2 LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id LEFT JOIN recepcion_equipo_detalle red2 ON re2.recepcion_id = red2.recepcion_id ${whereClause.replace('re.', 're2.').replace('ss.', 'ss2.').replace('red.', 'red2.')})), 2) as porcentaje
      FROM recepcion_equipo re
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      LEFT JOIN recepcion_equipo_detalle red ON re.recepcion_id = red.recepcion_id
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
        COUNT(DISTINCT re.recepcion_id) as cantidad_registros,
        ROUND((COUNT(DISTINCT re.recepcion_id) * 100.0 / (SELECT COUNT(DISTINCT re2.recepcion_id) FROM recepcion_equipo re2 LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id LEFT JOIN recepcion_equipo_detalle red2 ON re2.recepcion_id = red2.recepcion_id ${whereClause.replace('re.', 're2.').replace('ss.', 'ss2.').replace('red.', 'red2.')})), 2) as porcentaje
      FROM recepcion_equipo re
      LEFT JOIN sucursales s ON re.sucursal_id = s.sucursal_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN recepcion_equipo_detalle red ON re.recepcion_id = red.recepcion_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY cantidad_registros DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Distribución por equipo
    const porEquipoQuery = `
      SELECT 
        e.equipo_id,
        te.nombre as equipo_nombre,
        COUNT(red.detalle_id) as cantidad_registros,
        ROUND((COUNT(red.detalle_id) * 100.0 / (SELECT COUNT(red2.detalle_id) FROM recepcion_equipo re2 LEFT JOIN solicitud_servicio ss2 ON re2.solicitud_id = ss2.solicitud_id LEFT JOIN recepcion_equipo_detalle red2 ON re2.recepcion_id = red2.recepcion_id ${whereClause.replace('re.', 're2.').replace('ss.', 'ss2.').replace('red.', 'red2.')})), 2) as porcentaje
      FROM recepcion_equipo re
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN recepcion_equipo_detalle red ON re.recepcion_id = red.recepcion_id
      LEFT JOIN equipos e ON red.equipo_id = e.equipo_id
      LEFT JOIN tipo_equipo te ON e.tipo_equipo_id = te.tipo_equipo_id
      ${whereClause}
      GROUP BY e.equipo_id, te.nombre
      ORDER BY cantidad_registros DESC
      LIMIT 20
    `

    const porEquipoResult = await pool.query(porEquipoQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(re.fecha_recepcion, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM re.fecha_recepcion) as año,
        COUNT(DISTINCT re.recepcion_id) as cantidad_registros,
        CASE 
          WHEN COUNT(DISTINCT re.recepcion_id) > LAG(COUNT(DISTINCT re.recepcion_id)) OVER (ORDER BY TO_CHAR(re.fecha_recepcion, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(DISTINCT re.recepcion_id) < LAG(COUNT(DISTINCT re.recepcion_id)) OVER (ORDER BY TO_CHAR(re.fecha_recepcion, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM recepcion_equipo re
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN recepcion_equipo_detalle red ON re.recepcion_id = red.recepcion_id
      ${whereClause}
      GROUP BY TO_CHAR(re.fecha_recepcion, 'YYYY-MM'), EXTRACT(YEAR FROM re.fecha_recepcion)
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
      por_equipo: porEquipoResult.rows,
      tendencias_mensuales: tendenciasResult.rows
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando informe de recepción:', error)
    return NextResponse.json({
      success: false,
      message: 'Error generando informe de recepción'
    }, { status: 500 })
  }
}
