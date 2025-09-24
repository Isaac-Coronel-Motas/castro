import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/ventas/notas-remision/stats - Estadísticas de notas de remisión
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const usuario_id = searchParams.get('usuario_id');
    const origen_almacen_id = searchParams.get('origen_almacen_id');
    const destino_sucursal_id = searchParams.get('destino_sucursal_id');
    const destino_almacen_id = searchParams.get('destino_almacen_id');
    const estado = searchParams.get('estado');
    const tipo_remision = searchParams.get('tipo_remision');

    // Construir condiciones adicionales
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`nr.fecha_remision >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`nr.fecha_remision <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (usuario_id) {
      paramCount++;
      additionalConditions.push(`nr.usuario_id = $${paramCount}`);
      queryParams.push(parseInt(usuario_id));
    }

    if (origen_almacen_id) {
      paramCount++;
      additionalConditions.push(`nr.origen_almacen_id = $${paramCount}`);
      queryParams.push(parseInt(origen_almacen_id));
    }

    if (destino_sucursal_id) {
      paramCount++;
      additionalConditions.push(`nr.destino_sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(destino_sucursal_id));
    }

    if (destino_almacen_id) {
      paramCount++;
      additionalConditions.push(`nr.destino_almacen_id = $${paramCount}`);
      queryParams.push(parseInt(destino_almacen_id));
    }

    if (estado) {
      paramCount++;
      additionalConditions.push(`nr.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (tipo_remision) {
      paramCount++;
      additionalConditions.push(`nr.tipo_remision = $${paramCount}`);
      queryParams.push(tipo_remision);
    }

    const whereClause = additionalConditions.length > 0 
      ? `WHERE ${additionalConditions.join(' AND ')}`
      : '';

    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_remisiones,
        COALESCE(SUM(detalle_stats.total_productos), 0) as total_productos,
        COALESCE(SUM(detalle_stats.total_cantidad), 0) as total_cantidad
      FROM nota_remision nr
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      ${whereClause}
    `;

    const statsResult = await pool.query(statsQuery, queryParams);
    const generalStats = statsResult.rows[0];

    // Estadísticas del día actual
    const todayQuery = `
      SELECT 
        COUNT(*) as remisiones_hoy,
        COALESCE(SUM(detalle_stats.total_productos), 0) as productos_hoy,
        COALESCE(SUM(detalle_stats.total_cantidad), 0) as cantidad_hoy
      FROM nota_remision nr
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      WHERE nr.fecha_remision = CURRENT_DATE
      ${additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : ''}
    `;

    const todayResult = await pool.query(todayQuery, queryParams);
    const todayStats = todayResult.rows[0];

    // Estadísticas del mes actual
    const monthQuery = `
      SELECT 
        COUNT(*) as remisiones_mes,
        COALESCE(SUM(detalle_stats.total_productos), 0) as productos_mes,
        COALESCE(SUM(detalle_stats.total_cantidad), 0) as cantidad_mes
      FROM nota_remision nr
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      WHERE DATE_TRUNC('month', nr.fecha_remision) = DATE_TRUNC('month', CURRENT_DATE)
      ${additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : ''}
    `;

    const monthResult = await pool.query(monthQuery, queryParams);
    const monthStats = monthResult.rows[0];

    // Estadísticas por estado
    const estadoQuery = `
      SELECT 
        nr.estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(detalle_stats.total_productos), 0) as productos
      FROM nota_remision nr
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      ${whereClause}
      GROUP BY nr.estado
      ORDER BY cantidad DESC
    `;

    const estadoResult = await pool.query(estadoQuery, queryParams);

    // Estadísticas por tipo
    const tipoQuery = `
      SELECT 
        nr.tipo_remision,
        COUNT(*) as cantidad,
        COALESCE(SUM(detalle_stats.total_productos), 0) as productos
      FROM nota_remision nr
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      ${whereClause}
      GROUP BY nr.tipo_remision
      ORDER BY cantidad DESC
    `;

    const tipoResult = await pool.query(tipoQuery, queryParams);

    // Estadísticas por usuario
    const usuariosQuery = `
      SELECT 
        u.nombre as usuario,
        COUNT(*) as cantidad,
        COALESCE(SUM(detalle_stats.total_productos), 0) as productos
      FROM nota_remision nr
      LEFT JOIN usuarios u ON nr.usuario_id = u.usuario_id
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      ${whereClause}
      GROUP BY u.nombre
      ORDER BY cantidad DESC
    `;

    const usuariosResult = await pool.query(usuariosQuery, queryParams);

    // Estadísticas por almacén de origen
    const almacenQuery = `
      SELECT 
        oa.nombre as almacen,
        COUNT(*) as cantidad,
        COALESCE(SUM(detalle_stats.total_productos), 0) as productos
      FROM nota_remision nr
      LEFT JOIN almacenes oa ON nr.origen_almacen_id = oa.almacen_id
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      ${whereClause}
      GROUP BY oa.nombre
      ORDER BY cantidad DESC
    `;

    const almacenResult = await pool.query(almacenQuery, queryParams);

    // Estadísticas por día (últimos 30 días)
    const dailyQuery = `
      SELECT 
        nr.fecha_remision,
        COUNT(*) as cantidad,
        COALESCE(SUM(detalle_stats.total_productos), 0) as productos
      FROM nota_remision nr
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      WHERE nr.fecha_remision >= CURRENT_DATE - INTERVAL '30 days'
      ${additionalConditions.length > 0 ? `AND ${additionalConditions.join(' AND ')}` : ''}
      GROUP BY nr.fecha_remision
      ORDER BY nr.fecha_remision DESC
    `;

    const dailyResult = await pool.query(dailyQuery, queryParams);

    const response = {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        general: {
          total_remisiones: parseInt(generalStats.total_remisiones),
          total_productos: parseInt(generalStats.total_productos),
          total_cantidad: parseInt(generalStats.total_cantidad)
        },
        hoy: {
          remisiones_hoy: parseInt(todayStats.remisiones_hoy),
          productos_hoy: parseInt(todayStats.productos_hoy),
          cantidad_hoy: parseInt(todayStats.cantidad_hoy)
        },
        mes: {
          remisiones_mes: parseInt(monthStats.remisiones_mes),
          productos_mes: parseInt(monthStats.productos_mes),
          cantidad_mes: parseInt(monthStats.cantidad_mes)
        },
        por_estado: estadoResult.rows.map(row => ({
          estado: row.estado || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          productos: parseInt(row.productos)
        })),
        por_tipo: tipoResult.rows.map(row => ({
          tipo: row.tipo_remision || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          productos: parseInt(row.productos)
        })),
        por_usuario: usuariosResult.rows.map(row => ({
          usuario: row.usuario || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          productos: parseInt(row.productos)
        })),
        por_almacen_origen: almacenResult.rows.map(row => ({
          almacen: row.almacen || 'Sin especificar',
          cantidad: parseInt(row.cantidad),
          productos: parseInt(row.productos)
        })),
        por_dia: dailyResult.rows.map(row => ({
          fecha: row.fecha_remision,
          cantidad: parseInt(row.cantidad),
          productos: parseInt(row.productos)
        }))
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener estadísticas de notas de remisión:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
