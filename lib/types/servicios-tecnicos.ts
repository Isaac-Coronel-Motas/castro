// Tipos para módulo de Servicios Técnicos

// ===== ENUMS =====
export type EstadoSolicitud = 'Pendiente' | 'Asignada' | 'En proceso' | 'Finalizada' | 'Cancelada';
export type EstadoRecepcion = 'En revisión' | 'Cancelada' | 'Recepcionada';
export type EstadoDiagnostico = 'pendiente' | 'en_proceso' | 'completado' | 'rechazado' | 'cancelado';
export type EstadoPresupuestoServicio = 'pendiente' | 'aprobado' | 'rechazado';
export type EstadoOrdenServicio = 'pendiente' | 'en_proceso' | 'completado';
export type EstadoReclamo = 'pendiente' | 'en_verificacion' | 'resuelto' | 'rechazado' | 'anulado';
export type EstadoVisita = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
export type TipoAtencion = 'Visita' | 'Recepcion';
export type TipoPresupuestoServicio = 'con_diagnostico' | 'sin_diagnostico';

// ===== SOLICITUDES DE CLIENTE =====
export interface SolicitudServicio {
  solicitud_id: number;
  fecha_solicitud: string;
  cliente_id: number;
  direccion: string;
  sucursal_id: number;
  descripcion_problema?: string;
  recepcionado_por: number;
  fecha_programada?: string;
  estado_solicitud: EstadoSolicitud;
  observaciones?: string;
  ciudad_id?: number;
  nro_solicitud?: string;
  tipo_atencion: TipoAtencion;
  // Campos adicionales para joins
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  sucursal_nombre?: string;
  ciudad_nombre?: string;
  recepcionado_por_nombre?: string;
  servicios?: SolicitudServicioDetalle[];
  visita_tecnica?: VisitaTecnica;
  total_servicios?: number;
  monto_total?: number;
}

export interface SolicitudServicioDetalle {
  detalle_id: number;
  solicitud_id: number;
  servicio_id: number;
  cantidad: number;
  precio_unitario?: number;
  observaciones?: string;
  // Campos adicionales para joins
  servicio_nombre?: string;
  servicio_descripcion?: string;
  subtotal?: number;
}

export interface CreateSolicitudServicioRequest {
  cliente_id: number;
  direccion: string;
  sucursal_id: number;
  descripcion_problema?: string;
  recepcionado_por: number;
  fecha_programada?: string;
  estado_solicitud?: EstadoSolicitud;
  observaciones?: string;
  ciudad_id?: number;
  tipo_atencion?: TipoAtencion;
  servicios?: Array<{
    servicio_id: number;
    cantidad?: number;
    precio_unitario?: number;
    observaciones?: string;
  }>;
}

// ===== RECEPCIÓN DE EQUIPOS =====
export interface RecepcionEquipo {
  recepcion_id: number;
  fecha_recepcion: string;
  usuario_id: number;
  sucursal_id: number;
  estado_recepcion: EstadoRecepcion;
  observaciones?: string;
  nro_recepcion?: string;
  solicitud_id?: number;
  // Campos adicionales para joins
  usuario_nombre?: string;
  sucursal_nombre?: string;
  cliente_nombre?: string;
  equipos?: RecepcionEquipoDetalle[];
  total_equipos?: number;
  diagnostico?: Diagnostico;
  salida_equipo?: SalidaEquipo;
}

export interface RecepcionEquipoDetalle {
  detalle_id: number;
  recepcion_id: number;
  equipo_id: number;
  cantidad: number;
  observaciones?: string;
  // Campos adicionales para joins
  equipo_numero_serie?: string;
  tipo_equipo_nombre?: string;
  equipo_estado?: string;
}

export interface CreateRecepcionEquipoRequest {
  usuario_id: number;
  sucursal_id: number;
  estado_recepcion?: EstadoRecepcion;
  observaciones?: string;
  solicitud_id?: number;
  equipos: Array<{
    equipo_id: number;
    cantidad?: number;
    observaciones?: string;
  }>;
}

// ===== DIAGNÓSTICOS =====
export interface Diagnostico {
  diagnostico_id: number;
  recepcion_id?: number;
  fecha_diagnostico: string;
  tecnico_id: number;
  observacion: string;
  estado_diagnostico: EstadoDiagnostico;
  visita_tecnica_id?: number;
  tipo_diag_id: number;
  motivo?: string;
  // Campos adicionales para joins
  tecnico_nombre?: string;
  tipo_diagnostico_nombre?: string;
  equipos?: DiagnosticoDetalle[];
  presupuesto?: PresupuestoServicio;
  total_equipos?: number;
}

export interface DiagnosticoDetalle {
  detalle_id: number;
  diagnostico_id: number;
  equipo_id: number;
  observacion?: string;
  cantidad: number;
  // Campos adicionales para joins
  equipo_numero_serie?: string;
  tipo_equipo_nombre?: string;
}

