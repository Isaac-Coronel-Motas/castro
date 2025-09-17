import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  ServiciosTecnicosApiResponse, 
  InformeServiciosTecnicos 
} from '@/lib/types/servicios-tecnicos';

// GET /api/servicios/informes - Obtener informe de servicios técnicos
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_informes_servicios')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const sucursal_id = searchParams.get('sucursal_id');
    const tecnico_id = searchParams.get('tecnico_id');
    const cliente_id = searchParams.get('cliente_id');
    const estado = searchParams.get('estado');
    const tipo_periodo = searchParams.get('tipo_periodo') || 'mes';

    // Construir filtros de fecha
    const fechaFilter = fecha_desde && fecha_hasta 
      ? `AND fecha BETWEEN '${fecha_desde}' AND '${fecha_hasta}'`
      : '';

    const sucursalFilter = sucursal_id 
      ? `AND sucursal_id = ${sucursal_id}`
      : '';

    const tecnicoFilter = tecnico_id 
      ? `AND tecnico_id = ${tecnico_id}`
      : '';

    const clienteFilter = cliente_id 
      ? `AND cliente_id = ${cliente_id}`
      : '';

    // Consulta para resumen general
    const resumenQuery = `
      SELECT 
        COUNT(DISTINCT ss.solicitud_id) as total_solicitudes,
        COUNT(DISTINCT re.recepcion_id) as total_recepciones,
        COUNT(DISTINCT d.diagnostico_id) as total_diagnosticos,
        COUNT(DISTINCT ps.presu_serv_id) as total_presupuestos,
        COUNT(DISTINCT os.orden_servicio_id) as total_ordenes,
        COUNT(DISTINCT r.reclamo_id) as total_reclamos,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_total_presupuestos,
        COALESCE(SUM(os.monto_servicio), 0) as monto_total_ordenes,
        COALESCE(AVG(
          CASE 
            WHEN r.fecha_resolucion IS NOT NULL THEN 
              EXTRACT(DAYS FROM (r.fecha_resolucion - r.fecha_reclamo))
          END
        ), 0) as tiempo_promedio_resolucion
      FROM solicitud_servicio ss
      LEFT JOIN recepcion_equipo re ON ss.solicitud_id = re.solicitud_id
      LEFT JOIN diagnostico d ON re.recepcion_id = d.recepcion_id
      LEFT JOIN presupuesto_servicios ps ON d.diagnostico_id = ps.diagnostico_id
      LEFT JOIN orden_servicio os ON ps.presu_serv_id = os.presu_serv_id
      LEFT JOIN reclamos r ON os.orden_servicio_id = r.orden_servicio_id
      WHERE 1=1 ${fechaFilter.replace('fecha', 'ss.fecha_solicitud')} ${sucursalFilter} ${clienteFilter}
    `;

    // Consulta para solicitudes por estado
    const solicitudesPorEstadoQuery = `
      SELECT 
        ss.estado_solicitud as estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
      FROM solicitud_servicio ss
      WHERE 1=1 ${fechaFilter.replace('fecha', 'ss.fecha_solicitud')} ${sucursalFilter} ${clienteFilter}
      GROUP BY ss.estado_solicitud
      ORDER BY cantidad DESC
    `;

    // Consulta para diagnósticos por estado
    const diagnosticosPorEstadoQuery = `
      SELECT 
        d.estado_diagnostico as estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
      FROM diagnostico d
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      WHERE 1=1 ${fechaFilter.replace('fecha', 'd.fecha_diagnostico')} ${sucursalFilter} ${clienteFilter}
      GROUP BY d.estado_diagnostico
      ORDER BY cantidad DESC
    `;

    // Consulta para presupuestos por estado
    const presupuestosPorEstadoQuery = `
      SELECT 
        ps.estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
      FROM presupuesto_servicios ps
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      WHERE 1=1 ${fechaFilter.replace('fecha', 'ps.fecha_presupuesto')} ${sucursalFilter} ${clienteFilter}
      GROUP BY ps.estado
      ORDER BY cantidad DESC
    `;

    // Consulta para órdenes por estado
    const ordenesPorEstadoQuery = `
      SELECT 
        os.estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
      FROM orden_servicio os
      LEFT JOIN presupuesto_servicios ps ON os.presu_serv_id = ps.presu_serv_id
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      WHERE 1=1 ${fechaFilter.replace('fecha', 'os.fecha_solicitud')} ${sucursalFilter} ${clienteFilter}
      GROUP BY os.estado
      ORDER BY cantidad DESC
    `;

    // Consulta para reclamos por estado
    const reclamosPorEstadoQuery = `
      SELECT 
        r.estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
      FROM reclamos r
      LEFT JOIN solicitud_servicio ss ON r.cliente_id = ss.cliente_id
      WHERE 1=1 ${fechaFilter.replace('fecha', 'r.fecha_reclamo')} ${sucursalFilter} ${clienteFilter}
      GROUP BY r.estado
      ORDER BY cantidad DESC
    `;

    // Consulta para servicios por técnico
    const serviciosPorTecnicoQuery = `
      SELECT 
        t.usuario_id as tecnico_id,
        t.nombre as tecnico_nombre,
        COUNT(DISTINCT d.diagnostico_id) as total_servicios,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_total,
        ROUND(COUNT(DISTINCT d.diagnostico_id) * 100.0 / SUM(COUNT(DISTINCT d.diagnostico_id)) OVER(), 2) as porcentaje
      FROM usuarios t
      LEFT JOIN diagnostico d ON t.usuario_id = d.tecnico_id
      LEFT JOIN presupuesto_servicios ps ON d.diagnostico_id = ps.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      WHERE t.usuario_id IS NOT NULL ${fechaFilter.replace('fecha', 'd.fecha_diagnostico')} ${sucursalFilter} ${tecnicoFilter}
      GROUP BY t.usuario_id, t.nombre
      ORDER BY total_servicios DESC
      LIMIT 10
    `;

    // Consulta para servicios por sucursal
    const serviciosPorSucursalQuery = `
      SELECT 
        s.sucursal_id,
        s.nombre as sucursal_nombre,
        COUNT(DISTINCT ss.solicitud_id) as total_servicios,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto_total,
        ROUND(COUNT(DISTINCT ss.solicitud_id) * 100.0 / SUM(COUNT(DISTINCT ss.solicitud_id)) OVER(), 2) as porcentaje
      FROM sucursales s
      LEFT JOIN solicitud_servicio ss ON s.sucursal_id = ss.sucursal_id
      LEFT JOIN recepcion_equipo re ON ss.solicitud_id = re.solicitud_id
      LEFT JOIN diagnostico d ON re.recepcion_id = d.recepcion_id
      LEFT JOIN presupuesto_servicios ps ON d.diagnostico_id = ps.diagnostico_id
      WHERE s.sucursal_id IS NOT NULL ${fechaFilter.replace('fecha', 'ss.fecha_solicitud')} ${sucursalFilter}
      GROUP BY s.sucursal_id, s.nombre
      ORDER BY total_servicios DESC
    `;

    // Consulta para tendencias mensuales de solicitudes
    const tendenciasSolicitudesQuery = `
      SELECT 
        TO_CHAR(ss.fecha_solicitud, 'Mon') as mes,
        EXTRACT(MONTH FROM ss.fecha_solicitud) as mes_num,
        COUNT(*) as cantidad
      FROM solicitud_servicio ss
      WHERE 1=1 ${fechaFilter.replace('fecha', 'ss.fecha_solicitud')} ${sucursalFilter}
      GROUP BY EXTRACT(MONTH FROM ss.fecha_solicitud), TO_CHAR(ss.fecha_solicitud, 'Mon')
      ORDER BY EXTRACT(MONTH FROM ss.fecha_solicitud)
    `;

    // Consulta para tendencias mensuales de montos
    const tendenciasMontosQuery = `
      SELECT 
        TO_CHAR(ps.fecha_presupuesto, 'Mon') as mes,
        EXTRACT(MONTH FROM ps.fecha_presupuesto) as mes_num,
        COALESCE(SUM(ps.monto_presu_ser), 0) as monto
      FROM presupuesto_servicios ps
      LEFT JOIN diagnostico d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN recepcion_equipo re ON d.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      WHERE 1=1 ${fechaFilter.replace('fecha', 'ps.fecha_presupuesto')} ${sucursalFilter}
      GROUP BY EXTRACT(MONTH FROM ps.fecha_presupuesto), TO_CHAR(ps.fecha_presupuesto, 'Mon')
      ORDER BY EXTRACT(MONTH FROM ps.fecha_presupuesto)
    `;

    // Ejecutar consultas en paralelo
    const [
      resumenResult,
      solicitudesPorEstadoResult,
      diagnosticosPorEstadoResult,
      presupuestosPorEstadoResult,
      ordenesPorEstadoResult,
      reclamosPorEstadoResult,
      serviciosPorTecnicoResult,
      serviciosPorSucursalResult,
      tendenciasSolicitudesResult,
      tendenciasMontosResult
    ] = await Promise.all([
      pool.query(resumenQuery),
      pool.query(solicitudesPorEstadoQuery),
      pool.query(diagnosticosPorEstadoQuery),
      pool.query(presupuestosPorEstadoQuery),
      pool.query(ordenesPorEstadoQuery),
      pool.query(reclamosPorEstadoQuery),
      pool.query(serviciosPorTecnicoQuery),
      pool.query(serviciosPorSucursalQuery),
      pool.query(tendenciasSolicitudesQuery),
      pool.query(tendenciasMontosQuery)
    ]);

    const resumen = resumenResult.rows[0];
    const solicitudesPorEstado = solicitudesPorEstadoResult.rows;
    const diagnosticosPorEstado = diagnosticosPorEstadoResult.rows;
    const presupuestosPorEstado = presupuestosPorEstadoResult.rows;
    const ordenesPorEstado = ordenesPorEstadoResult.rows;
    const reclamosPorEstado = reclamosPorEstadoResult.rows;
    const serviciosPorTecnico = serviciosPorTecnicoResult.rows;
    const serviciosPorSucursal = serviciosPorSucursalResult.rows;
    const tendenciasSolicitudes = tendenciasSolicitudesResult.rows;
    const tendenciasMontos = tendenciasMontosResult.rows;

    // Combinar todos los estados
    const porEstado = [
      ...solicitudesPorEstado.map(s => ({ ...s, tipo: 'Solicitudes' })),
      ...diagnosticosPorEstado.map(d => ({ ...d, tipo: 'Diagnósticos' })),
      ...presupuestosPorEstado.map(p => ({ ...p, tipo: 'Presupuestos' })),
      ...ordenesPorEstado.map(o => ({ ...o, tipo: 'Órdenes' })),
      ...reclamosPorEstado.map(r => ({ ...r, tipo: 'Reclamos' }))
    ];

    // Procesar tendencias de solicitudes
    const tendenciasSolicitudesProcesadas = tendenciasSolicitudes.map((tendencia, index) => {
      const anterior = index > 0 ? parseInt(tendenciasSolicitudes[index - 1].cantidad) : parseInt(tendencia.cantidad);
      const cambio = anterior > 0 ? ((parseInt(tendencia.cantidad) - anterior) / anterior) * 100 : 0;
      
      return {
        mes: tendencia.mes,
        cantidad: parseInt(tendencia.cantidad),
        tendencia: cambio > 5 ? 'up' : cambio < -5 ? 'down' : 'stable'
      };
    });

    // Procesar tendencias de montos
    const tendenciasMontosProcesadas = tendenciasMontos.map((tendencia, index) => {
      const anterior = index > 0 ? parseFloat(tendenciasMontos[index - 1].monto) : parseFloat(tendencia.monto);
      const cambio = anterior > 0 ? ((parseFloat(tendencia.monto) - anterior) / anterior) * 100 : 0;
      
      return {
        mes: tendencia.mes,
        monto: parseFloat(tendencia.monto),
        tendencia: cambio > 5 ? 'up' : cambio < -5 ? 'down' : 'stable'
      };
    });

    // Crear informe completo
    const informe: InformeServiciosTecnicos = {
      periodo: {
        desde: fecha_desde || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        hasta: fecha_hasta || new Date().toISOString().split('T')[0]
      },
      resumen: {
        total_solicitudes: parseInt(resumen.total_solicitudes),
        total_recepciones: parseInt(resumen.total_recepciones),
        total_diagnosticos: parseInt(resumen.total_diagnosticos),
        total_presupuestos: parseInt(resumen.total_presupuestos),
        total_ordenes: parseInt(resumen.total_ordenes),
        total_reclamos: parseInt(resumen.total_reclamos),
        monto_total_presupuestos: parseFloat(resumen.monto_total_presupuestos),
        monto_total_ordenes: parseFloat(resumen.monto_total_ordenes),
        tiempo_promedio_resolucion: parseFloat(resumen.tiempo_promedio_resolucion)
      },
      por_estado: porEstado.map(estado => ({
        estado: estado.estado,
        cantidad: parseInt(estado.cantidad),
        porcentaje: parseFloat(estado.porcentaje)
      })),
      por_tecnico: serviciosPorTecnico.map(tecnico => ({
        tecnico_id: parseInt(tecnico.tecnico_id),
        tecnico_nombre: tecnico.tecnico_nombre,
        total_servicios: parseInt(tecnico.total_servicios),
        monto_total: parseFloat(tecnico.monto_total),
        porcentaje: parseFloat(tecnico.porcentaje)
      })),
      por_sucursal: serviciosPorSucursal.map(sucursal => ({
        sucursal_id: parseInt(sucursal.sucursal_id),
        sucursal_nombre: sucursal.sucursal_nombre,
        total_servicios: parseInt(sucursal.total_servicios),
        monto_total: parseFloat(sucursal.monto_total),
        porcentaje: parseFloat(sucursal.porcentaje)
      })),
      tendencias: {
        solicitudes_mensuales: tendenciasSolicitudesProcesadas,
        monto_mensual: tendenciasMontosProcesadas
      }
    };

    const response: ServiciosTecnicosApiResponse = {
      success: true,
      message: 'Informe de servicios técnicos obtenido exitosamente',
      data: informe
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener informe de servicios técnicos:', error);
    
    const response: ServiciosTecnicosApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
