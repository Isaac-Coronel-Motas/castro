import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar permisos de ventas (cualquier permiso de ventas da acceso a informes)
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado para acceder a informes de ventas');
    }

    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtro
    const fecha_desde = searchParams.get('fecha_desde')
    const fecha_hasta = searchParams.get('fecha_hasta')
    const sucursal_id = searchParams.get('sucursal_id')
    const cliente_id = searchParams.get('cliente_id')
    const categoria_id = searchParams.get('categoria_id')
    const estado = searchParams.get('estado')
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes'

    // Construir filtros
    const filters: any = {}
    if (fecha_desde) filters.fecha_desde = fecha_desde
    if (fecha_hasta) filters.fecha_hasta = fecha_hasta
    if (sucursal_id) filters.sucursal_id = sucursal_id
    if (cliente_id) filters.cliente_id = cliente_id
    if (categoria_id) filters.categoria_id = categoria_id
    if (estado) filters.estado = estado

    // Fechas por defecto si no se especifican
    const fechaInicio = fecha_desde || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const fechaFin = fecha_hasta || new Date().toISOString().split('T')[0]

    // 1. Resumen General
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT v.venta_id) as total_ventas,
        COUNT(DISTINCT CASE WHEN v.estado = 'cerrado' THEN v.venta_id END) as total_ventas_cerradas,
        COUNT(DISTINCT CASE WHEN v.estado = 'abierto' THEN v.venta_id END) as total_ventas_abiertas,
        COUNT(DISTINCT CASE WHEN v.estado = 'cancelado' THEN v.venta_id END) as total_ventas_canceladas,
        COUNT(DISTINCT c.cobro_id) as total_cobros,
        COUNT(DISTINCT nc.nota_credito_id) as total_notas_credito,
        COUNT(DISTINCT nd.nota_debito_id) as total_notas_debito,
        COALESCE(SUM(CASE WHEN v.estado = 'cerrado' THEN v.monto_venta ELSE 0 END), 0) as valor_total_ventas,
        COALESCE(SUM(c.monto), 0) as valor_total_cobros,
        COALESCE(SUM(nc.monto_nc), 0) as valor_total_notas_credito,
        COALESCE(SUM(nd.monto_nd), 0) as valor_total_notas_debito
      FROM ventas v
      LEFT JOIN cobros c ON v.venta_id = c.venta_id
      LEFT JOIN nota_credito_cabecera nc ON v.venta_id = nc.referencia_id AND nc.tipo_operacion = 'venta'
      LEFT JOIN nota_debito_cabecera nd ON v.venta_id = nd.referencia_id AND nd.tipo_operacion = 'venta'
      LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
      WHERE v.fecha_venta BETWEEN $1 AND $2
      ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
      ${cliente_id ? `AND v.cliente_id = $${sucursal_id ? '4' : '3'}` : ''}
      ${estado ? `AND v.estado = $${sucursal_id ? (cliente_id ? '5' : '4') : (cliente_id ? '4' : '3')}` : ''}
    `

    const resumenParams = [fechaInicio, fechaFin]
    if (sucursal_id) resumenParams.push(sucursal_id)
    if (cliente_id) resumenParams.push(cliente_id)
    if (estado) resumenParams.push(estado)

    const resumenResult = await pool.query(resumenQuery, resumenParams)
    const resumen = resumenResult.rows[0]

    // 2. Distribución por Estado
    const estadoQuery = `
    SELECT 
        v.estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as porcentaje
    FROM ventas v
      LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
      WHERE v.fecha_venta BETWEEN $1 AND $2
      ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
      ${cliente_id ? `AND v.cliente_id = $${sucursal_id ? '4' : '3'}` : ''}
      GROUP BY v.estado
      ORDER BY cantidad DESC
    `

    const estadoParams = [fechaInicio, fechaFin]
    if (sucursal_id) estadoParams.push(sucursal_id)
    if (cliente_id) estadoParams.push(cliente_id)

    const estadoResult = await pool.query(estadoQuery, estadoParams)
    const por_estado = estadoResult.rows

    // 3. Top Clientes
    const clientesQuery = `
    SELECT 
      c.cliente_id,
      c.nombre as cliente_nombre,
        COUNT(v.venta_id) as total_ventas,
        COALESCE(SUM(CASE WHEN v.estado = 'cerrado' THEN v.monto_venta ELSE 0 END), 0) as monto_total,
        ROUND((COUNT(v.venta_id) * 100.0 / SUM(COUNT(v.venta_id)) OVER()), 2) as porcentaje
      FROM clientes c
      INNER JOIN ventas v ON c.cliente_id = v.cliente_id
      LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
      WHERE v.fecha_venta BETWEEN $1 AND $2
      ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
      ${categoria_id ? `AND EXISTS (
        SELECT 1 FROM ventas_detalle vd 
        INNER JOIN productos p ON vd.producto_id = p.producto_id 
        WHERE vd.venta_id = v.venta_id AND p.categoria_id = $${sucursal_id ? '4' : '3'}
      )` : ''}
    GROUP BY c.cliente_id, c.nombre
      ORDER BY monto_total DESC
    LIMIT 10
    `

    const clientesParams = [fechaInicio, fechaFin]
    if (sucursal_id) clientesParams.push(sucursal_id)
    if (categoria_id) clientesParams.push(categoria_id)

    const clientesResult = await pool.query(clientesQuery, clientesParams)
    const por_cliente = clientesResult.rows

    // 4. Distribución por Sucursal
    const sucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre as sucursal_nombre,
        COUNT(v.venta_id) as total_ventas,
        COALESCE(SUM(CASE WHEN v.estado = 'cerrado' THEN v.monto_venta ELSE 0 END), 0) as monto_total,
        ROUND((COUNT(v.venta_id) * 100.0 / SUM(COUNT(v.venta_id)) OVER()), 2) as porcentaje
      FROM sucursales s
      INNER JOIN cajas caja ON s.sucursal_id = caja.sucursal_id
      INNER JOIN ventas v ON caja.caja_id = v.caja_id
      WHERE v.fecha_venta BETWEEN $1 AND $2
      ${cliente_id ? 'AND v.cliente_id = $3' : ''}
      ${categoria_id ? `AND EXISTS (
        SELECT 1 FROM ventas_detalle vd 
        INNER JOIN productos p ON vd.producto_id = p.producto_id 
        WHERE vd.venta_id = v.venta_id AND p.categoria_id = $${cliente_id ? '4' : '3'}
      )` : ''}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY monto_total DESC
    `

    const sucursalParams = [fechaInicio, fechaFin]
    if (cliente_id) sucursalParams.push(cliente_id)
    if (categoria_id) sucursalParams.push(categoria_id)

    const sucursalResult = await pool.query(sucursalQuery, sucursalParams)
    const por_sucursal = sucursalResult.rows

    // 5. Top Productos
    const productosQuery = `
    SELECT 
      p.producto_id,
        p.nombre_producto,
        cat.nombre_categoria,
        SUM(vd.cantidad) as total_vendido,
        COALESCE(SUM(vd.cantidad * vd.precio_unitario), 0) as monto_total,
        ROUND((SUM(vd.cantidad) * 100.0 / SUM(SUM(vd.cantidad)) OVER()), 2) as porcentaje
      FROM productos p
      INNER JOIN categorias cat ON p.categoria_id = cat.categoria_id
      INNER JOIN ventas_detalle vd ON p.producto_id = vd.producto_id
      INNER JOIN ventas v ON vd.venta_id = v.venta_id
      LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
      WHERE v.fecha_venta BETWEEN $1 AND $2
      ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
      ${cliente_id ? `AND v.cliente_id = $${sucursal_id ? '4' : '3'}` : ''}
      ${categoria_id ? `AND p.categoria_id = $${sucursal_id ? (cliente_id ? '5' : '4') : (cliente_id ? '4' : '3')}` : ''}
      GROUP BY p.producto_id, p.nombre_producto, cat.nombre_categoria
      ORDER BY monto_total DESC
    LIMIT 10
    `

    const productosParams = [fechaInicio, fechaFin]
    if (sucursal_id) productosParams.push(sucursal_id)
    if (cliente_id) productosParams.push(cliente_id)
    if (categoria_id) productosParams.push(categoria_id)

    const productosResult = await pool.query(productosQuery, productosParams)
    const por_producto = productosResult.rows

    // 6. Tendencias por período
    let tendenciasQuery = ''
    let tendenciasParams = [fechaInicio, fechaFin]
    
    if (tipo_periodo === 'dia') {
      tendenciasQuery = `
        SELECT 
          TO_CHAR(v.fecha_venta, 'YYYY-MM-DD') as periodo,
          COUNT(v.venta_id) as cantidad,
          COALESCE(SUM(CASE WHEN v.estado = 'cerrado' THEN v.monto_venta ELSE 0 END), 0) as monto,
          'stable' as tendencia
        FROM ventas v
        LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
        WHERE v.fecha_venta BETWEEN $1 AND $2
        ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
        ${cliente_id ? `AND v.cliente_id = $${sucursal_id ? '4' : '3'}` : ''}
        GROUP BY TO_CHAR(v.fecha_venta, 'YYYY-MM-DD')
        ORDER BY periodo DESC
        LIMIT 30
      `
    } else if (tipo_periodo === 'semana') {
      tendenciasQuery = `
        SELECT 
          TO_CHAR(v.fecha_venta, 'YYYY-"W"WW') as periodo,
          COUNT(v.venta_id) as cantidad,
          COALESCE(SUM(CASE WHEN v.estado = 'cerrado' THEN v.monto_venta ELSE 0 END), 0) as monto,
          'stable' as tendencia
        FROM ventas v
        LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
        WHERE v.fecha_venta BETWEEN $1 AND $2
        ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
        ${cliente_id ? `AND v.cliente_id = $${sucursal_id ? '4' : '3'}` : ''}
        GROUP BY TO_CHAR(v.fecha_venta, 'YYYY-"W"WW')
        ORDER BY periodo DESC
        LIMIT 12
      `
    } else if (tipo_periodo === 'mes') {
      tendenciasQuery = `
        SELECT 
          TO_CHAR(v.fecha_venta, 'YYYY-MM') as periodo,
          COUNT(v.venta_id) as cantidad,
          COALESCE(SUM(CASE WHEN v.estado = 'cerrado' THEN v.monto_venta ELSE 0 END), 0) as monto,
          'stable' as tendencia
        FROM ventas v
        LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
        WHERE v.fecha_venta BETWEEN $1 AND $2
        ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
        ${cliente_id ? `AND v.cliente_id = $${sucursal_id ? '4' : '3'}` : ''}
        GROUP BY TO_CHAR(v.fecha_venta, 'YYYY-MM')
        ORDER BY periodo DESC
        LIMIT 12
      `
    } else if (tipo_periodo === 'trimestre') {
      tendenciasQuery = `
        SELECT 
          TO_CHAR(v.fecha_venta, 'YYYY-"Q"Q') as periodo,
          COUNT(v.venta_id) as cantidad,
          COALESCE(SUM(CASE WHEN v.estado = 'cerrado' THEN v.monto_venta ELSE 0 END), 0) as monto,
          'stable' as tendencia
        FROM ventas v
        LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
        WHERE v.fecha_venta BETWEEN $1 AND $2
        ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
        ${cliente_id ? `AND v.cliente_id = $${sucursal_id ? '4' : '3'}` : ''}
        GROUP BY TO_CHAR(v.fecha_venta, 'YYYY-"Q"Q')
        ORDER BY periodo DESC
        LIMIT 8
      `
    } else { // año
      tendenciasQuery = `
    SELECT 
          TO_CHAR(v.fecha_venta, 'YYYY') as periodo,
          COUNT(v.venta_id) as cantidad,
          COALESCE(SUM(CASE WHEN v.estado = 'cerrado' THEN v.monto_venta ELSE 0 END), 0) as monto,
          'stable' as tendencia
    FROM ventas v
        LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
        WHERE v.fecha_venta BETWEEN $1 AND $2
        ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
        ${cliente_id ? `AND v.cliente_id = $${sucursal_id ? '4' : '3'}` : ''}
        GROUP BY TO_CHAR(v.fecha_venta, 'YYYY')
        ORDER BY periodo DESC
        LIMIT 5
      `
    }

    if (sucursal_id) tendenciasParams.push(sucursal_id)
    if (cliente_id) tendenciasParams.push(cliente_id)

    const tendenciasResult = await pool.query(tendenciasQuery, tendenciasParams)
    const tendencias = {
      ventas_periodo: tendenciasResult.rows
    }

    // 7. Distribución por Categoría
    const categoriasQuery = `
    SELECT 
        cat.categoria_id,
        cat.nombre_categoria,
        COUNT(DISTINCT v.venta_id) as total_ventas,
        SUM(vd.cantidad) as total_productos,
        COALESCE(SUM(vd.cantidad * vd.precio_unitario), 0) as monto_total,
        ROUND((SUM(vd.cantidad * vd.precio_unitario) * 100.0 / SUM(SUM(vd.cantidad * vd.precio_unitario)) OVER()), 2) as porcentaje
      FROM categorias cat
      INNER JOIN productos p ON cat.categoria_id = p.categoria_id
      INNER JOIN ventas_detalle vd ON p.producto_id = vd.producto_id
      INNER JOIN ventas v ON vd.venta_id = v.venta_id
      LEFT JOIN cajas caja ON v.caja_id = caja.caja_id
      WHERE v.fecha_venta BETWEEN $1 AND $2
      ${sucursal_id ? 'AND caja.sucursal_id = $3' : ''}
      ${cliente_id ? `AND v.cliente_id = $${sucursal_id ? '4' : '3'}` : ''}
      GROUP BY cat.categoria_id, cat.nombre_categoria
      ORDER BY monto_total DESC
    `

    const categoriasParams = [fechaInicio, fechaFin]
    if (sucursal_id) categoriasParams.push(sucursal_id)
    if (cliente_id) categoriasParams.push(cliente_id)

    const categoriasResult = await pool.query(categoriasQuery, categoriasParams)
    const por_categoria = categoriasResult.rows

    // Construir respuesta
    const informe = {
      periodo: {
        fecha_desde: fechaInicio,
        fecha_hasta: fechaFin,
        tipo_periodo
      },
      resumen: {
        total_ventas: parseInt(resumen.total_ventas) || 0,
        total_ventas_cerradas: parseInt(resumen.total_ventas_cerradas) || 0,
        total_ventas_abiertas: parseInt(resumen.total_ventas_abiertas) || 0,
        total_ventas_canceladas: parseInt(resumen.total_ventas_canceladas) || 0,
        total_cobros: parseInt(resumen.total_cobros) || 0,
        total_notas_credito: parseInt(resumen.total_notas_credito) || 0,
        total_notas_debito: parseInt(resumen.total_notas_debito) || 0,
        valor_total_ventas: parseFloat(resumen.valor_total_ventas) || 0,
        valor_total_cobros: parseFloat(resumen.valor_total_cobros) || 0,
        valor_total_notas_credito: parseFloat(resumen.valor_total_notas_credito) || 0,
        valor_total_notas_debito: parseFloat(resumen.valor_total_notas_debito) || 0
      },
      por_estado,
      por_cliente,
      por_sucursal,
      por_producto,
      por_categoria,
      tendencias
    }

    return NextResponse.json({
      success: true,
      data: informe
    })

  } catch (error) {
    console.error('Error en API de informes de ventas:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}