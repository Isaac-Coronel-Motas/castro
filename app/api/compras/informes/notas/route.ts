import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { InformeNotasCreditoDebito, FiltrosInformeNotas } from '@/lib/types/informes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filtros: FiltrosInformeNotas = {
      fecha_desde: searchParams.get('fecha_desde') || undefined,
      fecha_hasta: searchParams.get('fecha_hasta') || undefined,
      sucursal_id: searchParams.get('sucursal_id') ? parseInt(searchParams.get('sucursal_id')!) : undefined,
      almacen_id: searchParams.get('almacen_id') ? parseInt(searchParams.get('almacen_id')!) : undefined,
      tipo_operacion: searchParams.get('tipo_operacion') || undefined,
      estado: searchParams.get('estado') || undefined,
      proveedor_id: searchParams.get('proveedor_id') ? parseInt(searchParams.get('proveedor_id')!) : undefined,
      cliente_id: searchParams.get('cliente_id') ? parseInt(searchParams.get('cliente_id')!) : undefined,
      tipo_periodo: (searchParams.get('tipo_periodo') as any) || 'mes'
    }

    // Construir condiciones WHERE
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (filtros.fecha_desde) {
      whereConditions.push(`DATE(nc.fecha_registro) >= $${paramIndex}`)
      queryParams.push(filtros.fecha_desde)
      paramIndex++
    }

    if (filtros.fecha_hasta) {
      whereConditions.push(`DATE(nc.fecha_registro) <= $${paramIndex}`)
      queryParams.push(filtros.fecha_hasta)
      paramIndex++
    }

    if (filtros.sucursal_id) {
      whereConditions.push(`nc.sucursal_id = $${paramIndex}`)
      queryParams.push(filtros.sucursal_id)
      paramIndex++
    }

    if (filtros.almacen_id) {
      whereConditions.push(`nc.almacen_id = $${paramIndex}`)
      queryParams.push(filtros.almacen_id)
      paramIndex++
    }

    if (filtros.tipo_operacion) {
      whereConditions.push(`nc.tipo_operacion = $${paramIndex}`)
      queryParams.push(filtros.tipo_operacion)
      paramIndex++
    }

    if (filtros.estado) {
      whereConditions.push(`nc.estado = $${paramIndex}`)
      queryParams.push(filtros.estado)
      paramIndex++
    }

    if (filtros.proveedor_id) {
      whereConditions.push(`nc.proveedor_id = $${paramIndex}`)
      queryParams.push(filtros.proveedor_id)
      paramIndex++
    }

    if (filtros.cliente_id) {
      whereConditions.push(`nc.cliente_id = $${paramIndex}`)
      queryParams.push(filtros.cliente_id)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen combinado de notas de crédito y débito
    const resumenQuery = `
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(monto_nc), 0) as monto_total_credito,
        COALESCE(SUM(monto_nd), 0) as monto_total_debito,
        COALESCE(SUM(monto_nc) + SUM(monto_nd), 0) as monto_total_general,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM (
        SELECT monto_nc, 0 as monto_nd FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')}
        UNION ALL
        SELECT 0 as monto_nc, monto_nd FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')}
      ) AS combined_notes
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado (combinado)
    const porEstadoQuery = `
      SELECT 
        estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto_nc), 0) as monto_credito,
        COALESCE(SUM(monto_nd), 0) as monto_debito,
        COALESCE(SUM(monto_nc) + SUM(monto_nd), 0) as monto_total,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM (
            SELECT estado FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')}
            UNION ALL
            SELECT estado FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')}
          ) AS all_notes
        )), 2) as porcentaje
      FROM (
        SELECT estado, monto_nc, 0 as monto_nd FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')}
        UNION ALL
        SELECT estado, 0 as monto_nc, monto_nd FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')}
      ) AS combined_notes
      GROUP BY estado
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Distribución por tipo de operación
    const porTipoOperacionQuery = `
      SELECT 
        tipo_operacion,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto_nc), 0) as monto_credito,
        COALESCE(SUM(monto_nd), 0) as monto_debito,
        COALESCE(SUM(monto_nc) + SUM(monto_nd), 0) as monto_total,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM (
            SELECT tipo_operacion FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')}
            UNION ALL
            SELECT tipo_operacion FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')}
          ) AS all_notes
        )), 2) as porcentaje
      FROM (
        SELECT tipo_operacion, monto_nc, 0 as monto_nd FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')}
        UNION ALL
        SELECT tipo_operacion, 0 as monto_nc, monto_nd FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')}
      ) AS combined_notes
      GROUP BY tipo_operacion
      ORDER BY cantidad DESC
    `

    const porTipoOperacionResult = await pool.query(porTipoOperacionQuery, queryParams)

    // Distribución por proveedor (solo compras)
    const porProveedorQuery = `
      SELECT 
        p.proveedor_id,
        p.nombre_proveedor as proveedor_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(monto_nc), 0) as monto_credito,
        COALESCE(SUM(monto_nd), 0) as monto_debito,
        COALESCE(SUM(monto_nc) + SUM(monto_nd), 0) as monto_total,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM (
            SELECT proveedor_id FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')} ${whereClause ? 'AND' : 'WHERE'} nc.tipo_operacion = 'compra'
            UNION ALL
            SELECT proveedor_id FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')} ${whereClause ? 'AND' : 'WHERE'} nd.tipo_operacion = 'compra'
          ) AS all_notes
        )), 2) as porcentaje
      FROM (
        SELECT proveedor_id, monto_nc, 0 as monto_nd FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')} ${whereClause ? 'AND' : 'WHERE'} nc.tipo_operacion = 'compra'
        UNION ALL
        SELECT proveedor_id, 0 as monto_nc, monto_nd FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')} ${whereClause ? 'AND' : 'WHERE'} nd.tipo_operacion = 'compra'
      ) AS combined_notes
      LEFT JOIN proveedores p ON combined_notes.proveedor_id = p.proveedor_id
      GROUP BY p.proveedor_id, p.nombre_proveedor
      ORDER BY monto_total DESC
      LIMIT 20
    `

    const porProveedorResult = await pool.query(porProveedorQuery, queryParams)

    // Distribución por cliente (solo ventas)
    const porClienteQuery = `
      SELECT 
        c.cliente_id,
        c.nombre as cliente_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(monto_nc), 0) as monto_credito,
        COALESCE(SUM(monto_nd), 0) as monto_debito,
        COALESCE(SUM(monto_nc) + SUM(monto_nd), 0) as monto_total,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM (
            SELECT cliente_id FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')} ${whereClause ? 'AND' : 'WHERE'} nc.tipo_operacion = 'venta'
            UNION ALL
            SELECT cliente_id FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')} ${whereClause ? 'AND' : 'WHERE'} nd.tipo_operacion = 'venta'
          ) AS all_notes
        )), 2) as porcentaje
      FROM (
        SELECT cliente_id, monto_nc, 0 as monto_nd FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')} ${whereClause ? 'AND' : 'WHERE'} nc.tipo_operacion = 'venta'
        UNION ALL
        SELECT cliente_id, 0 as monto_nc, monto_nd FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')} ${whereClause ? 'AND' : 'WHERE'} nd.tipo_operacion = 'venta'
      ) AS combined_notes
      LEFT JOIN clientes c ON combined_notes.cliente_id = c.cliente_id
      GROUP BY c.cliente_id, c.nombre
      ORDER BY monto_total DESC
      LIMIT 20
    `

    const porClienteResult = await pool.query(porClienteQuery, queryParams)

    // Distribución por sucursal
    const porSucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre as sucursal_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(monto_nc), 0) as monto_credito,
        COALESCE(SUM(monto_nd), 0) as monto_debito,
        COALESCE(SUM(monto_nc) + SUM(monto_nd), 0) as monto_total,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM (
            SELECT sucursal_id FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')}
            UNION ALL
            SELECT sucursal_id FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')}
          ) AS all_notes
        )), 2) as porcentaje
      FROM (
        SELECT sucursal_id, monto_nc, 0 as monto_nd FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')}
        UNION ALL
        SELECT sucursal_id, 0 as monto_nc, monto_nd FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')}
      ) AS combined_notes
      LEFT JOIN sucursales s ON combined_notes.sucursal_id = s.sucursal_id
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY monto_total DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(fecha_registro, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM fecha_registro) as año,
        COUNT(*) as cantidad,
        COALESCE(SUM(monto_nc), 0) as monto_credito,
        COALESCE(SUM(monto_nd), 0) as monto_debito,
        COALESCE(SUM(monto_nc) + SUM(monto_nd), 0) as monto_total,
        CASE 
          WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_registro, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(fecha_registro, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM (
        SELECT fecha_registro, monto_nc, 0 as monto_nd FROM nota_credito_cabecera nc ${whereClause.replace('nc.', 'nc.')}
        UNION ALL
        SELECT fecha_registro, 0 as monto_nc, monto_nd FROM nota_debito_cabecera nd ${whereClause.replace('nc.', 'nd.')}
      ) AS combined_notes
      GROUP BY TO_CHAR(fecha_registro, 'YYYY-MM'), EXTRACT(YEAR FROM fecha_registro)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasResult = await pool.query(tendenciasQuery, queryParams)

    const informe: InformeNotasCreditoDebito = {
      resumen: {
        total_registros: parseInt(resumen.total_registros) || 0,
        monto_total_credito: parseFloat(resumen.monto_total_credito) || 0,
        monto_total_debito: parseFloat(resumen.monto_total_debito) || 0,
        monto_total_general: parseFloat(resumen.monto_total_general) || 0,
        tendencia_periodo_anterior: parseFloat(resumen.tendencia_periodo_anterior) || 0,
        porcentaje_cambio: parseFloat(resumen.porcentaje_cambio) || 0
      },
      por_estado: porEstadoResult.rows.map(row => ({
        estado: row.estado,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        monto_credito: parseFloat(row.monto_credito) || 0,
        monto_debito: parseFloat(row.monto_debito) || 0,
        monto_total: parseFloat(row.monto_total) || 0
      })),
      por_tipo_operacion: porTipoOperacionResult.rows.map(row => ({
        tipo_operacion: row.tipo_operacion,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        monto_credito: parseFloat(row.monto_credito) || 0,
        monto_debito: parseFloat(row.monto_debito) || 0,
        monto_total: parseFloat(row.monto_total) || 0
      })),
      por_proveedor: porProveedorResult.rows.map(row => ({
        proveedor_id: row.proveedor_id,
        proveedor_nombre: row.proveedor_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        monto_credito: parseFloat(row.monto_credito) || 0,
        monto_debito: parseFloat(row.monto_debito) || 0,
        monto_total: parseFloat(row.monto_total) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      por_cliente: porClienteResult.rows.map(row => ({
        cliente_id: row.cliente_id,
        cliente_nombre: row.cliente_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        monto_credito: parseFloat(row.monto_credito) || 0,
        monto_debito: parseFloat(row.monto_debito) || 0,
        monto_total: parseFloat(row.monto_total) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      por_sucursal: porSucursalResult.rows.map(row => ({
        sucursal_id: row.sucursal_id,
        sucursal_nombre: row.sucursal_nombre,
        cantidad_registros: parseInt(row.cantidad_registros) || 0,
        monto_credito: parseFloat(row.monto_credito) || 0,
        monto_debito: parseFloat(row.monto_debito) || 0,
        monto_total: parseFloat(row.monto_total) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      tendencias_mensuales: tendenciasResult.rows.map(row => ({
        mes: row.mes,
        año: parseInt(row.año),
        cantidad: parseInt(row.cantidad) || 0,
        monto_credito: parseFloat(row.monto_credito) || 0,
        monto_debito: parseFloat(row.monto_debito) || 0,
        monto_total: parseFloat(row.monto_total) || 0,
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
    console.error('Error generando informe de notas crédito/débito:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}
