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
    const tipo_atencion = searchParams.get('tipo_atencion')
    const ciudad_id = searchParams.get('ciudad_id')
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (fecha_desde) {
      whereConditions.push(`DATE(ss.fecha_solicitud) >= $${queryParams.length + 1}`)
      queryParams.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push(`DATE(ss.fecha_solicitud) <= $${queryParams.length + 1}`)
      queryParams.push(fecha_hasta)
    }
    if (sucursal_id) {
      whereConditions.push(`ss.sucursal_id = $${queryParams.length + 1}`)
      queryParams.push(sucursal_id)
    }
    if (tecnico_id) {
      whereConditions.push(`ss.recepcionado_por = $${queryParams.length + 1}`)
      queryParams.push(tecnico_id)
    }
    if (cliente_id) {
      whereConditions.push(`ss.cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    if (estado) {
      whereConditions.push(`ss.estado_solicitud = $${queryParams.length + 1}`)
      queryParams.push(estado)
    }
    if (tipo_atencion) {
      whereConditions.push(`ss.tipo_atencion = $${queryParams.length + 1}`)
      queryParams.push(tipo_atencion)
    }
    if (ciudad_id) {
      whereConditions.push(`ss.ciudad_id = $${queryParams.length + 1}`)
      queryParams.push(ciudad_id)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(*) as total_registros,
        0 as valor_total,
        ROUND(AVG(1), 2) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM solicitud_servicio ss
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        estado_solicitud as estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM solicitud_servicio ss ${whereClause})), 2) as porcentaje
      FROM solicitud_servicio ss
      ${whereClause}
      GROUP BY estado_solicitud
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Distribución por tipo de atención
    const porTipoAtencionQuery = `
      SELECT 
        tipo_atencion as estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM solicitud_servicio ss ${whereClause})), 2) as porcentaje
      FROM solicitud_servicio ss
      ${whereClause}
      GROUP BY tipo_atencion
      ORDER BY cantidad DESC
    `

    const porTipoAtencionResult = await pool.query(porTipoAtencionQuery, queryParams)

    // Top técnicos
    const porTecnicoQuery = `
      SELECT 
        u.usuario_id as tecnico_id,
        u.nombre as tecnico_nombre,
        COUNT(*) as cantidad_registros,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM solicitud_servicio ss ${whereClause})), 2) as porcentaje
      FROM solicitud_servicio ss
      LEFT JOIN usuarios u ON ss.recepcionado_por = u.usuario_id
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
        COUNT(*) as cantidad_registros,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM solicitud_servicio ss ${whereClause})), 2) as porcentaje
      FROM solicitud_servicio ss
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
        COUNT(*) as cantidad_registros,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM solicitud_servicio ss ${whereClause})), 2) as porcentaje
      FROM solicitud_servicio ss
      LEFT JOIN sucursales s ON ss.sucursal_id = s.sucursal_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY cantidad_registros DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Distribución por ciudad
    const porCiudadQuery = `
      SELECT 
        ci.id as sucursal_id,
        ci.nombre as sucursal_nombre,
        COUNT(*) as cantidad_registros,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM solicitud_servicio ss ${whereClause})), 2) as porcentaje
      FROM solicitud_servicio ss
      LEFT JOIN ciudades ci ON ss.ciudad_id = ci.id
      ${whereClause}
      GROUP BY ci.id, ci.nombre
      ORDER BY cantidad_registros DESC
    `

    const porCiudadResult = await pool.query(porCiudadQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(ss.fecha_solicitud, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM ss.fecha_solicitud) as año,
        COUNT(*) as cantidad_registros,
        CASE 
          WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(ss.fecha_solicitud, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(ss.fecha_solicitud, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM solicitud_servicio ss
      ${whereClause}
      GROUP BY TO_CHAR(ss.fecha_solicitud, 'YYYY-MM'), EXTRACT(YEAR FROM ss.fecha_solicitud)
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
      por_tipo_atencion: porTipoAtencionResult.rows,
      por_tecnico: porTecnicoResult.rows,
      por_cliente: porClienteResult.rows,
      por_sucursal: porSucursalResult.rows,
      por_ciudad: porCiudadResult.rows,
      tendencias_mensuales: tendenciasResult.rows
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando informe de solicitudes:', error)
    return NextResponse.json({
      success: false,
      message: 'Error generando informe de solicitudes'
    }, { status: 500 })
  }
}
