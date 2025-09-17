import { 
  ComprasValidationResult, 
  ComprasValidationError,
  CreatePedidoCompraRequest,
  CreatePresupuestoProveedorRequest,
  CreateOrdenCompraRequest,
  CreateCompraRequest,
  EstadoCompra,
  EstadoPedidoCompra,
  EstadoOrdenCompra,
  EstadoPresupuesto
} from '@/lib/types/compras';

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
  today.setHours(23, 59, 59, 999); // Fin del día actual
  return date <= today;
}

/**
 * Valida que una fecha no sea pasada
 */
export function isNotPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Inicio del día actual
  return date >= today;
}

/**
 * Valida formato de número de comprobante
 */
export function isValidComprobante(comprobante: string): boolean {
  const comprobanteRegex = /^[A-Z0-9-]{3,50}$/;
  return comprobanteRegex.test(comprobante);
}

// ===== VALIDACIONES DE PEDIDOS DE COMPRA =====

export function validatePedidoCompraData(data: CreatePedidoCompraRequest): ComprasValidationResult {
  const errors: ComprasValidationError[] = [];

  if (data.fecha_pedido && !isValidDate(data.fecha_pedido)) {
    errors.push({ 
      field: 'fecha_pedido', 
      message: 'La fecha del pedido no es válida' 
    });
  }

  if (data.fecha_pedido && !isNotFutureDate(data.fecha_pedido)) {
    errors.push({ 
      field: 'fecha_pedido', 
      message: 'La fecha del pedido no puede ser futura' 
    });
  }

  if (data.estado && !['pendiente', 'procesado', 'cancelado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, procesado o cancelado' 
    });
  }

  if (data.nro_comprobante && !isValidComprobante(data.nro_comprobante)) {
    errors.push({ 
      field: 'nro_comprobante', 
      message: 'El formato del número de comprobante no es válido' 
    });
  }

  if (data.proveedores && data.proveedores.length === 0) {
    errors.push({ 
      field: 'proveedores', 
      message: 'Debe seleccionar al menos un proveedor' 
    });
  }

  if (data.items && data.items.length === 0) {
    errors.push({ 
      field: 'items', 
      message: 'Debe agregar al menos un producto' 
    });
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!isPositiveNumber(item.producto_id)) {
        errors.push({ 
          field: `items[${index}].producto_id`, 
          message: 'El ID del producto debe ser un número positivo' 
        });
      }
      if (!isPositiveNumber(item.cantidad)) {
        errors.push({ 
          field: `items[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
      if (!isNonNegativeNumber(item.precio_unitario)) {
        errors.push({ 
          field: `items[${index}].precio_unitario`, 
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

// ===== VALIDACIONES DE PRESUPUESTOS PROVEEDOR =====

export function validatePresupuestoProveedorData(data: CreatePresupuestoProveedorRequest): ComprasValidationResult {
  const errors: ComprasValidationError[] = [];

  if (!data.proveedor_id || !isPositiveNumber(data.proveedor_id)) {
    errors.push({ 
      field: 'proveedor_id', 
      message: 'El proveedor es requerido' 
    });
  }

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

  if (data.estado && !['nuevo', 'pendiente', 'aprobado', 'rechazado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: nuevo, pendiente, aprobado o rechazado' 
    });
  }

  if (data.monto_presu_prov !== undefined && !isNonNegativeNumber(data.monto_presu_prov)) {
    errors.push({ 
      field: 'monto_presu_prov', 
      message: 'El monto del presupuesto debe ser un número no negativo' 
    });
  }

  if (data.nro_comprobante && !isValidComprobante(data.nro_comprobante)) {
    errors.push({ 
      field: 'nro_comprobante', 
      message: 'El formato del número de comprobante no es válido' 
    });
  }

  if (!data.items || data.items.length === 0) {
    errors.push({ 
      field: 'items', 
      message: 'Debe agregar al menos un producto' 
    });
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!isPositiveNumber(item.producto_id)) {
        errors.push({ 
          field: `items[${index}].producto_id`, 
          message: 'El ID del producto debe ser un número positivo' 
        });
      }
      if (!isPositiveNumber(item.cantidad)) {
        errors.push({ 
          field: `items[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
      if (!isNonNegativeNumber(item.precio_unitario)) {
        errors.push({ 
          field: `items[${index}].precio_unitario`, 
          message: 'El precio unitario debe ser un número no negativo' 
        });
      }
    });
  }

  if (data.dias_validez !== undefined && (!isPositiveNumber(data.dias_validez) || data.dias_validez > 365)) {
    errors.push({ 
      field: 'dias_validez', 
      message: 'Los días de validez deben ser entre 1 y 365' 
    });
  }

  if (data.prioridad && !['alta', 'media', 'baja'].includes(data.prioridad)) {
    errors.push({ 
      field: 'prioridad', 
      message: 'La prioridad debe ser: alta, media o baja' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE ÓRDENES DE COMPRA =====

export function validateOrdenCompraData(data: CreateOrdenCompraRequest): ComprasValidationResult {
  const errors: ComprasValidationError[] = [];

  if (!data.proveedor_id || !isPositiveNumber(data.proveedor_id)) {
    errors.push({ 
      field: 'proveedor_id', 
      message: 'El proveedor es requerido' 
    });
  }

  if (data.fecha_orden && !isValidDate(data.fecha_orden)) {
    errors.push({ 
      field: 'fecha_orden', 
      message: 'La fecha de la orden no es válida' 
    });
  }

  if (data.fecha_orden && !isNotFutureDate(data.fecha_orden)) {
    errors.push({ 
      field: 'fecha_orden', 
      message: 'La fecha de la orden no puede ser futura' 
    });
  }

  if (data.estado && !['pendiente', 'aprobada', 'rechazada', 'cancelada'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, aprobada, rechazada o cancelada' 
    });
  }

  if (data.monto_oc !== undefined && !isNonNegativeNumber(data.monto_oc)) {
    errors.push({ 
      field: 'monto_oc', 
      message: 'El monto de la orden debe ser un número no negativo' 
    });
  }

  if (data.nro_comprobante && !isValidComprobante(data.nro_comprobante)) {
    errors.push({ 
      field: 'nro_comprobante', 
      message: 'El formato del número de comprobante no es válido' 
    });
  }

  if (!data.items || data.items.length === 0) {
    errors.push({ 
      field: 'items', 
      message: 'Debe agregar al menos un producto' 
    });
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!isPositiveNumber(item.producto_id)) {
        errors.push({ 
          field: `items[${index}].producto_id`, 
          message: 'El ID del producto debe ser un número positivo' 
        });
      }
      if (!isPositiveNumber(item.cantidad)) {
        errors.push({ 
          field: `items[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
      if (!isNonNegativeNumber(item.precio_unitario)) {
        errors.push({ 
          field: `items[${index}].precio_unitario`, 
          message: 'El precio unitario debe ser un número no negativo' 
        });
      }
    });
  }

  if (data.fecha_entrega && !isValidDate(data.fecha_entrega)) {
    errors.push({ 
      field: 'fecha_entrega', 
      message: 'La fecha de entrega no es válida' 
    });
  }

  if (data.fecha_entrega && data.fecha_orden) {
    const fechaOrden = new Date(data.fecha_orden);
    const fechaEntrega = new Date(data.fecha_entrega);
    if (fechaEntrega <= fechaOrden) {
      errors.push({ 
        field: 'fecha_entrega', 
        message: 'La fecha de entrega debe ser posterior a la fecha de orden' 
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE COMPRAS =====

export function validateCompraData(data: CreateCompraRequest): ComprasValidationResult {
  const errors: ComprasValidationError[] = [];

  if (!data.proveedor_id || !isPositiveNumber(data.proveedor_id)) {
    errors.push({ 
      field: 'proveedor_id', 
      message: 'El proveedor es requerido' 
    });
  }

  if (!data.sucursal_id || !isPositiveNumber(data.sucursal_id)) {
    errors.push({ 
      field: 'sucursal_id', 
      message: 'La sucursal es requerida' 
    });
  }

  if (!data.tipo_doc_id || !isPositiveNumber(data.tipo_doc_id)) {
    errors.push({ 
      field: 'tipo_doc_id', 
      message: 'El tipo de documento es requerido' 
    });
  }

  if (!data.monto_compra || !isPositiveNumber(data.monto_compra)) {
    errors.push({ 
      field: 'monto_compra', 
      message: 'El monto de la compra debe ser un número positivo' 
    });
  }

  if (data.fecha_compra && !isValidDate(data.fecha_compra)) {
    errors.push({ 
      field: 'fecha_compra', 
      message: 'La fecha de la compra no es válida' 
    });
  }

  if (data.fecha_compra && !isNotFutureDate(data.fecha_compra)) {
    errors.push({ 
      field: 'fecha_compra', 
      message: 'La fecha de la compra no puede ser futura' 
    });
  }

  if (data.estado && !['pendiente', 'en_progreso', 'completada', 'cancelada'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, en_progreso, completada o cancelada' 
    });
  }

  if (data.nro_factura && !isValidComprobante(data.nro_factura)) {
    errors.push({ 
      field: 'nro_factura', 
      message: 'El formato del número de factura no es válido' 
    });
  }

  if (data.fecha_comprobante && !isValidDate(data.fecha_comprobante)) {
    errors.push({ 
      field: 'fecha_comprobante', 
      message: 'La fecha del comprobante no es válida' 
    });
  }

  if (data.fecha_comprobante && !isNotFutureDate(data.fecha_comprobante)) {
    errors.push({ 
      field: 'fecha_comprobante', 
      message: 'La fecha del comprobante no puede ser futura' 
    });
  }

  if (!data.items || data.items.length === 0) {
    errors.push({ 
      field: 'items', 
      message: 'Debe agregar al menos un producto' 
    });
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!isPositiveNumber(item.producto_id)) {
        errors.push({ 
          field: `items[${index}].producto_id`, 
          message: 'El ID del producto debe ser un número positivo' 
        });
      }
      if (!isPositiveNumber(item.cantidad)) {
        errors.push({ 
          field: `items[${index}].cantidad`, 
          message: 'La cantidad debe ser un número positivo' 
        });
      }
      if (!isNonNegativeNumber(item.precio_unitario)) {
        errors.push({ 
          field: `items[${index}].precio_unitario`, 
          message: 'El precio unitario debe ser un número no negativo' 
        });
      }
    });
  }

  // Validar montos de impuestos
  if (data.monto_gravada_5 !== undefined && !isNonNegativeNumber(data.monto_gravada_5)) {
    errors.push({ 
      field: 'monto_gravada_5', 
      message: 'El monto gravado al 5% debe ser un número no negativo' 
    });
  }

  if (data.monto_gravada_10 !== undefined && !isNonNegativeNumber(data.monto_gravada_10)) {
    errors.push({ 
      field: 'monto_gravada_10', 
      message: 'El monto gravado al 10% debe ser un número no negativo' 
    });
  }

  if (data.monto_exenta !== undefined && !isNonNegativeNumber(data.monto_exenta)) {
    errors.push({ 
      field: 'monto_exenta', 
      message: 'El monto exento debe ser un número no negativo' 
    });
  }

  if (data.monto_iva !== undefined && !isNonNegativeNumber(data.monto_iva)) {
    errors.push({ 
      field: 'monto_iva', 
      message: 'El monto de IVA debe ser un número no negativo' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== UTILIDADES DE BÚSQUEDA =====

/**
 * Construye la cláusula WHERE para búsquedas
 */
export function buildSearchWhereClause(
  searchFields: string[], 
  searchTerm: string, 
  additionalConditions: string[] = []
): { whereClause: string; params: any[] } {
  const conditions: string[] = [...additionalConditions];
  const params: any[] = [];
  let paramCount = 0;

  if (searchTerm) {
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
  defaultSort: string = 'fecha_creacion'
): string {
  const validSortFields = [
    'fecha_pedido', 'fecha_presupuesto', 'fecha_orden', 'fecha_compra',
    'estado', 'monto_compra', 'monto_oc', 'monto_presu_prov',
    'proveedor_nombre', 'usuario_nombre', 'nro_comprobante',
    'created_at', 'updated_at'
  ];
  
  const field = validSortFields.includes(sortBy) ? sortBy : defaultSort;
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  return `ORDER BY ${field} ${order}`;
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

// ===== UTILIDADES DE FORMATEO =====

/**
 * Formatea un número como moneda paraguaya
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formatea un número como moneda costarricense
 */
export function formatCurrencyCRC(amount: number): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calcula el progreso de una orden
 */
export function calculateProgress(fechaInicio: string, fechaEntrega: string): number {
  const inicio = new Date(fechaInicio);
  const entrega = new Date(fechaEntrega);
  const hoy = new Date();
  
  const totalDias = Math.ceil((entrega.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  const diasTranscurridos = Math.ceil((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasTranscurridos <= 0) return 0;
  if (diasTranscurridos >= totalDias) return 100;
  
  return Math.round((diasTranscurridos / totalDias) * 100);
}

/**
 * Calcula los días restantes
 */
export function calculateDaysRemaining(fechaEntrega: string): number {
  const entrega = new Date(fechaEntrega);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  entrega.setHours(0, 0, 0, 0);
  
  const diffTime = entrega.getTime() - hoy.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina la prioridad basada en días restantes
 */
export function determinePriority(diasRestantes: number): 'alta' | 'media' | 'baja' {
  if (diasRestantes < 0) return 'alta'; // Vencida
  if (diasRestantes <= 3) return 'alta';
  if (diasRestantes <= 7) return 'media';
  return 'baja';
}

/**
 * Genera número de comprobante
 */
export function generateComprobanteNumber(prefix: string, id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `${prefix}-${paddedId}-${year}`;
}

/**
 * Genera número de tracking
 */
export function generateTrackingNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(3, '0');
  return `TRK-${paddedId}-${year}`;
}

// ===== UTILIDADES DE VALIDACIÓN DE ESTADOS =====

/**
 * Verifica si un pedido puede ser procesado
 */
export function canProcessPedido(estado: EstadoPedidoCompra): boolean {
  return estado === 'pendiente';
}

/**
 * Verifica si un presupuesto puede ser aprobado
 */
export function canApprovePresupuesto(estado: EstadoPresupuesto): boolean {
  return estado === 'pendiente' || estado === 'nuevo';
}

/**
 * Verifica si una orden puede ser aprobada
 */
export function canApproveOrden(estado: EstadoOrdenCompra): boolean {
  return estado === 'pendiente';
}

/**
 * Verifica si una compra puede ser completada
 */
export function canCompleteCompra(estado: EstadoCompra): boolean {
  return estado === 'pendiente' || estado === 'en_progreso';
}

/**
 * Sanitiza datos sensibles para logs
 */
export function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  delete sanitized.observaciones;
  delete sanitized.comentario;
  return sanitized;
}
