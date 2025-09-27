import { 
  ServiciosTecnicosValidationResult, 
  ServiciosTecnicosValidationError,
  CreateSolicitudServicioRequest,
  CreateRecepcionEquipoRequest,
  CreateDiagnosticoRequest,
  CreatePresupuestoServicioRequest,
  CreateOrdenServicioRequest,
  CreateSalidaEquipoRequest,
  CreateReclamoRequest,
  CreateVisitaTecnicaRequest,
  EstadoSolicitud,
  EstadoRecepcion,
  EstadoDiagnostico,
  EstadoPresupuestoServicio,
  EstadoOrdenServicio,
  EstadoReclamo,
  EstadoVisita,
  TipoAtencion,
  TipoPresupuestoServicio
} from '@/lib/types/servicios-tecnicos';

// ===== VALIDACIONES GENERALES =====

/**
 * Valida que un número sea positivo
 */
export function isPositiveNumber(value: number): boolean {
  return value > 0;
}

/**
 * Valida que un número sea no negativo
 */
export function isNonNegativeNumber(value: number): boolean {
  return value >= 0;
}

/**
 * Valida formato de fecha
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valida que una fecha no sea futura
 */
export function isNotFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

/**
 * Valida que una fecha no sea pasada
 */
export function isNotPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Valida formato de número de solicitud
 */
export function isValidSolicitudNumber(solicitud: string): boolean {
  const solicitudRegex = /^[A-Z0-9-]{3,50}$/;
  return solicitudRegex.test(solicitud);
}

/**
 * Valida formato de teléfono paraguayo
 */
