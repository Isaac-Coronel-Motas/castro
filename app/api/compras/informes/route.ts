import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  ComprasAdicionalesApiResponse, 
  InformeCompras, 
  FiltrosInforme 
} from '@/lib/types/compras-adicionales';

// GET /api/compras/informes - Obtener informe de compras
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const sucursal_id = searchParams.get('sucursal_id');
    const proveedor_id = searchParams.get('proveedor_id');
    const categoria_id = searchParams.get('categoria_id');
    const estado = searchParams.get('estado');
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes';

    // Construir filtros de fecha
    const fechaFilter = fecha_desde && fecha_hasta 
      ? `AND fecha BETWEEN '${fecha_desde}' AND '${fecha_hasta}'`
      : '';

    const sucursalFilter = sucursal_id 
      ? `AND sucursal_id = ${sucursal_id}`
      : '';

    const proveedorFilter = proveedor_id 
      ? `AND proveedor_id = ${proveedor_id}`
      : '';

    const categoriaFilter = categoria_id 
      ? `AND categoria_id = ${categoria_id}`
      : '';

    // Consulta para resumen general
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT cc.compra_id) as total_compras,
        COALESCE(SUM(cc.monto_compra), 0) as total_gastado,
        COALESCE(AVG(cc.monto_compra), 0) as promedio_compra,
        COUNT(DISTINCT cc.proveedor_id) as proveedores_activos,
        COUNT(DISTINCT oc.orden_compra_id) as ordenes_procesadas
      FROM compra_cabecera cc
      LEFT JOIN ordenes_compra oc ON cc.orden_compra_id = oc.orden_compra_id
      WHERE 1=1 ${fechaFilter.replace('fecha', 'cc.fecha_compra')} ${sucursalFilter} ${proveedorFilter}
    `;

    // Consulta para gastos vs presupuesto (simulado)
    const gastosVsPresupuestoQuery = `
      SELECT 
        TO_CHAR(cc.fecha_compra, 'Mon') as mes,
        EXTRACT(MONTH FROM cc.fecha_compra) as mes_num,
        COALESCE(SUM(cc.monto_compra), 0) as gasto_real,
        3000000 as presupuesto
      FROM compra_cabecera cc
      WHERE 1=1 ${fechaFilter.replace('fecha', 'cc.fecha_compra')} ${sucursalFilter}
      GROUP BY EXTRACT(MONTH FROM cc.fecha_compra), TO_CHAR(cc.fecha_compra, 'Mon')
      ORDER BY EXTRACT(MONTH FROM cc.fecha_compra)
    `;

    // Consulta para top proveedores
    const topProveedoresQuery = `
      SELECT 
        cc.proveedor_id,
        p.nombre_proveedor,
        COUNT(cc.compra_id) as total_pedidos,
        COALESCE(SUM(cc.monto_compra), 0) as monto_total,
        COALESCE(cat.nombre_categoria, 'Sin categoría') as categoria_principal
      FROM compra_cabecera cc
      LEFT JOIN proveedores p ON cc.proveedor_id = p.proveedor_id
      LEFT JOIN (
        SELECT 
          dc.compra_id,
          pr.categoria_id,
          c.nombre_categoria,
          ROW_NUMBER() OVER (PARTITION BY dc.compra_id ORDER BY dc.cantidad DESC) as rn
        FROM detalle_compras dc
        LEFT JOIN productos pr ON dc.producto_id = pr.producto_id
        LEFT JOIN categorias c ON pr.categoria_id = c.categoria_id
      ) cat ON cc.compra_id = cat.compra_id AND cat.rn = 1
      WHERE 1=1 ${fechaFilter.replace('fecha', 'cc.fecha_compra')} ${sucursalFilter} ${proveedorFilter}
      GROUP BY cc.proveedor_id, p.nombre_proveedor, cat.nombre_categoria
      ORDER BY monto_total DESC
      LIMIT 10
    `;

    // Consulta para distribución por categorías
    const distribucionCategoriasQuery = `
      SELECT 
        COALESCE(c.nombre_categoria, 'Sin categoría') as categoria,
        COUNT(DISTINCT dc.compra_id) as total_compras,
        COALESCE(SUM(dc.cantidad * dc.precio_unitario), 0) as monto_total
      FROM detalle_compras dc
      LEFT JOIN productos p ON dc.producto_id = p.producto_id
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN compra_cabecera cc ON dc.compra_id = cc.compra_id
      WHERE 1=1 ${fechaFilter.replace('fecha', 'cc.fecha_compra')} ${sucursalFilter} ${categoriaFilter}
      GROUP BY c.nombre_categoria
      ORDER BY monto_total DESC
    `;

    // Consulta para tendencias mensuales
    const tendenciasMensualesQuery = `
      SELECT 
        TO_CHAR(cc.fecha_compra, 'Mon') as mes,
        EXTRACT(MONTH FROM cc.fecha_compra) as mes_num,
        COALESCE(SUM(cc.monto_compra), 0) as monto
      FROM compra_cabecera cc
      WHERE 1=1 ${fechaFilter.replace('fecha', 'cc.fecha_compra')} ${sucursalFilter}
      GROUP BY EXTRACT(MONTH FROM cc.fecha_compra), TO_CHAR(cc.fecha_compra, 'Mon')
      ORDER BY EXTRACT(MONTH FROM cc.fecha_compra)
    `;

    // Consulta para compras por estado
    const comprasPorEstadoQuery = `
      SELECT 
        cc.estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
      FROM compra_cabecera cc
      WHERE 1=1 ${fechaFilter.replace('fecha', 'cc.fecha_compra')} ${sucursalFilter}
      GROUP BY cc.estado
      ORDER BY cantidad DESC
    `;

    // Ejecutar consultas en paralelo
    const [
      resumenResult,
      gastosVsPresupuestoResult,
      topProveedoresResult,
      distribucionCategoriasResult,
      tendenciasMensualesResult,
      comprasPorEstadoResult
    ] = await Promise.all([
      pool.query(resumenQuery),
      pool.query(gastosVsPresupuestoQuery),
      pool.query(topProveedoresQuery),
      pool.query(distribucionCategoriasQuery),
      pool.query(tendenciasMensualesQuery),
      pool.query(comprasPorEstadoQuery)
    ]);

    const resumen = resumenResult.rows[0];
    const gastosVsPresupuesto = gastosVsPresupuestoResult.rows;
    const topProveedores = topProveedoresResult.rows;
    const distribucionCategorias = distribucionCategoriasResult.rows;
    const tendenciasMensuales = tendenciasMensualesResult.rows;
    const comprasPorEstado = comprasPorEstadoResult.rows;

    // Calcular total de gastos para porcentajes
    const totalGastos = distribucionCategorias.reduce((sum, cat) => sum + parseFloat(cat.monto_total), 0);
    const totalProveedores = topProveedores.reduce((sum, prov) => sum + parseFloat(prov.monto_total), 0);

    // Procesar distribución por categorías con porcentajes y colores
    const distribucionConPorcentajes = distribucionCategorias.map((cat, index) => {
      const porcentaje = totalGastos > 0 ? (parseFloat(cat.monto_total) / totalGastos) * 100 : 0;
      const colores = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#6B7280'];
      return {
        categoria: cat.categoria,
        porcentaje: Math.round(porcentaje * 100) / 100,
        monto_total: parseFloat(cat.monto_total),
        color: colores[index % colores.length]
      };
    });

    // Procesar top proveedores con porcentajes
    const topProveedoresConPorcentajes = topProveedores.map(prov => {
      const porcentaje = totalProveedores > 0 ? (parseFloat(prov.monto_total) / totalProveedores) * 100 : 0;
      return {
        proveedor_id: parseInt(prov.proveedor_id),
        proveedor_nombre: prov.nombre_proveedor,
        total_pedidos: parseInt(prov.total_pedidos),
        monto_total: parseFloat(prov.monto_total),
        categoria_principal: prov.categoria_principal,
        porcentaje: Math.round(porcentaje * 100) / 100
      };
    });

    // Procesar gastos vs presupuesto
    const gastosVsPresupuestoProcesado = gastosVsPresupuesto.map(gasto => {
      const diferencia = parseFloat(gasto.gasto_real) - parseFloat(gasto.presupuesto);
      const porcentajeUtilizacion = parseFloat(gasto.presupuesto) > 0 
        ? (parseFloat(gasto.gasto_real) / parseFloat(gasto.presupuesto)) * 100 
        : 0;
      
      return {
        mes: gasto.mes,
        gasto_real: parseFloat(gasto.gasto_real),
        presupuesto: parseFloat(gasto.presupuesto),
        diferencia,
        porcentaje_utilizacion: Math.round(porcentajeUtilizacion * 100) / 100
      };
    });

    // Procesar tendencias mensuales
    const tendenciasProcesadas = tendenciasMensuales.map((tendencia, index) => {
      const anterior = index > 0 ? parseFloat(tendenciasMensuales[index - 1].monto) : parseFloat(tendencia.monto);
      const cambio = anterior > 0 ? ((parseFloat(tendencia.monto) - anterior) / anterior) * 100 : 0;
      
      return {
        mes: tendencia.mes,
        monto: parseFloat(tendencia.monto),
        tendencia: cambio > 5 ? 'up' : cambio < -5 ? 'down' : 'stable'
      };
    });

    // Calcular utilización de presupuesto promedio
    const utilizacionPresupuesto = gastosVsPresupuestoProcesado.length > 0
      ? gastosVsPresupuestoProcesado.reduce((sum, gasto) => sum + gasto.porcentaje_utilizacion, 0) / gastosVsPresupuestoProcesado.length
      : 0;

    // Crear informe completo
    const informe: InformeCompras = {
      periodo: {
        desde: fecha_desde || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        hasta: fecha_hasta || new Date().toISOString().split('T')[0]
      },
      resumen: {
        total_gastado: parseFloat(resumen.total_gastado),
        total_compras: parseInt(resumen.total_compras),
        promedio_compra: parseFloat(resumen.promedio_compra),
        proveedores_activos: parseInt(resumen.proveedores_activos),
        utilizacion_presupuesto: Math.round(utilizacionPresupuesto * 100) / 100,
        ordenes_procesadas: parseInt(resumen.ordenes_procesadas)
      },
      gastos_vs_presupuesto: gastosVsPresupuestoProcesado,
      top_proveedores: topProveedoresConPorcentajes,
      distribucion_categorias: distribucionConPorcentajes,
      tendencias: {
        gastos_mensuales: tendenciasProcesadas,
        compras_por_estado: comprasPorEstado.map(estado => ({
          estado: estado.estado,
          cantidad: parseInt(estado.cantidad),
          porcentaje: parseFloat(estado.porcentaje)
        }))
      }
    };

    const response: ComprasAdicionalesApiResponse = {
      success: true,
      message: 'Informe de compras obtenido exitosamente',
      data: informe
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener informe de compras:', error);
    
    const response: ComprasAdicionalesApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
