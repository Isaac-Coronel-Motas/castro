import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { InformeRegistroCompras, FiltrosInformeRegistro } from '@/lib/types/informes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filtros: FiltrosInformeRegistro = {
      fecha_desde: searchParams.get('fecha_desde') || undefined,
      fecha_hasta: searchParams.get('fecha_hasta') || undefined,
      sucursal_id: searchParams.get('sucursal_id') ? parseInt(searchParams.get('sucursal_id')!) : undefined,
      proveedor_id: searchParams.get('proveedor_id') ? parseInt(searchParams.get('proveedor_id')!) : undefined,
      estado: searchParams.get('estado') || undefined,
      tipo_doc_id: searchParams.get('tipo_doc_id') ? parseInt(searchParams.get('tipo_doc_id')!) : undefined,
      nro_factura: searchParams.get('nro_factura') || undefined,
      condicion_pago: searchParams.get('condicion_pago') || undefined,
      tipo_periodo: (searchParams.get('tipo_periodo') as any) || 'mes'
    }

    // Construir condiciones WHERE
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (filtros.fecha_desde) {
      whereConditions.push(`DATE(cc.fecha_compra) >= $${paramIndex}`)
      queryParams.push(filtros.fecha_desde)
      paramIndex++
    }

    if (filtros.fecha_hasta) {
      whereConditions.push(`DATE(cc.fecha_compra) <= $${paramIndex}`)
      queryParams.push(filtros.fecha_hasta)
      paramIndex++
    }

    if (filtros.sucursal_id) {
      whereConditions.push(`cc.sucursal_id = $${paramIndex}`)
      queryParams.push(filtros.sucursal_id)
      paramIndex++
    }

    if (filtros.proveedor_id) {
      whereConditions.push(`cc.proveedor_id = $${paramIndex}`)
      queryParams.push(filtros.proveedor_id)
      paramIndex++
    }

    if (filtros.estado) {
      whereConditions.push(`cc.estado = $${paramIndex}`)
      queryParams.push(filtros.estado)
      paramIndex++
    }

    if (filtros.tipo_doc_id) {
      whereConditions.push(`cc.tipo_doc_id = $${paramIndex}`)
      queryParams.push(filtros.tipo_doc_id)
      paramIndex++
    }

    if (filtros.nro_factura) {
      whereConditions.push(`cc.nro_factura ILIKE $${paramIndex}`)
      queryParams.push(`%${filtros.nro_factura}%`)
      paramIndex++
    }

    if (filtros.condicion_pago) {
      whereConditions.push(`cc.condicion_pago = $${paramIndex}`)
      queryParams.push(filtros.condicion_pago)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Resumen
    const resumenQuery = `
      SELECT 
        COUNT(*) as total_registros,
        COALESCE(SUM(cc.monto_compra), 0) as valor_total,
        COALESCE(AVG(cc.monto_compra), 0) as promedio_por_registro,
        0 as tendencia_periodo_anterior,
        0 as porcentaje_cambio
      FROM compra_cabecera cc
      ${whereClause}
    `

    const resumenResult = await pool.query(resumenQuery, queryParams)
    const resumen = resumenResult.rows[0]

    // Distribución por estado
    const porEstadoQuery = `
      SELECT 
        cc.estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(cc.monto_compra), 0) as valor_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM compra_cabecera cc2 ${whereClause.replace('cc.', 'cc2.')})), 2) as porcentaje
      FROM compra_cabecera cc
      ${whereClause}
      GROUP BY cc.estado
      ORDER BY cantidad DESC
    `

    const porEstadoResult = await pool.query(porEstadoQuery, queryParams)

    // Distribución por proveedor
    const porProveedorQuery = `
      SELECT 
        p.proveedor_id,
        p.nombre_proveedor as proveedor_nombre,
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(cc.monto_compra), 0) as valor_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM compra_cabecera cc2 ${whereClause.replace('cc.', 'cc2.')})), 2) as porcentaje
      FROM compra_cabecera cc
      LEFT JOIN proveedores p ON cc.proveedor_id = p.proveedor_id
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
        COUNT(*) as cantidad_registros,
        COALESCE(SUM(cc.monto_compra), 0) as valor_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM compra_cabecera cc2 ${whereClause.replace('cc.', 'cc2.')})), 2) as porcentaje
      FROM compra_cabecera cc
      LEFT JOIN sucursales s ON cc.sucursal_id = s.sucursal_id
      ${whereClause}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY valor_total DESC
    `

    const porSucursalResult = await pool.query(porSucursalQuery, queryParams)

    // Distribución por tipo de documento
    const porTipoDocumentoQuery = `
      SELECT 
        td.tipo_doc_id,
        td.descripcion as tipo_doc_nombre,
        COUNT(*) as cantidad,
        COALESCE(SUM(cc.monto_compra), 0) as valor_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM compra_cabecera cc2 ${whereClause.replace('cc.', 'cc2.')})), 2) as porcentaje
      FROM compra_cabecera cc
      LEFT JOIN tipo_documento td ON cc.tipo_doc_id = td.tipo_doc_id
      ${whereClause}
      GROUP BY td.tipo_doc_id, td.descripcion
      ORDER BY cantidad DESC
    `

    const porTipoDocumentoResult = await pool.query(porTipoDocumentoQuery, queryParams)

    // Distribución por condición de pago
    const porCondicionPagoQuery = `
      SELECT 
        cc.condicion_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(cc.monto_compra), 0) as valor_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM compra_cabecera cc2 ${whereClause.replace('cc.', 'cc2.')})), 2) as porcentaje
      FROM compra_cabecera cc
      ${whereClause}
      GROUP BY cc.condicion_pago
      ORDER BY cantidad DESC
    `

    const porCondicionPagoResult = await pool.query(porCondicionPagoQuery, queryParams)

    // Tendencias mensuales
    const tendenciasQuery = `
      SELECT 
        TO_CHAR(cc.fecha_compra, 'YYYY-MM') as mes,
        EXTRACT(YEAR FROM cc.fecha_compra) as año,
        COUNT(*) as cantidad,
        COALESCE(SUM(cc.monto_compra), 0) as valor_total,
        CASE 
          WHEN COUNT(*) > LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(cc.fecha_compra, 'YYYY-MM')) THEN 'up'
          WHEN COUNT(*) < LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(cc.fecha_compra, 'YYYY-MM')) THEN 'down'
          ELSE 'stable'
        END as tendencia
      FROM compra_cabecera cc
      ${whereClause}
      GROUP BY TO_CHAR(cc.fecha_compra, 'YYYY-MM'), EXTRACT(YEAR FROM cc.fecha_compra)
      ORDER BY mes DESC
      LIMIT 12
    `

    const tendenciasResult = await pool.query(tendenciasQuery, queryParams)

    const informe: InformeRegistroCompras = {
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
      por_tipo_documento: porTipoDocumentoResult.rows.map(row => ({
        tipo_doc_id: row.tipo_doc_id,
        tipo_doc_nombre: row.tipo_doc_nombre,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        valor_total: parseFloat(row.valor_total) || 0
      })),
      por_condicion_pago: porCondicionPagoResult.rows.map(row => ({
        condicion_pago: row.condicion_pago,
        cantidad: parseInt(row.cantidad) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0,
        valor_total: parseFloat(row.valor_total) || 0
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
    console.error('Error generando informe de registro de compras:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}