export function isValidParaguayanPhone(phone: string): boolean {
  const phoneRegex = /^(\+595|0)?[9][0-9]{8}$/;
  return phoneRegex.test(phone);
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== VALIDACIONES DE SOLICITUDES DE SERVICIO =====

export function validateSolicitudServicioData(data: CreateSolicitudServicioRequest): ServiciosTecnicosValidationResult {
  const errors: ServiciosTecnicosValidationError[] = [];

  if (!data.cliente_id || !isPositiveNumber(data.cliente_id)) {
    errors.push({ 
      field: 'cliente_id', 
      message: 'El cliente es requerido' 
    });
  }

  if (!data.direccion || data.direccion.trim().length === 0) {
    errors.push({ 
      field: 'direccion', 
      message: 'La dirección es requerida' 
    });
  }

  if (!data.sucursal_id || !isPositiveNumber(data.sucursal_id)) {
    errors.push({ 
      field: 'sucursal_id', 
      message: 'La sucursal es requerida' 
    });
  }

  if (!data.recepcionado_por || !isPositiveNumber(data.recepcionado_por)) {
    errors.push({ 
      field: 'recepcionado_por', 
      message: 'El usuario que recibe la solicitud es requerido' 
    });
  }

  if (data.fecha_programada && !isValidDate(data.fecha_programada)) {
    errors.push({ 
      field: 'fecha_programada', 
      message: 'La fecha programada no es válida' 
    });
  }

  if (data.fecha_programada && !isNotPastDate(data.fecha_programada)) {
    errors.push({ 
      field: 'fecha_programada', 
      message: 'La fecha programada no puede ser pasada' 
    });
  }

  if (data.estado_solicitud && !['Pendiente', 'Asignada', 'En proceso', 'Finalizada', 'Cancelada'].includes(data.estado_solicitud)) {
    errors.push({ 
      field: 'estado_solicitud', 
      message: 'El estado debe ser: Pendiente, Asignada, En proceso, Finalizada o Cancelada' 
    });
  }

  if (data.tipo_atencion && !['Visita', 'Recepcion'].includes(data.tipo_atencion)) {
    errors.push({ 
      field: 'tipo_atencion', 
      message: 'El tipo de atención debe ser: Visita o Recepcion' 
    });
  }

  if (data.servicios && data.servicios.length > 0) {
    data.servicios.forEach((servicio, index) => {
      if (!isPositiveNumber(servicio.servicio_id)) {
        errors.push({ 
          field: `servicios[${index}].servicio_id`, 
          message: 'El ID del servicio debe ser un número positivo' 
        });
      }
      if (servicio.cantidad !== undefined && !isPositiveNumber(servicio.cantidad)) {
        errors.push({ 
          field: `servicios[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
      if (servicio.precio_unitario !== undefined && !isNonNegativeNumber(servicio.precio_unitario)) {
        errors.push({ 
          field: `servicios[${index}].precio_unitario`, 
          message: 'El precio unitario debe ser un número no negativo' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE RECEPCIÓN DE EQUIPOS =====

export function validateRecepcionEquipoData(data: CreateRecepcionEquipoRequest): ServiciosTecnicosValidationResult {
  const errors: ServiciosTecnicosValidationError[] = [];

  if (!data.usuario_id || !isPositiveNumber(data.usuario_id)) {
    errors.push({ 
      field: 'usuario_id', 
      message: 'El usuario es requerido' 
    });
  }

  if (!data.sucursal_id || !isPositiveNumber(data.sucursal_id)) {
    errors.push({ 
      field: 'sucursal_id', 
      message: 'La sucursal es requerida' 
    });
  }

  if (data.estado_recepcion && !['En revisión', 'Cancelada', 'Recepcionada'].includes(data.estado_recepcion)) {
    errors.push({ 
      field: 'estado_recepcion', 
      message: 'El estado debe ser: En revisión, Cancelada o Recepcionada' 
    });
  }

  if (!data.equipos || data.equipos.length === 0) {
    errors.push({ 
      field: 'equipos', 
      message: 'Debe agregar al menos un equipo' 
    });
  }

  if (data.equipos && data.equipos.length > 0) {
    data.equipos.forEach((equipo, index) => {
      if (!isPositiveNumber(equipo.equipo_id)) {
        errors.push({ 
          field: `equipos[${index}].equipo_id`, 
          message: 'El ID del equipo debe ser un número positivo' 
        });
      }
      if (equipo.cantidad !== undefined && !isPositiveNumber(equipo.cantidad)) {
        errors.push({ 
          field: `equipos[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE DIAGNÓSTICOS =====

export function validateDiagnosticoData(data: CreateDiagnosticoRequest): ServiciosTecnicosValidationResult {
  const errors: ServiciosTecnicosValidationError[] = [];

  if (!data.tecnico_id || !isPositiveNumber(data.tecnico_id)) {
    errors.push({ 
      field: 'tecnico_id', 
      message: 'El técnico es requerido' 
    });
  }

  if (!data.observacion || data.observacion.trim().length === 0) {
    errors.push({ 
      field: 'observacion', 
      message: 'La observación es requerida' 
    });
  }

  if (!data.tipo_diag_id || !isPositiveNumber(data.tipo_diag_id)) {
    errors.push({ 
      field: 'tipo_diag_id', 
      message: 'El tipo de diagnóstico es requerido' 
    });
  }

  if (data.estado_diagnostico && !['Pendiente', 'En proceso', 'Completado', 'Rechazado', 'Cancelado'].includes(data.estado_diagnostico)) {
    errors.push({ 
      field: 'estado_diagnostico', 
      message: 'El estado debe ser: Pendiente, En proceso, Completado, Rechazado o Cancelado' 
    });
  }

  if (!data.equipos || data.equipos.length === 0) {
    errors.push({ 
      field: 'equipos', 
      message: 'Debe agregar al menos un equipo' 
    });
  }

  if (data.equipos && data.equipos.length > 0) {
    data.equipos.forEach((equipo, index) => {
      if (!isPositiveNumber(equipo.equipo_id)) {
        errors.push({ 
          field: `equipos[${index}].equipo_id`, 
          message: 'El ID del equipo debe ser un número positivo' 
        });
      }
      if (equipo.cantidad !== undefined && !isPositiveNumber(equipo.cantidad)) {
        errors.push({ 
          field: `equipos[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE PRESUPUESTOS DE SERVICIOS =====

export function validatePresupuestoServicioData(data: CreatePresupuestoServicioRequest): ServiciosTecnicosValidationResult {
  const errors: ServiciosTecnicosValidationError[] = [];

  if (data.fecha_presupuesto && !isValidDate(data.fecha_presupuesto)) {
    errors.push({ 
      field: 'fecha_presupuesto', 
      message: 'La fecha del presupuesto no es válida' 
    });
  }

  if (data.fecha_presupuesto && !isNotFutureDate(data.fecha_presupuesto)) {
    errors.push({ 
      field: 'fecha_presupuesto', 
      message: 'La fecha del presupuesto no puede ser futura' 
    });
  }

  if (data.estado && !['pendiente', 'aprobado', 'rechazado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, aprobado o rechazado' 
    });
  }

  if (data.monto_presu_ser !== undefined && !isNonNegativeNumber(data.monto_presu_ser)) {
    errors.push({ 
      field: 'monto_presu_ser', 
      message: 'El monto del presupuesto debe ser un número no negativo' 
    });
  }

  if (data.tipo_presu && !['con_diagnostico', 'sin_diagnostico'].includes(data.tipo_presu)) {
    errors.push({ 
      field: 'tipo_presu', 
      message: 'El tipo de presupuesto debe ser: con_diagnostico o sin_diagnostico' 
    });
  }

  if (data.valido_desde && data.valido_hasta) {
    const fechaDesde = new Date(data.valido_desde);
    const fechaHasta = new Date(data.valido_hasta);
    if (fechaHasta <= fechaDesde) {
      errors.push({ 
        field: 'valido_hasta', 
        message: 'La fecha de validez hasta debe ser posterior a la fecha desde' 
      });
    }
  }

  if (data.servicios && data.servicios.length > 0) {
    data.servicios.forEach((servicio, index) => {
      if (!isPositiveNumber(servicio.servicio_id)) {
        errors.push({ 
          field: `servicios[${index}].servicio_id`, 
          message: 'El ID del servicio debe ser un número positivo' 
        });
      }
      if (!isPositiveNumber(servicio.cantidad)) {
        errors.push({ 
          field: `servicios[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
      if (!isNonNegativeNumber(servicio.precio_unitario)) {
        errors.push({ 
          field: `servicios[${index}].precio_unitario`, 
          message: 'El precio unitario debe ser un número no negativo' 
        });
      }
    });
  }

  if (data.productos && data.productos.length > 0) {
    data.productos.forEach((producto, index) => {
      if (!isPositiveNumber(producto.producto_id)) {
        errors.push({ 
          field: `productos[${index}].producto_id`, 
          message: 'El ID del producto debe ser un número positivo' 
        });
      }
      if (!isPositiveNumber(producto.cantidad)) {
        errors.push({ 
          field: `productos[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
      if (!isNonNegativeNumber(producto.precio_unitario)) {
        errors.push({ 
          field: `productos[${index}].precio_unitario`, 
          message: 'El precio unitario debe ser un número no negativo' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE ÓRDENES DE SERVICIO =====

export function validateOrdenServicioData(data: CreateOrdenServicioRequest): ServiciosTecnicosValidationResult {
  const errors: ServiciosTecnicosValidationError[] = [];

  if (data.fecha_solicitud && !isValidDate(data.fecha_solicitud)) {
    errors.push({ 
      field: 'fecha_solicitud', 
      message: 'La fecha de solicitud no es válida' 
    });
  }

  if (data.fecha_solicitud && !isNotFutureDate(data.fecha_solicitud)) {
    errors.push({ 
      field: 'fecha_solicitud', 
      message: 'La fecha de solicitud no puede ser futura' 
    });
  }

  if (data.estado && !['pendiente', 'en_proceso', 'completado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, en_proceso o completado' 
    });
  }

  if (data.monto_servicio !== undefined && !isNonNegativeNumber(data.monto_servicio)) {
    errors.push({ 
      field: 'monto_servicio', 
      message: 'El monto del servicio debe ser un número no negativo' 
    });
  }

  if (data.monto_final !== undefined && !isNonNegativeNumber(data.monto_final)) {
    errors.push({ 
      field: 'monto_final', 
      message: 'El monto final debe ser un número no negativo' 
    });
  }

  if (data.fecha_ejecucion && !isValidDate(data.fecha_ejecucion)) {
    errors.push({ 
      field: 'fecha_ejecucion', 
      message: 'La fecha de ejecución no es válida' 
    });
  }

  if (data.servicios && data.servicios.length > 0) {
    data.servicios.forEach((servicio, index) => {
      if (!isPositiveNumber(servicio.servicio_id)) {
        errors.push({ 
          field: `servicios[${index}].servicio_id`, 
          message: 'El ID del servicio debe ser un número positivo' 
        });
      }
      if (!isPositiveNumber(servicio.cantidad)) {
        errors.push({ 
          field: `servicios[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
      if (servicio.precio_unitario !== undefined && !isNonNegativeNumber(servicio.precio_unitario)) {
        errors.push({ 
          field: `servicios[${index}].precio_unitario`, 
          message: 'El precio unitario debe ser un número no negativo' 
        });
      }
    });
  }

  if (data.productos && data.productos.length > 0) {
    data.productos.forEach((producto, index) => {
      if (!isPositiveNumber(producto.producto_id)) {
        errors.push({ 
          field: `productos[${index}].producto_id`, 
          message: 'El ID del producto debe ser un número positivo' 
        });
      }
      if (!isPositiveNumber(producto.cantidad)) {
        errors.push({ 
          field: `productos[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
      if (producto.precio_unitario !== undefined && !isNonNegativeNumber(producto.precio_unitario)) {
        errors.push({ 
          field: `productos[${index}].precio_unitario`, 
          message: 'El precio unitario debe ser un número no negativo' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE SALIDA DE EQUIPOS =====

export function validateSalidaEquipoData(data: CreateSalidaEquipoRequest): ServiciosTecnicosValidationResult {
  const errors: ServiciosTecnicosValidationError[] = [];

  if (!data.recepcion_id || !isPositiveNumber(data.recepcion_id)) {
    errors.push({ 
      field: 'recepcion_id', 
      message: 'La recepción es requerida' 
    });
  }

  if (!data.entregado_por || !isPositiveNumber(data.entregado_por)) {
    errors.push({ 
      field: 'entregado_por', 
      message: 'El usuario que entrega es requerido' 
    });
  }

  if (!data.retirado_por || data.retirado_por.trim().length === 0) {
    errors.push({ 
      field: 'retirado_por', 
      message: 'El nombre de quien retira es requerido' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE RECLAMOS =====

export function validateReclamoData(data: CreateReclamoRequest): ServiciosTecnicosValidationResult {
  const errors: ServiciosTecnicosValidationError[] = [];

  if (!data.cliente_id || !isPositiveNumber(data.cliente_id)) {
    errors.push({ 
      field: 'cliente_id', 
      message: 'El cliente es requerido' 
    });
  }

  if (!data.recibido_por || !isPositiveNumber(data.recibido_por)) {
    errors.push({ 
      field: 'recibido_por', 
      message: 'El usuario que recibe el reclamo es requerido' 
    });
  }

  if (!data.descripcion || data.descripcion.trim().length === 0) {
    errors.push({ 
      field: 'descripcion', 
      message: 'La descripción del reclamo es requerida' 
    });
  }

  if (data.fecha_resolucion && !isValidDate(data.fecha_resolucion)) {
    errors.push({ 
      field: 'fecha_resolucion', 
      message: 'La fecha de resolución no es válida' 
    });
  }

  if (data.estado && !['pendiente', 'en_verificacion', 'resuelto', 'rechazado', 'anulado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, en_verificacion, resuelto, rechazado o anulado' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE VISITAS TÉCNICAS =====

export function validateVisitaTecnicaData(data: CreateVisitaTecnicaRequest): ServiciosTecnicosValidationResult {
  const errors: ServiciosTecnicosValidationError[] = [];

  if (!data.solicitud_id || !isPositiveNumber(data.solicitud_id)) {
    errors.push({ 
      field: 'solicitud_id', 
      message: 'La solicitud es requerida' 
    });
  }

  if (!data.fecha_visita || !isValidDate(data.fecha_visita)) {
    errors.push({ 
      field: 'fecha_visita', 
      message: 'La fecha de visita es requerida y debe ser válida' 
    });
  }

  if (!data.creado_por || !isPositiveNumber(data.creado_por)) {
    errors.push({ 
      field: 'creado_por', 
      message: 'El usuario que crea la visita es requerido' 
    });
  }

  if (!data.tecnico_id || !isPositiveNumber(data.tecnico_id)) {
    errors.push({ 
      field: 'tecnico_id', 
      message: 'El técnico es requerido' 
    });
  }

  if (!data.sucursal_id || !isPositiveNumber(data.sucursal_id)) {
    errors.push({ 
      field: 'sucursal_id', 
      message: 'La sucursal es requerida' 
    });
  }

  if (data.estado_visita && !['Pendiente', 'En proceso', 'Completada', 'Cancelada'].includes(data.estado_visita)) {
    errors.push({ 
      field: 'estado_visita', 
      message: 'El estado debe ser: Pendiente, En proceso, Completada o Cancelada' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== UTILIDADES DE CÁLCULO =====

/**
 * Calcula los días de validez de un presupuesto
 */
export function calculateValidityDays(validoDesde: string, validoHasta: string): number {
  const desde = new Date(validoDesde);
  const hasta = new Date(validoHasta);
  const diffTime = hasta.getTime() - desde.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina el estado de vencimiento de un presupuesto
 */
export function determinePresupuestoExpirationStatus(diasValidez: number): 'vigente' | 'por_vencer' | 'vencido' {
  if (diasValidez < 0) return 'vencido';
  if (diasValidez <= 7) return 'por_vencer';
  return 'vigente';
}

/**
 * Calcula el progreso de una orden de servicio
 */
export function calculateOrdenServicioProgress(estado: EstadoOrdenServicio): number {
  switch (estado) {
    case 'pendiente': return 0;
    case 'en_proceso': return 50;
    case 'completado': return 100;
    default: return 0;
  }
}

/**
 * Calcula los días de resolución de un reclamo
 */
export function calculateReclamoResolutionDays(fechaReclamo: string, fechaResolucion?: string): number {
  const reclamo = new Date(fechaReclamo);
  const resolucion = fechaResolucion ? new Date(fechaResolucion) : new Date();
  const diffTime = resolucion.getTime() - reclamo.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Genera número de solicitud
 */
export async function generateSolicitudNumber(): Promise<string> {
  // Obtener el siguiente ID de la secuencia
  const { pool } = await import('@/lib/db');
  const result = await pool.query('SELECT nextval(\'solicitud_servicio_solicitud_id_seq\') as next_id');
  const nextId = result.rows[0].next_id;
  
  const year = new Date().getFullYear();
  const paddedId = nextId.toString().padStart(4, '0');
  return `SOL-${paddedId}-${year}`;
}

/**
 * Genera número de recepción
 */
export function generateRecepcionNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `REC-${paddedId}-${year}`;
}

/**
 * Genera número de diagnóstico
 */
export function generateDiagnosticoNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `DIAG-${paddedId}-${year}`;
}

/**
 * Genera número de presupuesto de servicio
 */
export function generatePresupuestoServicioNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `PS-${paddedId}-${year}`;
}

/**
 * Genera número de orden de servicio
 */
export function generateOrdenServicioNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `OS-${paddedId}-${year}`;
}

/**
 * Genera número de visita técnica
 */
export function generateVisitaTecnicaNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `VT-${paddedId}-${year}`;
}

/**
 * Genera número de reclamo
 */
export function generateReclamoNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `RECL-${paddedId}-${year}`;
}

/**
 * Formatea moneda paraguaya
 */
export function formatParaguayanCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Valida que una solicitud pueda ser asignada
 */
export function canAssignSolicitud(estado: EstadoSolicitud): boolean {
  return estado === 'Pendiente';
}

/**
 * Valida que una recepción pueda ser procesada
 */
export function canProcessRecepcion(estado: EstadoRecepcion): boolean {
  return estado === 'Recepcionada';
}

/**
 * Valida que un diagnóstico pueda ser completado
 */
export function canCompleteDiagnostico(estado: EstadoDiagnostico): boolean {
  return estado === 'En proceso';
}

/**
 * Valida que un presupuesto pueda ser aprobado
 */
export function canApprovePresupuestoServicio(estado: EstadoPresupuestoServicio): boolean {
  return estado === 'pendiente';
}

/**
 * Valida que una orden pueda ser completada
 */
export function canCompleteOrdenServicio(estado: EstadoOrdenServicio): boolean {
  return estado === 'en_proceso';
}

/**
 * Valida que un reclamo pueda ser resuelto
 */
export function canResolveReclamo(estado: EstadoReclamo): boolean {
  return estado === 'pendiente' || estado === 'en_verificacion';
}

/**
 * Sanitiza datos sensibles para logs
 */
export function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  delete sanitized.observaciones;
  delete sanitized.descripcion_problema;
  delete sanitized.descripcion;
  delete sanitized.motivo;
  return sanitized;
}

/**
 * Construye la cláusula WHERE para búsquedas
 */
export function buildSearchWhereClause(
  searchFields: string[], 
  searchTerm: string, 
  additionalConditions: string[] = [],
  existingParams: any[] = []
): { whereClause: string; params: any[] } {
  const conditions: string[] = [...additionalConditions];
  const params: any[] = [...existingParams];
  let paramCount = existingParams.length;

  if (searchTerm && searchFields.length > 0) {
    const searchConditions = searchFields.map(field => {
      paramCount++;
      params.push(`%${searchTerm}%`);
      return `${field} ILIKE $${paramCount}`;
    });
    conditions.push(`(${searchConditions.join(' OR ')})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : 'WHERE 1=1';
  
  return { whereClause, params };
}

/**
 * Construye la cláusula ORDER BY
 */
export function buildOrderByClause(
  sortBy: string, 
  sortOrder: 'asc' | 'desc', 
  tablePrefix: string = '',
  defaultSort: string = 'fecha_solicitud'
): string {
  const validSortFields = [
    'fecha_solicitud', 'fecha_recepcion', 'fecha_diagnostico', 'fecha_presupuesto',
    'fecha_salida', 'fecha_reclamo', 'fecha_visita',
    'estado_solicitud', 'estado_recepcion', 'estado_diagnostico', 'estado_presupuesto',
    'estado_orden', 'estado_reclamo', 'estado_visita',
    'monto_servicio', 'monto_presu_ser',
    'cliente_nombre', 'tecnico_nombre', 'usuario_nombre',
    'nro_solicitud', 'nro_recepcion', 'nro_presupuesto',
    'nro_orden', 'nro_reclamo', 'nro_visita'
  ];
  
  const field = validSortFields.includes(sortBy) ? sortBy : defaultSort;
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  // Agregar prefijo de tabla si se proporciona
  const prefixedField = tablePrefix ? `${tablePrefix}.${field}` : field;
  
  return `ORDER BY ${prefixedField} ${order}`;
}

/**
 * Construye parámetros de paginación
 */
export function buildPaginationParams(
  page: number, 
  limit: number, 
  offset: number
): { limitParam: number; offsetParam: number } {
  return {
    limitParam: Math.max(1, Math.min(limit, 100)), // Máximo 100 elementos por página
    offsetParam: Math.max(0, offset)
  };
}
