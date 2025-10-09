import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { DashboardCompras, FiltrosInformeBase } from '@/lib/types/informes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filtros: FiltrosInformeBase = {
      fecha_desde: searchParams.get('fecha_desde') || undefined,
      fecha_hasta: searchParams.get('fecha_hasta') || undefined,
      sucursal_id: searchParams.get('sucursal_id') ? parseInt(searchParams.get('sucursal_id')!) : undefined,
      tipo_periodo: (searchParams.get('tipo_periodo') as any) || 'mes'
    }

    // Construir condiciones WHERE
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (filtros.fecha_desde) {
      whereConditions.push(`DATE(fecha_pedido) >= $${paramIndex}`)
      queryParams.push(filtros.fecha_desde)
      paramIndex++
    }

    if (filtros.fecha_hasta) {
      whereConditions.push(`DATE(fecha_pedido) <= $${paramIndex}`)
      queryParams.push(filtros.fecha_hasta)
      paramIndex++
    }

    if (filtros.sucursal_id) {
      whereConditions.push(`sucursal_id = $${paramIndex}`)
      queryParams.push(filtros.sucursal_id)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen general
    const resumenQuery = `
      SELECT 
        (SELECT COUNT(*) FROM pedido_proveedor ${whereClause.replace('fecha_pedido', 'fecha_pedido')}) as total_pedidos,
        (SELECT COUNT(*) FROM presupuesto_proveedor ${whereClause.replace('fecha_pedido', 'fecha_presupuesto')}) as total_presupuestos,
        (SELECT COUNT(*) FROM ordenes_compra ${whereClause.replace('fecha_pedido', 'fecha_orden')}) as total_ordenes,
        (SELECT COUNT(*) FROM compra_cabecera ${whereClause.replace('fecha_pedido', 'fecha_compra')}) as total_compras,
        (SELECT COUNT(*) FROM ajustes_inventario ${whereClause.replace('fecha_pedido', 'fecha')}) as total_ajustes,
        (SELECT COUNT(*) FROM nota_credito_cabecera ${whereClause.replace('fecha_pedido', 'fecha_registro')}) + 
        (SELECT COUNT(*) FROM nota_debito_cabecera ${whereClause.replace('fecha_pedido', 'fecha_registro')}) as total_notas,
        (SELECT COUNT(*) FROM transferencia_stock ${whereClause.replace('fecha_pedido', 'fecha')}) as total_transferencias,
        (SELECT COALESCE(SUM(monto_compra), 0) FROM compra_cabecera ${whereClause.replace('fecha_pedido', 'fecha_compra')}) as valor_total_compras,
        (SELECT COALESCE(SUM(monto_oc), 0) FROM ordenes_compra ${whereClause.replace('fecha_pedido', 'fecha_orden')}) as valor_total_ordenes,
        (SELECT COALESCE(SUM(monto_presu_prov), 0) FROM presupuesto_proveedor ${whereClause.replace('fecha_pedido', 'fecha_presupuesto')}) as valor_total_presupuestos
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Top proveedores
    const topProveedoresQuery = `
      SELECT 
        p.proveedor_id,
        p.nombre_proveedor as proveedor_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(cc.monto_compra), 0) as valor_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM compra_cabecera ${whereClause.replace('fecha_pedido', 'fecha_compra')})), 2) as porcentaje
      FROM proveedores p
      LEFT JOIN compra_cabecera cc ON p.proveedor_id = cc.proveedor_id ${whereClause.replace('fecha_pedido', 'cc.fecha_compra')}
      GROUP BY p.proveedor_id, p.nombre_proveedor
      ORDER BY valor_total DESC
      LIMIT 10
    `

    const topProveedoresResult = await pool.query(topProveedoresQuery, queryParams)

    // Distribución por sucursal
    const distribucionSucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre as sucursal_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(cc.monto_compra), 0) as valor_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM compra_cabecera ${whereClause.replace('fecha_pedido', 'fecha_compra')})), 2) as porcentaje
      FROM sucursales s
      LEFT JOIN compra_cabecera cc ON s.sucursal_id = cc.sucursal_id ${whereClause.replace('fecha_pedido', 'cc.fecha_compra')}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY valor_total DESC
    `

    const distribucionSucursalResult = await pool.query(distribucionSucursalQuery, queryParams)

    // Tendencias mensuales - Compras
    const tendenciasComprasQuery = `
      SELECT 
        TO_CHAR(fecha_compra, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM fecha_compra) as año,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto_compra), 0) as valor_total,
        CASE 
          WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_compra, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_compra, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM compra_cabecera
      ${whereClause.replace('fecha_pedido', 'fecha_compra')}
      GROUP BY TO_CHAR(fecha_compra, 'YYYY-MM'), EXTRACT(YEAR FROM fecha_compra)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasComprasResult = await pool.query(tendenciasComprasQuery, queryParams)

    // Tendencias mensuales - Órdenes
    const tendenciasOrdenesQuery = `
      SELECT 
        TO_CHAR(fecha_orden, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM fecha_orden) as año,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto_oc), 0) as valor_total,
        CASE 
          WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_orden, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_orden, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM ordenes_compra
      ${whereClause.replace('fecha_pedido', 'fecha_orden')}
      GROUP BY TO_CHAR(fecha_orden, 'YYYY-MM'), EXTRACT(YEAR FROM fecha_orden)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasOrdenesResult = await pool.query(tendenciasOrdenesQuery, queryParams)

    // Tendencias mensuales - Presupuestos
    const tendenciasPresupuestosQuery = `
      SELECT 
        TO_CHAR(fecha_presupuesto, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM fecha_presupuesto) as año,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto_presu_prov), 0) as valor_total,
        CASE 
          WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_presupuesto, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_presupuesto, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM presupuesto_proveedor
      ${whereClause.replace('fecha_pedido', 'fecha_presupuesto')}
      GROUP BY TO_CHAR(fecha_presupuesto, 'YYYY-MM'), EXTRACT(YEAR FROM fecha_presupuesto)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasPresupuestosResult = await pool.query(tendenciasPresupuestosQuery, queryParams)

    const dashboard: DashboardCompras = {
      resumen_general: {
        total_pedidos: parseInt(resumen.total_pedidos) || 0,
        total_presupuestos: parseInt(resumen.total_presupuestos) || 0,
        total_ordenes: parseInt(resumen.total_ordenes) || 0,
        total_compras: parseInt(resumen.total_compras) || 0,
        total_ajustes: parseInt(resumen.total_ajustes) || 0,
        total_notas: parseInt(resumen.total_notas) || 0,
        total_transferencias: parseInt(resumen.total_transferencias) || 0,
        valor_total_compras: parseFloat(resumen.valor_total_compras) || 0,
        valor_total_ordenes: parseFloat(resumen.valor_total_ordenes) || 0,
        valor_total_presupuestos: parseFloat(resumen.valor_total_presupuestos) || 0
      },
      top_proveedores: topProveedoresResult.rows.map(row => ({
        proveedor_id: row.proveedor_id,
        proveedor_nombre: row.proveedor_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        valor_total: parseFloat(row.valor_total) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      distribucion_por_sucursal: distribucionSucursalResult.rows.map(row => ({
        sucursal_id: row.sucursal_id,
        sucursal_nombre: row.sucursal_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        valor_total: parseFloat(row.valor_total) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      tendencias_generales: {
        compras_mensuales: tendenciasComprasResult.rows.map(row => ({
          mes: row.mes,
          año: parseInt(row.año),
          cantidad: parseInt(row.cantidad) || 0,
          valor_total: parseFloat(row.valor_total) || 0,
          tendencia: row.tendencia as 'up' | 'down' | 'stable'
        })),
        ordenes_mensuales: tendenciasOrdenesResult.rows.map(row => ({
          mes: row.mes,
          año: parseInt(row.año),
          cantidad: parseInt(row.cantidad) || 0,
          valor_total: parseFloat(row.valor_total) || 0,
          tendencia: row.tendencia as 'up' | 'down' | 'stable'
        })),
        presupuestos_mensuales: tendenciasPresupuestosResult.rows.map(row => ({
          mes: row.mes,
          año: parseInt(row.año),
          cantidad: parseInt(row.cantidad) || 0,
          valor_total: parseFloat(row.valor_total) || 0,
          tendencia: row.tendencia as 'up' | 'down' | 'stable'
        }))
      },
      distribucion_por_estado: {
        pedidos: [],
        presupuestos: [],
        ordenes: [],
        compras: []
      },
      periodo: {
        fecha_desde: filtros.fecha_desde || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        fecha_hasta: filtros.fecha_hasta || new Date().toISOString().split('T')[0]
      }
    }

    return NextResponse.json({
      success: true,
      data: dashboard
    })

  } catch (error) {
    console.error('Error generando dashboard:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}
