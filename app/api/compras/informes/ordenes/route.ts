import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { InformeOrdenes, FiltrosInformeOrdenes } from '@/lib/types/informes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filtros: FiltrosInformeOrdenes = {
      fecha_desde: searchParams.get('fecha_desde') || undefined,
      fecha_hasta: searchParams.get('fecha_hasta') || undefined,
      sucursal_id: searchParams.get('sucursal_id') ? parseInt(searchParams.get('sucursal_id')!) : undefined,
      proveedor_id: searchParams.get('proveedor_id') ? parseInt(searchParams.get('proveedor_id')!) : undefined,
      estado: searchParams.get('estado') || undefined,
      tipo_documento: searchParams.get('tipo_documento') || undefined,
      condicion_pago: searchParams.get('condicion_pago') || undefined,
      tipo_periodo: (searchParams.get('tipo_periodo') as any) || 'mes'
    }

    // Construir condiciones WHERE
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (filtros.fecha_desde) {
      whereConditions.push(`DATE(oc.fecha_orden) >= $${paramIndex}`)
      queryParams.push(filtros.fecha_desde)
      paramIndex++
    }

    if (filtros.fecha_hasta) {
      whereConditions.push(`DATE(oc.fecha_orden) <= $${paramIndex}`)
      queryParams.push(filtros.fecha_hasta)
      paramIndex++
    }

    // Nota: ordenes_compra no tiene sucursal_id, tipo_documento ni condicion_pago
    // Estos filtros se pueden aplicar si hay relaciones con otras tablas

    if (filtros.proveedor_id) {
      whereConditions.push(`oc.proveedor_id = $${paramIndex}`)
      queryParams.push(filtros.proveedor_id)
      paramIndex++
    }

    if (filtros.estado) {
      whereConditions.push(`oc.estado = $${paramIndex}`)
      queryParams.push(filtros.estado)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(oc.monto_oc), 0) as monto_oc,
        COALESCE(AVG(oc.monto_oc), 0) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM ordenes_compra oc
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        oc.estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(oc.monto_oc), 0) as monto_oc,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ordenes_compra oc2 ${whereClause.replace('oc.', 'oc2.')})), 2) as porcentaje
      FROM ordenes_compra oc
      ${whereClause}
      GROUP BY oc.estado
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Distribución por proveedor
    const porProveedorQuery = `
      SELECT 
        p.proveedor_id,
        p.nombre_proveedor as proveedor_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(oc.monto_oc), 0) as monto_oc,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ordenes_compra oc2 ${whereClause.replace('oc.', 'oc2.')})), 2) as porcentaje
      FROM ordenes_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.proveedor_id
      ${whereClause}
      GROUP BY p.proveedor_id, p.nombre_proveedor
      ORDER BY monto_oc DESC
      LIMIT 20
    `

    const porProveedorResult = await pool.query(porProveedorQuery, queryParams)

    // Distribución por sucursal - Simplificada ya que no hay relación directa
    const porSucursalQuery = `
      SELECT 
        0 as sucursal_id,
        'Sin sucursal asociada' as sucursal_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(oc.monto_oc), 0) as monto_oc,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ordenes_compra oc2 ${whereClause.replace('oc.', 'oc2.')})), 2) as porcentaje
      FROM ordenes_compra oc
      ${whereClause}
      GROUP BY 1, 2
      ORDER BY monto_oc DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Distribución por condición de pago - Simplificada ya que no existe columna condicion_pago
    const porCondicionPagoQuery = `
      SELECT 
        'Sin información de condición de pago' as condicion_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(oc.monto_oc), 0) as monto_oc,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ordenes_compra oc2 ${whereClause.replace('oc.', 'oc2.')})), 2) as porcentaje
      FROM ordenes_compra oc
      ${whereClause}
      GROUP BY 1
      ORDER BY cantidad DESC
    `

    const porCondicionPagoResult = await pool.query(porCondicionPagoQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(oc.fecha_orden, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM oc.fecha_orden) as año,
        COUNT(*) as cantidad,
        COALESCE(SUM(oc.monto_oc), 0) as monto_oc,
        CASE 
          WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(oc.fecha_orden, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(oc.fecha_orden, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM ordenes_compra oc
      ${whereClause}
      GROUP BY TO_CHAR(oc.fecha_orden, 'YYYY-MM'), EXTRACT(YEAR FROM oc.fecha_orden)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasResult = await pool.query(tendenciasQuery, queryParams)

    const informe: InformeOrdenes = {
      resumen: {
        total_registros: parseInt(resumen.total_registros) || 0,
        monto_oc: parseFloat(resumen.monto_oc || 0) || 0,
        promedio_por_registro: parseFloat(resumen.promedio_por_registro || 0) || 0,
        tendencia_periodo_anterior: parseFloat(resumen.tendencia_periodo_anterior || 0) || 0,
        porcentaje_cambio: parseFloat(resumen.porcentaje_cambio || 0) || 0
      },
      por_estado: porEstadoResult.rows.map(row => ({
        estado: row.estado,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        monto_oc: parseFloat(row.monto_oc) || 0
      })),
      por_proveedor: porProveedorResult.rows.map(row => ({
        proveedor_id: row.proveedor_id,
        proveedor_nombre: row.proveedor_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        monto_oc: parseFloat(row.monto_oc) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      por_sucursal: porSucursalResult.rows.map(row => ({
        sucursal_id: row.sucursal_id,
        sucursal_nombre: row.sucursal_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        monto_oc: parseFloat(row.monto_oc) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      por_condicion_pago: porCondicionPagoResult.rows.map(row => ({
        condicion_pago: row.condicion_pago,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        monto_oc: parseFloat(row.monto_oc) || 0
      })),
      tendencias_mensuales: tendenciasResult.rows.map(row => ({
        mes: row.mes,
        año: parseInt(row.año),
        cantidad: parseInt(row.cantidad) || 0,
        monto_oc: parseFloat(row.monto_oc) || 0,
        tendencia: row.tendencia as 'up' | 'down' | 'stable'
      })),
      periodo: {
        fecha_desde: filtros.fecha_desde || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        fecha_hasta: filtros.fecha_hasta || new Date().toISOString().split('T')[0]
      }
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error generando informe de órdenes:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}
