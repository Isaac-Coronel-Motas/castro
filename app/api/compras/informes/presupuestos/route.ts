import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { InformePresupuestos, FiltrosInformePresupuestos } from '@/lib/types/informes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filtros: FiltrosInformePresupuestos = {
      fecha_desde: searchParams.get('fecha_desde') || undefined,
      fecha_hasta: searchParams.get('fecha_hasta') || undefined,
      sucursal_id: searchParams.get('sucursal_id') ? parseInt(searchParams.get('sucursal_id')!) : undefined,
      proveedor_id: searchParams.get('proveedor_id') ? parseInt(searchParams.get('proveedor_id')!) : undefined,
      estado: searchParams.get('estado') || undefined,
      valido_hasta: searchParams.get('valido_hasta') || undefined,
      descuento_min: searchParams.get('descuento_min') ? parseFloat(searchParams.get('descuento_min')!) : undefined,
      descuento_max: searchParams.get('descuento_max') ? parseFloat(searchParams.get('descuento_max')!) : undefined,
      tipo_periodo: (searchParams.get('tipo_periodo') as any) || 'mes'
    }

    // Construir condiciones WHERE
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (filtros.fecha_desde) {
      whereConditions.push(`DATE(pp.fecha_presupuesto) >= $${paramIndex}`)
      queryParams.push(filtros.fecha_desde)
      paramIndex++
    }

    if (filtros.fecha_hasta) {
      whereConditions.push(`DATE(pp.fecha_presupuesto) <= $${paramIndex}`)
      queryParams.push(filtros.fecha_hasta)
      paramIndex++
    }

    // Nota: presupuesto_proveedor no tiene sucursal_id ni proveedor_id directamente
    // Estos filtros se pueden aplicar si hay relaciones con otras tablas

    if (filtros.estado) {
      whereConditions.push(`pp.estado = $${paramIndex}`)
      queryParams.push(filtros.estado)
      paramIndex++
    }

    // Nota: presupuesto_proveedor no tiene valido_hasta ni descuento
    // Estos filtros se pueden aplicar si hay relaciones con otras tablas

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(pp.monto_presu_prov), 0) as valor_total,
        COALESCE(AVG(pp.monto_presu_prov), 0) as promedio_por_registro,
        0 as promedio_descuento,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM presupuesto_proveedor pp
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        pp.estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(pp.monto_presu_prov), 0) as valor_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM presupuesto_proveedor pp2 ${whereClause.replace('pp.', 'pp2.')})), 2) as porcentaje
      FROM presupuesto_proveedor pp
      ${whereClause}
      GROUP BY pp.estado
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Distribución por proveedor - Simplificada ya que no hay relación directa
    const porProveedorQuery = `
      SELECT 
        0 as proveedor_id,
        'Sin proveedor asociado' as proveedor_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(pp.monto_presu_prov), 0) as valor_total,
        0 as promedio_descuento,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM presupuesto_proveedor pp2 ${whereClause.replace('pp.', 'pp2.')})), 2) as porcentaje
      FROM presupuesto_proveedor pp
      ${whereClause}
      GROUP BY 1, 2
      ORDER BY valor_total DESC
      LIMIT 20
    `

    const porProveedorResult = await pool.query(porProveedorQuery, queryParams)

    // Distribución por sucursal - Simplificada ya que no hay relación directa
    const porSucursalQuery = `
      SELECT 
        0 as sucursal_id,
        'Sin sucursal asociada' as sucursal_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(pp.monto_presu_prov), 0) as valor_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM presupuesto_proveedor pp2 ${whereClause.replace('pp.', 'pp2.')})), 2) as porcentaje
      FROM presupuesto_proveedor pp
      ${whereClause}
      GROUP BY 1, 2
      ORDER BY valor_total DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Distribución por descuento - Simplificada ya que no existe columna descuento
    const porDescuentoQuery = `
      SELECT 
        'Sin información de descuento' as rango_descuento,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM presupuesto_proveedor pp2 ${whereClause.replace('pp.', 'pp2.')})), 2) as porcentaje
      FROM presupuesto_proveedor pp
      ${whereClause}
      GROUP BY 1
      ORDER BY cantidad DESC
    `

    const porDescuentoResult = await pool.query(porDescuentoQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(pp.fecha_presupuesto, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM pp.fecha_presupuesto) as año,
        COUNT(*) as cantidad,
        COALESCE(SUM(pp.monto_presu_prov), 0) as valor_total,
        0 as promedio_descuento,
        CASE 
          WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(pp.fecha_presupuesto, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(pp.fecha_presupuesto, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM presupuesto_proveedor pp
      ${whereClause}
      GROUP BY TO_CHAR(pp.fecha_presupuesto, 'YYYY-MM'), EXTRACT(YEAR FROM pp.fecha_presupuesto)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasResult = await pool.query(tendenciasQuery, queryParams)

    const informe: InformePresupuestos = {
      resumen: {
        total_registros: parseInt(resumen.total_registros) || 0,
        valor_total: parseFloat(resumen.valor_total) || 0,
        promedio_por_registro: parseFloat(resumen.promedio_por_registro) || 0,
        tendencia_periodo_anterior: parseFloat(resumen.tendencia_periodo_anterior) || 0,
        porcentaje_cambio: parseFloat(resumen.porcentaje_cambio) || 0
      },
      por_estado: porEstadoResult.rows.map(row => ({
        estado: row.estado,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        valor_total: parseFloat(row.valor_total) || 0
      })),
      por_proveedor: porProveedorResult.rows.map(row => ({
        proveedor_id: row.proveedor_id,
        proveedor_nombre: row.proveedor_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        valor_total: parseFloat(row.valor_total) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      por_sucursal: porSucursalResult.rows.map(row => ({
        sucursal_id: row.sucursal_id,
        sucursal_nombre: row.sucursal_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        valor_total: parseFloat(row.valor_total) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      por_descuento: porDescuentoResult.rows.map(row => ({
        rango_descuento: row.rango_descuento,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      tendencias_mensuales: tendenciasResult.rows.map(row => ({
        mes: row.mes,
        año: parseInt(row.año),
        cantidad: parseInt(row.cantidad) || 0,
        valor_total: parseFloat(row.valor_total) || 0,
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
    console.error('Error generando informe de presupuestos:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}
