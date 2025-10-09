import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { InformePedidos, FiltrosInformePedidos } from '@/lib/types/informes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filtros: FiltrosInformePedidos = {
      fecha_desde: searchParams.get('fecha_desde') || undefined,
      fecha_hasta: searchParams.get('fecha_hasta') || undefined,
      sucursal_id: searchParams.get('sucursal_id') ? parseInt(searchParams.get('sucursal_id')!) : undefined,
      proveedor_id: searchParams.get('proveedor_id') ? parseInt(searchParams.get('proveedor_id')!) : undefined,
      estado: searchParams.get('estado') || undefined,
      tipo_periodo: (searchParams.get('tipo_periodo') as any) || 'mes'
    }

    // Construir condiciones WHERE
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (filtros.fecha_desde) {
      whereConditions.push(`DATE(pc.fecha_pedido) >= $${paramIndex}`)
      queryParams.push(filtros.fecha_desde)
      paramIndex++
    }

    if (filtros.fecha_hasta) {
      whereConditions.push(`DATE(pc.fecha_pedido) <= $${paramIndex}`)
      queryParams.push(filtros.fecha_hasta)
      paramIndex++
    }

    if (filtros.sucursal_id) {
      whereConditions.push(`pc.sucursal_id = $${paramIndex}`)
      queryParams.push(filtros.sucursal_id)
      paramIndex++
    }

    if (filtros.proveedor_id) {
      whereConditions.push(`pp.proveedor_id = $${paramIndex}`)
      queryParams.push(filtros.proveedor_id)
      paramIndex++
    }

    if (filtros.estado) {
      whereConditions.push(`pc.estado = $${paramIndex}`)
      queryParams.push(filtros.estado)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT pc.pedido_compra_id) as total_registros,
        COALESCE(SUM(dpc.cantidad * dpc.precio_unitario), 0) as valor_total,
        COALESCE(AVG(subquery.monto_total), 0) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM pedido_compra pc
      LEFT JOIN pedido_proveedor pp ON pc.pedido_compra_id = pp.pedido_compra_id
      LEFT JOIN detalle_pedido_compra dpc ON pc.pedido_compra_id = dpc.pedido_compra_id
      LEFT JOIN (
        SELECT 
          pedido_compra_id,
          SUM(cantidad * precio_unitario) as monto_total
        FROM detalle_pedido_compra
        GROUP BY pedido_compra_id
      ) subquery ON pc.pedido_compra_id = subquery.pedido_compra_id
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        pc.estado,
        COUNT(DISTINCT pc.pedido_compra_id) as cantidad,
        COALESCE(SUM(dpc.cantidad * dpc.precio_unitario), 0) as valor_total,
        ROUND((COUNT(DISTINCT pc.pedido_compra_id) * 100.0 / (SELECT COUNT(DISTINCT pc2.pedido_compra_id) FROM pedido_compra pc2 LEFT JOIN pedido_proveedor pp2 ON pc2.pedido_compra_id = pp2.pedido_compra_id ${whereClause.replace('pc.', 'pc2.').replace('pp.', 'pp2.')})), 2) as porcentaje
      FROM pedido_compra pc
      LEFT JOIN pedido_proveedor pp ON pc.pedido_compra_id = pp.pedido_compra_id
      LEFT JOIN detalle_pedido_compra dpc ON pc.pedido_compra_id = dpc.pedido_compra_id
      ${whereClause}
      GROUP BY pc.estado
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Distribución por proveedor
    const porProveedorQuery = `
      SELECT 
        p.proveedor_id,
        p.nombre_proveedor as proveedor_nombre,
        COUNT(DISTINCT pc.pedido_compra_id) as cantidad_registros,
        COALESCE(SUM(dpc.cantidad * dpc.precio_unitario), 0) as valor_total,
        ROUND((COUNT(DISTINCT pc.pedido_compra_id) * 100.0 / (SELECT COUNT(DISTINCT pc2.pedido_compra_id) FROM pedido_compra pc2 LEFT JOIN pedido_proveedor pp2 ON pc2.pedido_compra_id = pp2.pedido_compra_id ${whereClause.replace('pc.', 'pc2.').replace('pp.', 'pp2.')})), 2) as porcentaje
      FROM pedido_compra pc
      LEFT JOIN pedido_proveedor pp ON pc.pedido_compra_id = pp.pedido_compra_id
      LEFT JOIN proveedores p ON pp.proveedor_id = p.proveedor_id
      LEFT JOIN detalle_pedido_compra dpc ON pc.pedido_compra_id = dpc.pedido_compra_id
      ${whereClause}
      GROUP BY p.proveedor_id, p.nombre_proveedor
      ORDER BY valor_total DESC
      LIMIT 20
    `

    const porProveedorResult = await pool.query(porProveedorQuery, queryParams)

    // Distribución por sucursal
    const porSucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre as sucursal_nombre,
        COUNT(DISTINCT pc.pedido_compra_id) as cantidad_registros,
        COALESCE(SUM(dpc.cantidad * dpc.precio_unitario), 0) as valor_total,
        ROUND((COUNT(DISTINCT pc.pedido_compra_id) * 100.0 / (SELECT COUNT(DISTINCT pc2.pedido_compra_id) FROM pedido_compra pc2 LEFT JOIN pedido_proveedor pp2 ON pc2.pedido_compra_id = pp2.pedido_compra_id ${whereClause.replace('pc.', 'pc2.').replace('pp.', 'pp2.')})), 2) as porcentaje
      FROM pedido_compra pc
      LEFT JOIN pedido_proveedor pp ON pc.pedido_compra_id = pp.pedido_compra_id
      LEFT JOIN sucursales s ON pc.sucursal_id = s.sucursal_id
      LEFT JOIN detalle_pedido_compra dpc ON pc.pedido_compra_id = dpc.pedido_compra_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY valor_total DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(pc.fecha_pedido, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM pc.fecha_pedido) as año,
        COUNT(DISTINCT pc.pedido_compra_id) as cantidad,
        COALESCE(SUM(dpc.cantidad * dpc.precio_unitario), 0) as valor_total,
        CASE 
          WHEN COUNT(DISTINCT pc.pedido_compra_id) > LAG(COUNT(DISTINCT pc.pedido_compra_id)) OVER (ORDER BY TO_CHAR(pc.fecha_pedido, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(DISTINCT pc.pedido_compra_id) < LAG(COUNT(DISTINCT pc.pedido_compra_id)) OVER (ORDER BY TO_CHAR(pc.fecha_pedido, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM pedido_compra pc
      LEFT JOIN pedido_proveedor pp ON pc.pedido_compra_id = pp.pedido_compra_id
      LEFT JOIN detalle_pedido_compra dpc ON pc.pedido_compra_id = dpc.pedido_compra_id
      ${whereClause}
      GROUP BY TO_CHAR(pc.fecha_pedido, 'YYYY-MM'), EXTRACT(YEAR FROM pc.fecha_pedido)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasResult = await pool.query(tendenciasQuery, queryParams)

    const informe: InformePedidos = {
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
    console.error('Error generando informe de pedidos:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}