export interface CreateDiagnosticoRequest {
  recepcion_id?: number;
  tecnico_id: number;
  observacion: string;
  estado_diagnostico?: EstadoDiagnostico;
  visita_tecnica_id?: number;
  tipo_diag_id: number;
  motivo?: string;
  equipos: Array<{
    equipo_id: number;
    observacion?: string;
    cantidad?: number;
  }>;
}

// ===== PRESUPUESTOS DE SERVICIOS =====
export interface PresupuestoServicio {
  presu_serv_id: number;
  fecha_presupuesto: string;
  estado: EstadoPresupuestoServicio;
  monto_presu_ser: number;
  observaciones?: string;
  descuento_id?: number;
  usuario_id?: number;
  sucursal_id?: number;
  promocion_id?: number;
  nro_presupuesto?: string;
  diagnostico_id?: number;
  cliente_id?: number;
  valido_desde?: string;
  valido_hasta?: string;
  tipo_presu: TipoPresupuestoServicio;
  // Campos adicionales para joins
  usuario_nombre?: string;
  sucursal_nombre?: string;
  cliente_nombre?: string;
  servicios?: PresupuestoServicioDetalle[];
  productos?: PresupuestoServicioProductoDetalle[];
  total_servicios?: number;
  total_productos?: number;
  dias_validez?: number;
  estado_vencimiento?: 'vigente' | 'por_vencer' | 'vencido';
}

export interface PresupuestoServicioDetalle {
  det_pres_serv_id: number;
  presu_serv_id: number;
  servicio_id: number;
  cantidad: number;
  precio_unitario: number;
  // Campos adicionales para joins
  servicio_nombre?: string;
  servicio_descripcion?: string;
  subtotal?: number;
}

export interface PresupuestoServicioProductoDetalle {
  det_pres_prod_id: number;
  presu_serv_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  subtotal?: number;
}

export interface CreatePresupuestoServicioRequest {
  fecha_presupuesto?: string;
  estado?: EstadoPresupuestoServicio;
  monto_presu_ser?: number;
  observaciones?: string;
  descuento_id?: number;
  usuario_id?: number;
  sucursal_id?: number;
  promocion_id?: number;
  diagnostico_id?: number;
  cliente_id?: number;
  valido_desde?: string;
  valido_hasta?: string;
  tipo_presu?: TipoPresupuestoServicio;
  servicios?: Array<{
    servicio_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
  productos?: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}

// ===== ÓRDENES DE SERVICIO =====
export interface OrdenServicio {
  orden_servicio_id: number;
  fecha_solicitud: string;
  usuario_id?: number;
  estado: EstadoOrdenServicio;
  monto_servicio?: number;
  observaciones?: string;
  monto_final?: number;
  tecnico_id?: number;
  presu_serv_id?: number;
  forma_cobro_id?: number;
  fecha_ejecucion?: string;
  impresa: boolean;
  // Campos adicionales para joins
  usuario_nombre?: string;
  tecnico_nombre?: string;
  cliente_nombre?: string;
  servicios?: OrdenServicioDetalle[];
  productos?: OrdenServicioProducto[];
  total_servicios?: number;
  total_productos?: number;
  progreso?: number;
  dias_restantes?: number;
}

export interface OrdenServicioDetalle {
  serv_deta_id: number;
  orden_servicio_id: number;
  servicio_id: number;
  cantidad: number;
  precio_unitario?: number;
  // Campos adicionales para joins
  servicio_nombre?: string;
  servicio_descripcion?: string;
  subtotal?: number;
}

export interface OrdenServicioProducto {
  or_ser_prod_id: number;
  orden_servicio_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario?: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  subtotal?: number;
}

export interface CreateOrdenServicioRequest {
  fecha_solicitud?: string;
  usuario_id?: number;
  estado?: EstadoOrdenServicio;
  monto_servicio?: number;
  observaciones?: string;
  monto_final?: number;
  tecnico_id?: number;
  presu_serv_id?: number;
  forma_cobro_id?: number;
  fecha_ejecucion?: string;
  servicios?: Array<{
    servicio_id: number;
    cantidad: number;
    precio_unitario?: number;
  }>;
  productos?: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario?: number;
  }>;
}

// ===== RETIRO DE EQUIPOS =====
export interface SalidaEquipo {
  salida_id: number;
  recepcion_id: number;
  fecha_salida: string;
  entregado_por: number;
  retirado_por: string;
  documento_entrega?: string;
  observaciones?: string;
  // Campos adicionales para joins
  entregado_por_nombre?: string;
  cliente_nombre?: string;
  equipos?: RecepcionEquipoDetalle[];
  total_equipos?: number;
}

export interface CreateSalidaEquipoRequest {
  recepcion_id: number;
  entregado_por: number;
  retirado_por: string;
  documento_entrega?: string;
  observaciones?: string;
}

// ===== RECLAMOS =====
export interface Reclamo {
  reclamo_id: number;
  cliente_id: number;
  orden_servicio_id?: number;
  fecha_reclamo: string;
  recibido_por: number;
  gestionado_por?: number;
  descripcion: string;
  resolucion?: string;
  fecha_resolucion?: string;
  observaciones?: string;
  estado: EstadoReclamo;
  // Campos adicionales para joins
  cliente_nombre?: string;
  cliente_telefono?: string;
  recibido_por_nombre?: string;
  gestionado_por_nombre?: string;
  orden_servicio_nro?: string;
  dias_resolucion?: number;
  estado_display?: string;
}

