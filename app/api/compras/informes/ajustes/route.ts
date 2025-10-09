import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { InformeAjustesInventario, FiltrosInformeAjustes } from '@/lib/types/informes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filtros: FiltrosInformeAjustes = {
      fecha_desde: searchParams.get('fecha_desde') || undefined,
      fecha_hasta: searchParams.get('fecha_hasta') || undefined,
      sucursal_id: searchParams.get('sucursal_id') ? parseInt(searchParams.get('sucursal_id')!) : undefined,
      almacen_id: searchParams.get('almacen_id') ? parseInt(searchParams.get('almacen_id')!) : undefined,
      motivo_id: searchParams.get('motivo_id') ? parseInt(searchParams.get('motivo_id')!) : undefined,
      estado: searchParams.get('estado') || undefined,
      tipo_movimiento: searchParams.get('tipo_movimiento') || undefined,
      tipo_periodo: (searchParams.get('tipo_periodo') as any) || 'mes'
    }

    // Construir condiciones WHERE
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (filtros.fecha_desde) {
      whereConditions.push(`DATE(ai.fecha) >= $${paramIndex}`)
      queryParams.push(filtros.fecha_desde)
      paramIndex++
    }

    if (filtros.fecha_hasta) {
      whereConditions.push(`DATE(ai.fecha) <= $${paramIndex}`)
      queryParams.push(filtros.fecha_hasta)
      paramIndex++
    }

    if (filtros.sucursal_id) {
      whereConditions.push(`a.id_sucursal = $${paramIndex}`)
      queryParams.push(filtros.sucursal_id)
      paramIndex++
    }

    if (filtros.almacen_id) {
      whereConditions.push(`ai.almacen_id = $${paramIndex}`)
      queryParams.push(filtros.almacen_id)
      paramIndex++
    }

    if (filtros.motivo_id) {
      whereConditions.push(`ai.motivo_id = $${paramIndex}`)
      queryParams.push(filtros.motivo_id)
      paramIndex++
    }

    if (filtros.estado) {
      whereConditions.push(`ai.estado = $${paramIndex}`)
      queryParams.push(filtros.estado)
      paramIndex++
    }

    if (filtros.tipo_movimiento) {
      whereConditions.push(`CASE WHEN aid.cantidad_ajustada > 0 THEN 'entrada' WHEN aid.cantidad_ajustada < 0 THEN 'salida' ELSE 'ajuste' END = $${paramIndex}`)
      queryParams.push(filtros.tipo_movimiento)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT ai.ajuste_id) as total_registros,
        COUNT(aid.detalle_id) as total_detalles,
        COALESCE(SUM(ABS(aid.cantidad_ajustada)), 0) as cantidad_total_ajustada,
        COALESCE(SUM(CASE WHEN aid.cantidad_ajustada > 0 THEN aid.cantidad_ajustada ELSE 0 END), 0) as cantidad_entradas,
        COALESCE(SUM(CASE WHEN aid.cantidad_ajustada < 0 THEN ABS(aid.cantidad_ajustada) ELSE 0 END), 0) as cantidad_salidas,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM ajustes_inventario ai
      LEFT JOIN ajustes_inventario_detalle aid ON ai.ajuste_id = aid.ajuste_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        ai.estado,
        COUNT(DISTINCT ai.ajuste_id) as cantidad,
        COUNT(aid.detalle_id) as total_detalles,
        COALESCE(SUM(ABS(aid.cantidad_ajustada)), 0) as cantidad_total,
        ROUND((COUNT(DISTINCT ai.ajuste_id) * 100.0 / (SELECT COUNT(DISTINCT ai2.ajuste_id) FROM ajustes_inventario ai2 LEFT JOIN almacenes a2 ON ai2.almacen_id = a2.almacen_id ${whereClause.replace('ai.', 'ai2.').replace('aid.', 'aid2.').replace('a.', 'a2.')})), 2) as porcentaje
      FROM ajustes_inventario ai
      LEFT JOIN ajustes_inventario_detalle aid ON ai.ajuste_id = aid.ajuste_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      ${whereClause}
      GROUP BY ai.estado
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Distribución por almacén
    const porAlmacenQuery = `
      SELECT 
        a.almacen_id,
        a.nombre as almacen_nombre,
        s.nombre as sucursal_nombre,
        COUNT(DISTINCT ai.ajuste_id) as cantidad_registros,
        COUNT(aid.detalle_id) as total_detalles,
        COALESCE(SUM(ABS(aid.cantidad_ajustada)), 0) as cantidad_total,
        ROUND((COUNT(DISTINCT ai.ajuste_id) * 100.0 / (SELECT COUNT(DISTINCT ai2.ajuste_id) FROM ajustes_inventario ai2 LEFT JOIN almacenes a2 ON ai2.almacen_id = a2.almacen_id ${whereClause.replace('ai.', 'ai2.').replace('aid.', 'aid2.').replace('a.', 'a2.')})), 2) as porcentaje
      FROM ajustes_inventario ai
      LEFT JOIN ajustes_inventario_detalle aid ON ai.ajuste_id = aid.ajuste_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      LEFT JOIN sucursales s ON a.id_sucursal = s.sucursal_id
      ${whereClause}
      GROUP BY a.almacen_id, a.nombre, s.nombre
      ORDER BY cantidad_total DESC
    `

    const porAlmacenResult = await pool.query(porAlmacenQuery, queryParams)

    // Distribución por motivo
    const porMotivoQuery = `
      SELECT 
        m.motivo_id,
        m.descripcion as motivo_descripcion,
        COUNT(DISTINCT ai.ajuste_id) as cantidad,
        COUNT(aid.detalle_id) as total_detalles,
        COALESCE(SUM(ABS(aid.cantidad_ajustada)), 0) as cantidad_total,
        ROUND((COUNT(DISTINCT ai.ajuste_id) * 100.0 / (SELECT COUNT(DISTINCT ai2.ajuste_id) FROM ajustes_inventario ai2 LEFT JOIN almacenes a2 ON ai2.almacen_id = a2.almacen_id ${whereClause.replace('ai.', 'ai2.').replace('aid.', 'aid2.').replace('a.', 'a2.')})), 2) as porcentaje
      FROM ajustes_inventario ai
      LEFT JOIN ajustes_inventario_detalle aid ON ai.ajuste_id = aid.ajuste_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      LEFT JOIN motivo_ajuste m ON ai.motivo_id = m.motivo_id
      ${whereClause}
      GROUP BY m.motivo_id, m.descripcion
      ORDER BY cantidad DESC
    `

    const porMotivoResult = await pool.query(porMotivoQuery, queryParams)

    // Distribución por tipo de movimiento
    const porTipoMovimientoQuery = `
      SELECT 
        CASE 
          WHEN aid.cantidad_ajustada > 0 THEN 'entrada'
          WHEN aid.cantidad_ajustada < 0 THEN 'salida'
          ELSE 'ajuste'
        END as tipo_movimiento,
        COUNT(aid.detalle_id) as cantidad_detalles,
        COALESCE(SUM(ABS(aid.cantidad_ajustada)), 0) as cantidad_total,
        ROUND((COUNT(aid.detalle_id) * 100.0 / (SELECT COUNT(aid2.detalle_id) FROM ajustes_inventario ai2 LEFT JOIN ajustes_inventario_detalle aid2 ON ai2.ajuste_id = aid2.ajuste_id LEFT JOIN almacenes a2 ON ai2.almacen_id = a2.almacen_id ${whereClause.replace('ai.', 'ai2.').replace('aid.', 'aid2.').replace('a.', 'a2.')})), 2) as porcentaje
      FROM ajustes_inventario ai
      LEFT JOIN ajustes_inventario_detalle aid ON ai.ajuste_id = aid.ajuste_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      ${whereClause}
      GROUP BY CASE 
        WHEN aid.cantidad_ajustada > 0 THEN 'entrada'
        WHEN aid.cantidad_ajustada < 0 THEN 'salida'
        ELSE 'ajuste'
      END
      ORDER BY cantidad_detalles DESC
    `

    const porTipoMovimientoResult = await pool.query(porTipoMovimientoQuery, queryParams)

    // Top productos más ajustados
    const topProductosQuery = `
      SELECT 
        p.producto_id,
        p.descripcion_producto as producto_descripcion,
        COUNT(aid.detalle_id) as cantidad_ajustes,
        COALESCE(SUM(ABS(aid.cantidad_ajustada)), 0) as cantidad_total,
        COALESCE(SUM(CASE WHEN aid.cantidad_ajustada > 0 THEN aid.cantidad_ajustada ELSE 0 END), 0) as cantidad_entradas,
        COALESCE(SUM(CASE WHEN aid.cantidad_ajustada < 0 THEN ABS(aid.cantidad_ajustada) ELSE 0 END), 0) as cantidad_salidas
      FROM ajustes_inventario ai
      LEFT JOIN ajustes_inventario_detalle aid ON ai.ajuste_id = aid.ajuste_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      LEFT JOIN productos p ON aid.producto_id = p.producto_id
      ${whereClause}
      GROUP BY p.producto_id, p.descripcion_producto
      ORDER BY cantidad_total DESC
      LIMIT 20
    `

    const topProductosResult = await pool.query(topProductosQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(ai.fecha, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM ai.fecha) as año,
        COUNT(DISTINCT ai.ajuste_id) as cantidad_ajustes,
        COUNT(aid.detalle_id) as cantidad_detalles,
        COALESCE(SUM(ABS(aid.cantidad_ajustada)), 0) as cantidad_total,
        CASE 
          WHEN COUNT(DISTINCT ai.ajuste_id) > LAG(COUNT(DISTINCT ai.ajuste_id)) OVER (ORDER BY TO_CHAR(ai.fecha, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(DISTINCT ai.ajuste_id) < LAG(COUNT(DISTINCT ai.ajuste_id)) OVER (ORDER BY TO_CHAR(ai.fecha, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM ajustes_inventario ai
      LEFT JOIN ajustes_inventario_detalle aid ON ai.ajuste_id = aid.ajuste_id
      LEFT JOIN almacenes a ON ai.almacen_id = a.almacen_id
      ${whereClause}
      GROUP BY TO_CHAR(ai.fecha, 'YYYY-MM'), EXTRACT(YEAR FROM ai.fecha)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasResult = await pool.query(tendenciasQuery, queryParams)

    const informe: InformeAjustesInventario = {
      resumen: {
        total_registros: parseInt(resumen.total_registros) || 0,
        total_detalles: parseInt(resumen.total_detalles) || 0,
        cantidad_total_ajustada: parseFloat(resumen.cantidad_total_ajustada) || 0,
        cantidad_entradas: parseFloat(resumen.cantidad_entradas) || 0,
        cantidad_salidas: parseFloat(resumen.cantidad_salidas) || 0,
        tendencia_periodo_anterior: parseFloat(resumen.tendencia_periodo_anterior) || 0,
        porcentaje_cambio: parseFloat(resumen.porcentaje_cambio) || 0
      },
      por_estado: porEstadoResult.rows.map(row => ({
        estado: row.estado,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        cantidad_total: parseFloat(row.cantidad_total) || 0,
        total_detalles: parseInt(row.total_detalles) || 0
      })),
      por_almacen: porAlmacenResult.rows.map(row => ({
        almacen_id: row.almacen_id,
        almacen_nombre: row.almacen_nombre,
        sucursal_nombre: row.sucursal_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        cantidad_total: parseFloat(row.cantidad_total) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        total_detalles: parseInt(row.total_detalles) || 0
      })),
      por_motivo: porMotivoResult.rows.map(row => ({
        motivo_id: row.motivo_id,
        motivo_descripcion: row.motivo_descripcion,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        cantidad_total: parseFloat(row.cantidad_total) || 0,
        total_detalles: parseInt(row.total_detalles) || 0
      })),
      por_tipo_movimiento: porTipoMovimientoResult.rows.map(row => ({
        tipo_movimiento: row.tipo_movimiento,
        cantidad_detalles: parseInt(row.cantidad_detalles) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        cantidad_total: parseFloat(row.cantidad_total) || 0
      })),
      top_productos: topProductosResult.rows.map(row => ({
        producto_id: row.producto_id,
        producto_descripcion: row.producto_descripcion,
        cantidad_ajustes: parseInt(row.cantidad_ajustes) || 0,
        cantidad_total: parseFloat(row.cantidad_total) || 0,
        cantidad_entradas: parseFloat(row.cantidad_entradas) || 0,
        cantidad_salidas: parseFloat(row.cantidad_salidas) || 0
      })),
      tendencias_mensuales: tendenciasResult.rows.map(row => ({
        mes: row.mes,
        año: parseInt(row.año),
        cantidad_ajustes: parseInt(row.cantidad_ajustes) || 0,
        cantidad_detalles: parseInt(row.cantidad_detalles) || 0,
        cantidad_total: parseFloat(row.cantidad_total) || 0,
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
    console.error('Error generando informe de ajustes de inventario:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}
