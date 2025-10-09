// ===== TIPOS BASE PARA INFORMES DE SERVICIOS TÉCNICOS =====

export interface FiltrosBaseInformeServicios {
  fecha_desde?: string;
  fecha_hasta?: string;
  sucursal_id?: number;
  tecnico_id?: number;
  cliente_id?: number;
  estado?: string;
  tipo_periodo?: 'dia' | 'semana' | 'mes' | 'año';
}

// ===== FILTROS ESPECÍFICOS POR MÓDULO =====

export interface FiltrosInformeSolicitudes extends FiltrosBaseInformeServicios {
  tipo_atencion?: string;
  ciudad_id?: number;
}

export interface FiltrosInformeRecepcion extends FiltrosBaseInformeServicios {
  estado_recepcion?: string;
  equipo_id?: number;
}

export interface FiltrosInformeDiagnosticos extends FiltrosBaseInformeServicios {
  estado_diagnostico?: string;
  tipo_diag_id?: number;
  motivo?: string;
}

export interface FiltrosInformePresupuestos extends FiltrosBaseInformeServicios {
  tipo_presu?: string;
  valido_desde?: string;
  valido_hasta?: string;
  promocion_id?: number;
}

export interface FiltrosInformeOrdenes extends FiltrosBaseInformeServicios {
  forma_cobro_id?: number;
  fecha_ejecucion_desde?: string;
  fecha_ejecucion_hasta?: string;
}

export interface FiltrosInformeRetiro extends FiltrosBaseInformeServicios {
  documento_entrega?: string;
}

export interface FiltrosInformeReclamos extends FiltrosBaseInformeServicios {
  gestionado_por?: number;
  fecha_resolucion_desde?: string;
  fecha_resolucion_hasta?: string;
}

// ===== ESTRUCTURAS DE DATOS PARA INFORMES =====

export interface ResumenInformeServicios {
  total_registros: number;
  valor_total?: number;
  promedio_por_registro?: number;
  tendencia_periodo_anterior?: number;
  porcentaje_cambio?: number;
}

export interface DistribucionPorEstado {
  estado: string;
  cantidad: number;
  porcentaje: number;
  valor_total?: number;
}

export interface TopTecnico {
  tecnico_id: number;
  tecnico_nombre: string;
  cantidad_registros: number;
  valor_total?: number;
  porcentaje: number;
}

export interface TopCliente {
  cliente_id: number;
  cliente_nombre: string;
  cantidad_registros: number;
  valor_total?: number;
  porcentaje: number;
}

export interface DistribucionPorSucursal {
  sucursal_id: number;
  sucursal_nombre: string;
  cantidad_registros: number;
  valor_total?: number;
  porcentaje: number;
}

export interface TendenciaMensual {
  mes: string;
  año: number;
  cantidad_registros: number;
  valor_total?: number;
  tendencia: 'up' | 'down' | 'stable';
}

// ===== INFORMES ESPECÍFICOS =====

export interface InformeSolicitudes {
  resumen: ResumenInformeServicios;
  por_estado: DistribucionPorEstado[];
  por_tipo_atencion: DistribucionPorEstado[];
  por_tecnico: TopTecnico[];
  por_cliente: TopCliente[];
  por_sucursal: DistribucionPorSucursal[];
  por_ciudad: DistribucionPorSucursal[];
  tendencias_mensuales: TendenciaMensual[];
}

export interface InformeRecepcion {
  resumen: ResumenInformeServicios;
  por_estado: DistribucionPorEstado[];
  por_tecnico: TopTecnico[];
  por_cliente: TopCliente[];
  por_sucursal: DistribucionPorSucursal[];
  por_equipo: TopCliente[];
  tendencias_mensuales: TendenciaMensual[];
}

export interface InformeDiagnosticos {
  resumen: ResumenInformeServicios;
  por_estado: DistribucionPorEstado[];
  por_tipo_diagnostico: DistribucionPorEstado[];
  por_tecnico: TopTecnico[];
  por_cliente: TopCliente[];
  por_sucursal: DistribucionPorSucursal[];
  por_motivo: DistribucionPorEstado[];
  tendencias_mensuales: TendenciaMensual[];
}

export interface InformePresupuestos {
  resumen: ResumenInformeServicios;
  por_estado: DistribucionPorEstado[];
  por_tipo_presupuesto: DistribucionPorEstado[];
  por_tecnico: TopTecnico[];
  por_cliente: TopCliente[];
  por_sucursal: DistribucionPorSucursal[];
  por_promocion: DistribucionPorEstado[];
  tendencias_mensuales: TendenciaMensual[];
}

export interface InformeOrdenes {
  resumen: ResumenInformeServicios;
  por_estado: DistribucionPorEstado[];
  por_tecnico: TopTecnico[];
  por_cliente: TopCliente[];
  por_sucursal: DistribucionPorSucursal[];
  por_forma_cobro: DistribucionPorEstado[];
  tendencias_mensuales: TendenciaMensual[];
}

export interface InformeRetiro {
  resumen: ResumenInformeServicios;
  por_tecnico: TopTecnico[];
  por_cliente: TopCliente[];
  por_sucursal: DistribucionPorSucursal[];
  por_documento: DistribucionPorEstado[];
  tendencias_mensuales: TendenciaMensual[];
}

export interface InformeReclamos {
  resumen: ResumenInformeServicios;
  por_estado: DistribucionPorEstado[];
  por_tecnico: TopTecnico[];
  por_cliente: TopCliente[];
  por_sucursal: DistribucionPorSucursal[];
  por_gestionado_por: TopTecnico[];
  tendencias_mensuales: TendenciaMensual[];
}

// ===== DASHBOARD CONSOLIDADO =====

export interface InformeDashboardServicios {
  resumen_general: {
    total_solicitudes: number;
    total_recepciones: number;
    total_diagnosticos: number;
    total_presupuestos: number;
    total_ordenes: number;
    total_retiros: number;
    total_reclamos: number;
    valor_total_presupuestos: number;
    valor_total_ordenes: number;
    valor_total_general: number;
  };
  distribucion_por_estado: {
    solicitudes: DistribucionPorEstado[];
    recepciones: DistribucionPorEstado[];
    diagnosticos: DistribucionPorEstado[];
    presupuestos: DistribucionPorEstado[];
    ordenes: DistribucionPorEstado[];
    reclamos: DistribucionPorEstado[];
  };
  top_tecnicos: TopTecnico[];
  top_clientes: TopCliente[];
  distribucion_por_sucursal: DistribucionPorSucursal[];
  tendencias_mensuales: TendenciaMensual[];
}
