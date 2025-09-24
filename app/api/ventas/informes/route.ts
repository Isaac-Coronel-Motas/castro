import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { VentasApiResponse } from '@/lib/types/ventas';

// GET /api/ventas/informes - Obtener informes y estadísticas de ventas
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('informes_ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const sucursal_id = searchParams.get('sucursal_id');
    const usuario_id = searchParams.get('usuario_id');
    const tipo_reporte = searchParams.get('tipo_reporte') || 'general';

    // Construir condiciones de fecha
    let fechaCondition = '';
    const queryParams: any[] = [];
    let paramCount = 0;

    if (fecha_desde && fecha_hasta) {
      paramCount++;
      fechaCondition = `AND fecha_venta >= $${paramCount} AND fecha_venta <= $${paramCount + 1}`;
      queryParams.push(fecha_desde, fecha_hasta);
      paramCount++;
    } else if (fecha_desde) {
      paramCount++;
      fechaCondition = `AND fecha_venta >= $${paramCount}`;
      queryParams.push(fecha_desde);
    } else if (fecha_hasta) {
      paramCount++;
      fechaCondition = `AND fecha_venta <= $${paramCount}`;
      queryParams.push(fecha_hasta);
    }

    // Construir condiciones adicionales
    let additionalConditions = '';
    if (sucursal_id) {
      paramCount++;
      additionalConditions += ` AND v.sucursal_id = $${paramCount}`;
      queryParams.push(parseInt(sucursal_id));
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions += ` AND v.usuario_id = $${paramCount}`;
      queryParams.push(parseInt(usuario_id));
    }

    let reportData: any = {};

    switch (tipo_reporte) {
      case 'general':
        reportData = await getGeneralReport(fechaCondition, additionalConditions, queryParams);
        break;
      case 'ventas_por_periodo':
        reportData = await getVentasPorPeriodo(fechaCondition, additionalConditions, queryParams);
        break;
      case 'top_clientes':
        reportData = await getTopClientes(fechaCondition, additionalConditions, queryParams);
        break;
      case 'top_productos':
        reportData = await getTopProductos(fechaCondition, additionalConditions, queryParams);
        break;
      case 'ventas_por_usuario':
        reportData = await getVentasPorUsuario(fechaCondition, additionalConditions, queryParams);
        break;
      case 'ventas_por_sucursal':
        reportData = await getVentasPorSucursal(fechaCondition, additionalConditions, queryParams);
        break;
      case 'tendencias_mensuales':
        reportData = await getTendenciasMensuales(fechaCondition, additionalConditions, queryParams);
        break;
      case 'estado_ventas':
        reportData = await getEstadoVentas(fechaCondition, additionalConditions, queryParams);
        break;
      case 'formas_pago':
        reportData = await getFormasPago(fechaCondition, additionalConditions, queryParams);
        break;
      case 'cobros_pendientes':
        reportData = await getCobrosPendientes(fechaCondition, additionalConditions, queryParams);
        break;
      default:
        reportData = await getGeneralReport(fechaCondition, additionalConditions, queryParams);
    }

    const response: VentasApiResponse = {
      success: true,
      message: 'Informe de ventas obtenido exitosamente',
      data: reportData
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener informe de ventas:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// Función para obtener reporte general
async function getGeneralReport(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      COUNT(*) as total_ventas,
      COALESCE(SUM(total_venta), 0) as total_monto,
      COALESCE(SUM(total_gravado), 0) as total_gravado,
      COALESCE(SUM(total_iva), 0) as total_iva,
      COALESCE(SUM(total_exento), 0) as total_exento,
      COALESCE(AVG(total_venta), 0) as promedio_venta,
      COUNT(DISTINCT cliente_id) as total_clientes,
      COUNT(DISTINCT usuario_id) as total_usuarios
    FROM ventas v
    WHERE estado != 'anulada' ${fechaCondition} ${additionalConditions}
  `;

  const result = await pool.query(query, queryParams);
  return result.rows[0];
}

// Función para obtener ventas por período
async function getVentasPorPeriodo(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      DATE_TRUNC('day', fecha_venta) as fecha,
      COUNT(*) as cantidad_ventas,
      COALESCE(SUM(total_venta), 0) as total_monto,
      COALESCE(AVG(total_venta), 0) as promedio_venta
    FROM ventas v
    WHERE estado != 'anulada' ${fechaCondition} ${additionalConditions}
    GROUP BY DATE_TRUNC('day', fecha_venta)
    ORDER BY fecha DESC
    LIMIT 30
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}

// Función para obtener top clientes
async function getTopClientes(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      c.cliente_id,
      c.nombre as cliente_nombre,
      COUNT(*) as cantidad_ventas,
      COALESCE(SUM(v.total_venta), 0) as total_monto,
      COALESCE(AVG(v.total_venta), 0) as promedio_venta
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
    WHERE v.estado != 'anulada' ${fechaCondition} ${additionalConditions}
    GROUP BY c.cliente_id, c.nombre
    ORDER BY total_monto DESC
    LIMIT 10
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}

// Función para obtener top productos
async function getTopProductos(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      p.producto_id,
      p.nombre as producto_nombre,
      SUM(vd.cantidad) as cantidad_vendida,
      COALESCE(SUM(vd.subtotal), 0) as total_monto,
      COALESCE(AVG(vd.precio_unitario), 0) as precio_promedio
    FROM ventas v
    LEFT JOIN ventas_detalle vd ON v.venta_id = vd.venta_id
    LEFT JOIN productos p ON vd.producto_id = p.producto_id
    WHERE v.estado != 'anulada' ${fechaCondition} ${additionalConditions}
    GROUP BY p.producto_id, p.nombre
    ORDER BY cantidad_vendida DESC
    LIMIT 10
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}

// Función para obtener ventas por usuario
async function getVentasPorUsuario(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      u.usuario_id,
      u.nombre as usuario_nombre,
      COUNT(*) as cantidad_ventas,
      COALESCE(SUM(v.total_venta), 0) as total_monto,
      COALESCE(AVG(v.total_venta), 0) as promedio_venta
    FROM ventas v
    LEFT JOIN usuarios u ON v.usuario_id = u.usuario_id
    WHERE v.estado != 'anulada' ${fechaCondition} ${additionalConditions}
    GROUP BY u.usuario_id, u.nombre
    ORDER BY total_monto DESC
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}

// Función para obtener ventas por sucursal
async function getVentasPorSucursal(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      s.sucursal_id,
      s.nombre as sucursal_nombre,
      COUNT(*) as cantidad_ventas,
      COALESCE(SUM(v.total_venta), 0) as total_monto,
      COALESCE(AVG(v.total_venta), 0) as promedio_venta
    FROM ventas v
    LEFT JOIN sucursales s ON v.sucursal_id = s.sucursal_id
    WHERE v.estado != 'anulada' ${fechaCondition} ${additionalConditions}
    GROUP BY s.sucursal_id, s.nombre
    ORDER BY total_monto DESC
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}

// Función para obtener tendencias mensuales
async function getTendenciasMensuales(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      DATE_TRUNC('month', fecha_venta) as mes,
      COUNT(*) as cantidad_ventas,
      COALESCE(SUM(total_venta), 0) as total_monto,
      COALESCE(AVG(total_venta), 0) as promedio_venta
    FROM ventas v
    WHERE estado != 'anulada' ${fechaCondition} ${additionalConditions}
    GROUP BY DATE_TRUNC('month', fecha_venta)
    ORDER BY mes DESC
    LIMIT 12
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}

// Función para obtener estado de ventas
async function getEstadoVentas(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      estado,
      COUNT(*) as cantidad,
      COALESCE(SUM(total_venta), 0) as total_monto
    FROM ventas v
    WHERE 1=1 ${fechaCondition} ${additionalConditions}
    GROUP BY estado
    ORDER BY cantidad DESC
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}

// Función para obtener formas de pago
async function getFormasPago(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      fc.forma_cobro_id,
      fc.nombre as forma_cobro_nombre,
      COUNT(*) as cantidad_cobros,
      COALESCE(SUM(c.monto), 0) as total_monto
    FROM cobros c
    LEFT JOIN formas_cobro fc ON c.forma_cobro_id = fc.forma_cobro_id
    LEFT JOIN ventas v ON c.venta_id = v.venta_id
    WHERE v.estado != 'anulada' ${fechaCondition} ${additionalConditions}
    GROUP BY fc.forma_cobro_id, fc.nombre
    ORDER BY total_monto DESC
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}

// Función para obtener cobros pendientes
async function getCobrosPendientes(fechaCondition: string, additionalConditions: string, queryParams: any[]) {
  const query = `
    SELECT 
      cpc.cuenta_id,
      c.nombre as cliente_nombre,
      v.nro_factura,
      cpc.monto,
      cpc.saldo,
      cpc.fecha_vencimiento,
      CASE 
        WHEN cpc.fecha_vencimiento < CURRENT_DATE THEN 'Vencida'
        WHEN cpc.fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days' THEN 'Por vencer'
        ELSE 'Vigente'
      END as estado_vencimiento
    FROM cuentas_por_cobrar cpc
    LEFT JOIN clientes c ON cpc.cliente_id = c.cliente_id
    LEFT JOIN ventas v ON cpc.venta_id = v.venta_id
    WHERE cpc.saldo > 0 ${fechaCondition} ${additionalConditions}
    ORDER BY cpc.fecha_vencimiento ASC
    LIMIT 50
  `;

  const result = await pool.query(query, queryParams);
  return result.rows;
}
