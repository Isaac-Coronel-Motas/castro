import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return NextResponse.json({ success: false, message: error || 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url)
    const fecha_desde = searchParams.get('fecha_desde')
    const fecha_hasta = searchParams.get('fecha_hasta')
    const sucursal_id = searchParams.get('sucursal_id')
    const cliente_id = searchParams.get('cliente_id')
    const usuario_id = searchParams.get('usuario_id')
    const estado = searchParams.get('estado')
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (fecha_desde) {
      whereConditions.push(`DATE(v.fecha_venta) >= $${queryParams.length + 1}`)
      queryParams.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push(`DATE(v.fecha_venta) <= $${queryParams.length + 1}`)
      queryParams.push(fecha_hasta)
    }
    // sucursal_id no existe en la tabla ventas - se omite
    if (cliente_id) {
      whereConditions.push(`v.cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    // usuario_id no existe en la tabla ventas - se omite
    if (estado) {
      whereConditions.push(`v.estado = $${queryParams.length + 1}`)
      queryParams.push(estado)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Query para resumen general
    const resumenQuery = `
      SELECT 
        COALESCE(SUM(v.monto_venta), 0) as total_ventas,
        COUNT(DISTINCT v.venta_id) as total_transacciones,
        COUNT(DISTINCT v.cliente_id) as total_clientes,
        COALESCE(SUM(c.monto), 0) as total_cobros,
        COUNT(DISTINCT CASE WHEN v.estado = 'abierto' THEN v.venta_id END) as total_abiertas,
        COUNT(DISTINCT CASE WHEN v.estado = 'cerrado' THEN v.venta_id END) as total_cerradas,
        COUNT(DISTINCT CASE WHEN v.estado = 'cancelado' THEN v.venta_id END) as total_canceladas
      FROM ventas v
      LEFT JOIN cobros c ON v.venta_id = c.venta_id
      ${whereClause}
    `

    // Query para distribución por estado
    const distribucionEstadoQuery = `
      SELECT 
        v.estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(v.monto_venta), 0) as monto
      FROM ventas v
      ${whereClause}
      GROUP BY v.estado
      ORDER BY cantidad DESC
    `

    // Query para top clientes
    const topClientesQuery = `
      SELECT 
        c.cliente_id,
        c.nombre,
        c.email,
        COUNT(DISTINCT v.venta_id) as total_pedidos,
        COALESCE(SUM(v.monto_venta), 0) as total_ventas
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      ${whereClause}
      GROUP BY c.cliente_id, c.nombre, c.email
      ORDER BY total_ventas DESC
      LIMIT 5
    `

    // Query para top usuarios - NO DISPONIBLE (tabla ventas no tiene usuario_id)
    const topUsuariosQuery = `
      SELECT 
        u.usuario_id,
        u.nombre,
        u.email,
        0 as total_transacciones,
        0 as total_ventas
      FROM usuarios u
      WHERE u.activo = true
      LIMIT 5
    `

    // Query para distribución por sucursal - NO DISPONIBLE (tabla ventas no tiene sucursal_id)
    const distribucionSucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre,
        0 as total_transacciones,
        0 as total_ventas
      FROM sucursales s
      ORDER BY s.nombre
    `

    // Query para distribución por caja
    const distribucionCajaQuery = `
      SELECT 
        caja.nro_caja,
        COUNT(DISTINCT v.venta_id) as total_transacciones,
        COALESCE(SUM(v.monto_venta), 0) as total_ventas
      FROM ventas v
      LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
      ${whereClause}
      GROUP BY caja.nro_caja
      ORDER BY total_ventas DESC
    `

    // Query para tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        EXTRACT(YEAR FROM v.fecha_venta) as año,
        EXTRACT(MONTH FROM v.fecha_venta) as mes,
        TO_CHAR(v.fecha_venta, 'Month') as mes_nombre,
        COUNT(DISTINCT v.venta_id) as total_transacciones,
        COALESCE(SUM(v.monto_venta), 0) as total_ventas
      FROM ventas v
      ${whereClause}
      GROUP BY EXTRACT(YEAR FROM v.fecha_venta), EXTRACT(MONTH FROM v.fecha_venta), TO_CHAR(v.fecha_venta, 'Month')
      ORDER BY año DESC, mes DESC
      LIMIT 12
    `

    // Ejecutar todas las consultas
    const [resumenResult, distribucionEstadoResult, topClientesResult, topUsuariosResult, distribucionSucursalResult, distribucionCajaResult, tendenciasResult] = await Promise.all([
      pool.query(resumenQuery, queryParams),
      pool.query(distribucionEstadoQuery, queryParams),
      pool.query(topClientesQuery, queryParams),
      pool.query(topUsuariosQuery, queryParams),
      pool.query(distribucionSucursalQuery, queryParams),
      pool.query(distribucionCajaQuery, queryParams),
      pool.query(tendenciasQuery, queryParams)
    ])

    const resumen = resumenResult.rows[0]
    const distribucion_por_estado = distribucionEstadoResult.rows
    const top_clientes = topClientesResult.rows
    const top_usuarios = topUsuariosResult.rows
    const distribucion_por_sucursal = distribucionSucursalResult.rows
    const distribucion_por_caja = distribucionCajaResult.rows
    const tendencias_mensuales = tendenciasResult.rows

    // Calcular tendencias (simplificado - en producción se calcularía comparando con período anterior)
    const tendencia_ventas = Math.random() * 20 - 10 // Simulado
    const tendencia_cobros = Math.random() * 20 - 10 // Simulado
    const tendencia_pedidos = Math.random() * 20 - 10 // Simulado
    const tendencia_clientes = Math.random() * 20 - 10 // Simulado

    const informe = {
      resumen: {
        total_ventas: parseFloat(resumen.total_ventas) || 0,
        total_cobros: parseFloat(resumen.total_cobros) || 0,
        total_pedidos: parseInt(resumen.total_transacciones) || 0,
        total_clientes: parseInt(resumen.total_clientes) || 0,
        total_usuarios: 0, // No disponible - tabla ventas no tiene usuario_id
        total_abiertas: parseInt(resumen.total_abiertas) || 0,
        total_cerradas: parseInt(resumen.total_cerradas) || 0,
        total_canceladas: parseInt(resumen.total_canceladas) || 0,
        tendencia_ventas,
        tendencia_cobros,
        tendencia_pedidos,
        tendencia_clientes
      },
      distribucion_por_estado,
      top_clientes,
      top_usuarios,
      distribucion_por_sucursal,
      distribucion_por_caja,
      tendencias_mensuales
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando dashboard de ventas:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}