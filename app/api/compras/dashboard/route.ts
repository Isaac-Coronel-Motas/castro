import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { ComprasApiResponse, ComprasDashboard, DashboardCard } from '@/lib/types/compras';

// GET /api/compras/dashboard - Obtener estadísticas del dashboard
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_dashboard_compras')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const sucursal_id = searchParams.get('sucursal_id');

    // Construir filtros de fecha
    const fechaFilter = fecha_desde && fecha_hasta 
      ? `AND fecha BETWEEN '${fecha_desde}' AND '${fecha_hasta}'`
      : '';

    const sucursalFilter = sucursal_id 
      ? `AND sucursal_id = ${sucursal_id}`
      : '';

    // Consultas para estadísticas de pedidos
    const pedidosQuery = `
      SELECT 
        COUNT(*) as total_pedidos,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'procesado' THEN 1 END) as procesados,
        COALESCE(SUM(monto_total), 0) as valor_total,
        COALESCE(AVG(monto_total), 0) as valor_promedio
      FROM (
        SELECT 
          pc.estado,
          COALESCE(SUM(dpc.cantidad * dpc.precio_unitario), 0) as monto_total
        FROM pedido_compra pc
        LEFT JOIN detalle_pedido_compra dpc ON pc.pedido_compra_id = dpc.pedido_compra_id
        WHERE 1=1 ${fechaFilter.replace('fecha', 'pc.fecha_pedido')}
        GROUP BY pc.pedido_compra_id, pc.estado
      ) pedidos_stats
    `;

    // Consultas para estadísticas de presupuestos
    const presupuestosQuery = `
      SELECT 
        COUNT(*) as total_presupuestos,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'aprobado' THEN 1 END) as aprobados,
        COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) as rechazados,
        COALESCE(SUM(monto_presu_prov), 0) as valor_total,
        COALESCE(AVG(monto_presu_prov), 0) as valor_promedio
      FROM presupuesto_proveedor pp
      WHERE 1=1 ${fechaFilter.replace('fecha', 'pp.fecha_presupuesto')}
    `;

    // Consultas para estadísticas de órdenes
    const ordenesQuery = `
      SELECT 
        COUNT(*) as total_ordenes,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as aprobadas,
        COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as rechazadas,
        COALESCE(SUM(monto_oc), 0) as valor_total,
        COALESCE(AVG(monto_oc), 0) as valor_promedio
      FROM ordenes_compra oc
      WHERE 1=1 ${fechaFilter.replace('fecha', 'oc.fecha_orden')}
    `;

    // Consultas para estadísticas de compras
    const comprasQuery = `
      SELECT 
        COUNT(*) as total_compras,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as en_progreso,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
        COALESCE(SUM(monto_compra), 0) as valor_total,
        COALESCE(AVG(monto_compra), 0) as valor_promedio
      FROM compra_cabecera cc
      WHERE 1=1 ${fechaFilter.replace('fecha', 'cc.fecha_compra')} ${sucursalFilter}
    `;

    // Consultas para resumen general
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT p.proveedor_id) as proveedores_activos,
        COUNT(CASE WHEN oc.fecha_orden < CURRENT_DATE - INTERVAL '7 days' AND oc.estado = 'pendiente' THEN 1 END) as ordenes_vencidas,
        COALESCE(SUM(cc.monto_compra), 0) as total_valor_compras,
        COUNT(cc.compra_id) as total_items_compras
      FROM proveedores p
      LEFT JOIN ordenes_compra oc ON p.proveedor_id = oc.proveedor_id
      LEFT JOIN compra_cabecera cc ON p.proveedor_id = cc.proveedor_id
      WHERE 1=1 ${fechaFilter.replace('fecha', 'COALESCE(oc.fecha_orden, cc.fecha_compra)')}
    `;

    // Ejecutar consultas en paralelo
    const [pedidosResult, presupuestosResult, ordenesResult, comprasResult, resumenResult] = await Promise.all([
      pool.query(pedidosQuery),
      pool.query(presupuestosQuery),
      pool.query(ordenesQuery),
      pool.query(comprasQuery),
      pool.query(resumenQuery)
    ]);

    const pedidos = pedidosResult.rows[0];
    const presupuestos = presupuestosResult.rows[0];
    const ordenes = ordenesResult.rows[0];
    const compras = comprasResult.rows[0];
    const resumen = resumenResult.rows[0];

    // Calcular tendencias (simuladas para el ejemplo)
    const calcularTendencia = (actual: number, anterior: number = actual * 0.9) => {
      const cambio = ((actual - anterior) / anterior) * 100;
      return Math.round(cambio);
    };

    // Crear cards del dashboard
    const pedidosCard: DashboardCard = {
      title: 'Total Pedidos',
      value: parseInt(pedidos.total_pedidos),
      trend: calcularTendencia(parseInt(pedidos.total_pedidos)),
      trend_direction: parseInt(pedidos.total_pedidos) > 0 ? 'up' : 'down',
      icon: 'shopping-cart',
      color: 'blue'
    };

    const presupuestosCard: DashboardCard = {
      title: 'Presupuestos',
      value: parseInt(presupuestos.total_presupuestos),
      trend: calcularTendencia(parseInt(presupuestos.total_presupuestos)),
      trend_direction: parseInt(presupuestos.total_presupuestos) > 0 ? 'up' : 'down',
      icon: 'file-text',
      color: 'green'
    };

    const ordenesCard: DashboardCard = {
      title: 'Órdenes de Compra',
      value: parseInt(ordenes.total_ordenes),
      trend: calcularTendencia(parseInt(ordenes.total_ordenes)),
      trend_direction: parseInt(ordenes.total_ordenes) > 0 ? 'up' : 'down',
      icon: 'package',
      color: 'orange'
    };

    const comprasCard: DashboardCard = {
      title: 'Valor Total',
      value: parseFloat(compras.valor_total),
      trend: calcularTendencia(parseFloat(compras.valor_total)),
      trend_direction: parseFloat(compras.valor_total) > 0 ? 'up' : 'down',
      icon: 'dollar-sign',
      color: 'red'
    };

    // Crear dashboard completo
    const dashboard: ComprasDashboard = {
      pedidos: pedidosCard,
      presupuestos: presupuestosCard,
      ordenes: ordenesCard,
      compras: comprasCard,
      resumen: {
        total_valor: parseFloat(resumen.total_valor_compras),
        total_items: parseInt(resumen.total_items_compras),
        proveedores_activos: parseInt(resumen.proveedores_activos),
        ordenes_vencidas: parseInt(resumen.ordenes_vencidas)
      }
    };

    const response: ComprasApiResponse = {
      success: true,
      message: 'Dashboard de compras obtenido exitosamente',
      data: dashboard
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener dashboard de compras:', error);
    
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
