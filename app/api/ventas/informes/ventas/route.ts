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
    const tipo_documento = searchParams.get('tipo_documento')
    const numero_factura = searchParams.get('numero_factura')
    const condicion_pago = searchParams.get('condicion_pago')
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
    if (sucursal_id) {
      whereConditions.push(`v.sucursal_id = $${queryParams.length + 1}`)
      queryParams.push(sucursal_id)
    }
    if (cliente_id) {
      whereConditions.push(`v.cliente_id = $${queryParams.length + 1}`)
      queryParams.push(cliente_id)
    }
    // usuario_id no existe en la tabla ventas - se omite
    if (estado) {
      whereConditions.push(`v.estado = $${queryParams.length + 1}`)
      queryParams.push(estado)
    }
    if (tipo_documento) {
      whereConditions.push(`v.tipo_documento = $${queryParams.length + 1}`)
      queryParams.push(tipo_documento)
    }
    if (numero_factura) {
      whereConditions.push(`v.numero_factura ILIKE $${queryParams.length + 1}`)
      queryParams.push(`%${numero_factura}%`)
    }
    if (condicion_pago) {
      whereConditions.push(`v.condicion_pago = $${queryParams.length + 1}`)
      queryParams.push(condicion_pago)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Query para resumen general
    const resumenQuery = `
      SELECT 
        COALESCE(SUM(v.monto_venta), 0) as total_ventas,
        COUNT(DISTINCT v.venta_id) as total_transacciones,
        COUNT(DISTINCT v.cliente_id) as total_clientes,
        COALESCE(AVG(v.monto_venta), 0) as promedio_venta,
        COUNT(DISTINCT CASE WHEN v.estado = 'pendiente' THEN v.venta_id END) as total_pendientes,
        COUNT(DISTINCT CASE WHEN v.estado = 'confirmada' THEN v.venta_id END) as total_confirmadas,
        COUNT(DISTINCT CASE WHEN v.estado = 'anulada' THEN v.venta_id END) as total_anuladas,
        COUNT(DISTINCT CASE WHEN v.estado = 'completada' THEN v.venta_id END) as total_completadas
      FROM ventas v
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
        COUNT(DISTINCT v.venta_id) as total_transacciones,
        COALESCE(SUM(v.monto_venta), 0) as total_ventas
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      ${whereClause}
      GROUP BY c.cliente_id, c.nombre, c.email
      ORDER BY total_ventas DESC
      LIMIT 5
    `

    // Query para distribución por sucursal
    const distribucionSucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre,
        COUNT(DISTINCT v.venta_id) as total_transacciones,
        COALESCE(SUM(v.monto_venta), 0) as total_ventas
      FROM ventas v
      LEFT JOIN sucursales s ON v.sucursal_id = s.sucursal_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY total_ventas DESC
    `

    // Query para distribución por tipo de documento
    const distribucionTipoDocumentoQuery = `
      SELECT 
        v.tipo_documento,
        COUNT(DISTINCT v.venta_id) as total_transacciones,
        COALESCE(SUM(v.monto_venta), 0) as total_ventas
      FROM ventas v
      ${whereClause}
      GROUP BY v.tipo_documento
      ORDER BY total_ventas DESC
    `

    // Query para distribución por condición de pago
    const distribucionCondicionPagoQuery = `
      SELECT 
        v.condicion_pago,
        COUNT(DISTINCT v.venta_id) as total_transacciones,
        COALESCE(SUM(v.monto_venta), 0) as total_ventas
      FROM ventas v
      ${whereClause}
      GROUP BY v.condicion_pago
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
    const [resumenResult, distribucionEstadoResult, topClientesResult, distribucionSucursalResult, distribucionTipoDocumentoResult, distribucionCondicionPagoResult, tendenciasResult] = await Promise.all([
      pool.query(resumenQuery, queryParams),
      pool.query(distribucionEstadoQuery, queryParams),
      pool.query(topClientesQuery, queryParams),
      pool.query(distribucionSucursalQuery, queryParams),
      pool.query(distribucionTipoDocumentoQuery, queryParams),
      pool.query(distribucionCondicionPagoQuery, queryParams),
      pool.query(tendenciasQuery, queryParams)
    ])

    const resumen = resumenResult.rows[0]
    const distribucion_por_estado = distribucionEstadoResult.rows
    const top_clientes = topClientesResult.rows
    const distribucion_por_sucursal = distribucionSucursalResult.rows
    const distribucion_por_tipo_documento = distribucionTipoDocumentoResult.rows
    const distribucion_por_condicion_pago = distribucionCondicionPagoResult.rows
    const tendencias_mensuales = tendenciasResult.rows

    // Calcular tendencias (simplificado - en producción se calcularía comparando con período anterior)
    const tendencia_ventas = Math.random() * 20 - 10 // Simulado
    const tendencia_transacciones = Math.random() * 20 - 10 // Simulado
    const tendencia_promedio = Math.random() * 20 - 10 // Simulado
    const tendencia_clientes = Math.random() * 20 - 10 // Simulado

    const informe = {
      resumen: {
        total_ventas: parseFloat(resumen.total_ventas) || 0,
        total_transacciones: parseInt(resumen.total_transacciones) || 0,
        total_clientes: parseInt(resumen.total_clientes) || 0,
        promedio_venta: parseFloat(resumen.promedio_venta) || 0,
        total_pendientes: parseInt(resumen.total_pendientes) || 0,
        total_confirmadas: parseInt(resumen.total_confirmadas) || 0,
        total_anuladas: parseInt(resumen.total_anuladas) || 0,
        total_completadas: parseInt(resumen.total_completadas) || 0,
        tendencia_ventas,
        tendencia_transacciones,
        tendencia_promedio,
        tendencia_clientes
      },
      distribucion_por_estado,
      top_clientes,
      distribucion_por_sucursal,
      distribucion_por_tipo_documento,
      distribucion_por_condicion_pago,
      tendencias_mensuales
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando informe de ventas:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