export interface CreateReclamoRequest {
  cliente_id: number;
  orden_servicio_id?: number;
  recibido_por: number;
  gestionado_por?: number;
  descripcion: string;
  resolucion?: string;
  fecha_resolucion?: string;
  observaciones?: string;
  estado?: EstadoReclamo;
}

// ===== VISITAS TÉCNICAS =====
export interface VisitaTecnica {
  visita_id: number;
  solicitud_id: number;
  fecha_visita: string;
  creado_por: number;
  tecnico_id: number;
  estado_visita: EstadoVisita;
  sucursal_id: number;
  fecha_creacion: string;
  nro_visita?: string;
  motivo_estado?: string;
  // Campos adicionales para joins
  creado_por_nombre?: string;
  tecnico_nombre?: string;
  sucursal_nombre?: string;
  cliente_nombre?: string;
  cliente_direccion?: string;
  diagnostico?: Diagnostico;
}

export interface CreateVisitaTecnicaRequest {
  solicitud_id: number;
  fecha_visita: string;
  creado_por: number;
  tecnico_id: number;
  estado_visita?: EstadoVisita;
  sucursal_id: number;
  motivo_estado?: string;
}

// ===== TIPOS DE RESPUESTA =====
export interface ServiciosTecnicosApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ===== TIPOS DE VALIDACIÓN =====
export interface ServiciosTecnicosValidationError {
  field: string;
  message: string;
}

export interface ServiciosTecnicosValidationResult {
  valid: boolean;
  errors: ServiciosTecnicosValidationError[];
}

// ===== TIPOS DE FILTROS =====
export interface FiltrosSolicitudesServicio {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado_solicitud?: EstadoSolicitud;
  cliente_id?: number;
  sucursal_id?: number;
  tecnico_id?: number;
  tipo_atencion?: TipoAtencion;
  ciudad_id?: number;
}

export interface FiltrosRecepcionEquipos {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado_recepcion?: EstadoRecepcion;
  sucursal_id?: number;
  usuario_id?: number;
  cliente_id?: number;
}

export interface FiltrosDiagnosticos {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado_diagnostico?: EstadoDiagnostico;
  tecnico_id?: number;
  tipo_diag_id?: number;
  recepcion_id?: number;
}

export interface FiltrosPresupuestosServicio {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoPresupuestoServicio;
  usuario_id?: number;
  sucursal_id?: number;
  tipo_presu?: TipoPresupuestoServicio;
  diagnostico_id?: number;
}

export interface FiltrosOrdenesServicio {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoOrdenServicio;
  tecnico_id?: number;
  usuario_id?: number;
  cliente_id?: number;
  sucursal_id?: number;
}

export interface FiltrosReclamos {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoReclamo;
  cliente_id?: number;
  recibido_por?: number;
  gestionado_por?: number;
}

// ===== TIPOS DE ESTADÍSTICAS =====
export interface ServiciosTecnicosStats {
  total_solicitudes: number;
  total_recepciones: number;
  total_diagnosticos: number;
  total_presupuestos: number;
  total_ordenes: number;
  total_reclamos: number;
  solicitudes_pendientes: number;
  recepciones_pendientes: number;
  diagnosticos_pendientes: number;
  presupuestos_pendientes: number;
  ordenes_pendientes: number;
  reclamos_pendientes: number;
  monto_total_presupuestos: number;
  monto_total_ordenes: number;
  tiempo_promedio_resolucion: number;
  satisfaccion_cliente: number;
}

// ===== TIPOS DE INFORMES =====
export interface InformeServiciosTecnicos {
  periodo: {
    desde: string;
    hasta: string;
  };
  resumen: {
    total_solicitudes: number;
    total_recepciones: number;
    total_diagnosticos: number;
    total_presupuestos: number;
    total_ordenes: number;
    total_reclamos: number;
    monto_total_presupuestos: number;
    monto_total_ordenes: number;
    tiempo_promedio_resolucion: number;
  };
  por_estado: Array<{
    estado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  por_tecnico: Array<{
    tecnico_id: number;
    tecnico_nombre: string;
    total_servicios: number;
    monto_total: number;
    porcentaje: number;
  }>;
  por_sucursal: Array<{
    sucursal_id: number;
    sucursal_nombre: string;
    total_servicios: number;
    monto_total: number;
    porcentaje: number;
  }>;
  tendencias: {
    solicitudes_mensuales: Array<{
      mes: string;
      cantidad: number;
      tendencia: 'up' | 'down' | 'stable';
    }>;
    monto_mensual: Array<{
      mes: string;
      monto: number;
      tendencia: 'up' | 'down' | 'stable';
    }>;
  };
}

export interface FiltrosInformeServicios {
  fecha_inicio: string;
  fecha_fin: string;
  sucursal_id: number;
  tecnico_id: number;
  cliente_id: number;
  tipo_servicio_id: number;
  estado: string;
  tipo_periodo?: string;
}
