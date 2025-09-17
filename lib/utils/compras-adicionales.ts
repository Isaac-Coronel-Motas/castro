import { 
  ComprasAdicionalesValidationResult, 
  ComprasAdicionalesValidationError,
  CreateRegistroCompraRequest,
  CreateAjusteInventarioRequest,
  CreateNotaCreditoRequest,
  CreateTransferenciaStockRequest,
  EstadoAjusteInventario,
  EstadoTransferencia,
  EstadoNotaCredito,
  TipoOperacionNota,
  TipoMovimientoInventario
} from '@/lib/types/compras-adicionales';

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
 * Valida formato de número de factura
 */
export function isValidFacturaNumber(factura: string): boolean {
  const facturaRegex = /^[A-Z0-9-]{3,50}$/;
  return facturaRegex.test(factura);
}

/**
 * Valida formato de timbrado
 */
export function isValidTimbrado(timbrado: string): boolean {
  const timbradoRegex = /^[0-9]{8}$/;
  return timbradoRegex.test(timbrado);
}

// ===== VALIDACIONES DE REGISTRO DE COMPRAS =====

export function validateRegistroCompraData(data: CreateRegistroCompraRequest): ComprasAdicionalesValidationResult {
  const errors: ComprasAdicionalesValidationError[] = [];

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

  if (data.nro_factura && !isValidFacturaNumber(data.nro_factura)) {
    errors.push({ 
      field: 'nro_factura', 
      message: 'El formato del número de factura no es válido' 
    });
  }

  if (data.timbrado && !isValidTimbrado(data.timbrado)) {
    errors.push({ 
      field: 'timbrado', 
      message: 'El timbrado debe tener 8 dígitos' 
    });
  }

  if (data.fecha_comprobante && !isValidDate(data.fecha_comprobante)) {
    errors.push({ 
      field: 'fecha_comprobante', 
      message: 'La fecha del comprobante no es válida' 
    });
  }

  if (data.fecha_vencimiento && !isValidDate(data.fecha_vencimiento)) {
    errors.push({ 
      field: 'fecha_vencimiento', 
      message: 'La fecha de vencimiento no es válida' 
    });
  }

  if (data.fecha_comprobante && data.fecha_vencimiento) {
    const fechaComprobante = new Date(data.fecha_comprobante);
    const fechaVencimiento = new Date(data.fecha_vencimiento);
    if (fechaVencimiento <= fechaComprobante) {
      errors.push({ 
        field: 'fecha_vencimiento', 
        message: 'La fecha de vencimiento debe ser posterior a la fecha del comprobante' 
      });
    }
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

// ===== VALIDACIONES DE AJUSTES DE INVENTARIO =====

export function validateAjusteInventarioData(data: CreateAjusteInventarioRequest): ComprasAdicionalesValidationResult {
  const errors: ComprasAdicionalesValidationError[] = [];

  if (!data.usuario_id || !isPositiveNumber(data.usuario_id)) {
    errors.push({ 
      field: 'usuario_id', 
      message: 'El usuario es requerido' 
    });
  }

  if (!data.motivo_id || !isPositiveNumber(data.motivo_id)) {
    errors.push({ 
      field: 'motivo_id', 
      message: 'El motivo del ajuste es requerido' 
    });
  }

  if (!data.almacen_id || !isPositiveNumber(data.almacen_id)) {
    errors.push({ 
      field: 'almacen_id', 
      message: 'El almacén es requerido' 
    });
  }

  if (data.estado && !['borrador', 'validado', 'anulado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: borrador, validado o anulado' 
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
      if (item.cantidad_ajustada === 0) {
        errors.push({ 
          field: `items[${index}].cantidad_ajustada`, 
          message: 'La cantidad ajustada no puede ser cero' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE NOTAS DE CRÉDITO/DÉBITO =====

export function validateNotaCreditoData(data: CreateNotaCreditoRequest): ComprasAdicionalesValidationResult {
  const errors: ComprasAdicionalesValidationError[] = [];

  if (!data.tipo_operacion || !['credito', 'debito'].includes(data.tipo_operacion)) {
    errors.push({ 
      field: 'tipo_operacion', 
      message: 'El tipo de operación debe ser: credito o debito' 
    });
  }

  if (!data.proveedor_id && !data.cliente_id) {
    errors.push({ 
      field: 'proveedor_id', 
      message: 'Debe especificar un proveedor o cliente' 
    });
  }

  if (data.proveedor_id && data.cliente_id) {
    errors.push({ 
      field: 'proveedor_id', 
      message: 'No puede especificar proveedor y cliente al mismo tiempo' 
    });
  }

  if (!data.sucursal_id || !isPositiveNumber(data.sucursal_id)) {
    errors.push({ 
      field: 'sucursal_id', 
      message: 'La sucursal es requerida' 
    });
  }

  if (!data.almacen_id || !isPositiveNumber(data.almacen_id)) {
    errors.push({ 
      field: 'almacen_id', 
      message: 'El almacén es requerido' 
    });
  }

  if (!data.usuario_id || !isPositiveNumber(data.usuario_id)) {
    errors.push({ 
      field: 'usuario_id', 
      message: 'El usuario es requerido' 
    });
  }

  if (!data.referencia_id || !isPositiveNumber(data.referencia_id)) {
    errors.push({ 
      field: 'referencia_id', 
      message: 'La referencia es requerida' 
    });
  }

  if (data.fecha_registro && !isValidDate(data.fecha_registro)) {
    errors.push({ 
      field: 'fecha_registro', 
      message: 'La fecha de registro no es válida' 
    });
  }

  if (data.fecha_registro && !isNotFutureDate(data.fecha_registro)) {
    errors.push({ 
      field: 'fecha_registro', 
      message: 'La fecha de registro no puede ser futura' 
    });
  }

  if (data.estado && !['activo', 'inactivo', 'anulado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: activo, inactivo o anulado' 
    });
  }

  if (data.monto_nc !== undefined && !isNonNegativeNumber(data.monto_nc)) {
    errors.push({ 
      field: 'monto_nc', 
      message: 'El monto de la nota debe ser un número no negativo' 
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
      if (item.precio_unitario !== undefined && !isNonNegativeNumber(item.precio_unitario)) {
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

// ===== VALIDACIONES DE TRANSFERENCIAS =====

export function validateTransferenciaStockData(data: CreateTransferenciaStockRequest): ComprasAdicionalesValidationResult {
  const errors: ComprasAdicionalesValidationError[] = [];

  if (!data.almacen_origen_id && !data.almacen_destino_id) {
    errors.push({ 
      field: 'almacen_origen_id', 
      message: 'Debe especificar al menos un almacén de origen o destino' 
    });
  }

  if (data.almacen_origen_id && data.almacen_destino_id && data.almacen_origen_id === data.almacen_destino_id) {
    errors.push({ 
      field: 'almacen_origen_id', 
      message: 'El almacén de origen y destino no pueden ser el mismo' 
    });
  }

  if (data.estado && !['pendiente', 'en_transito', 'completada', 'cancelada'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, en_transito, completada o cancelada' 
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
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== UTILIDADES DE CÁLCULO =====

/**
 * Calcula los días de vencimiento
 */
export function calculateDaysToExpiration(fechaVencimiento: string): number {
  const vencimiento = new Date(fechaVencimiento);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);
  
  const diffTime = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina el estado de vencimiento
 */
export function determineExpirationStatus(diasVencimiento: number): 'vigente' | 'por_vencer' | 'vencida' {
  if (diasVencimiento < 0) return 'vencida';
  if (diasVencimiento <= 7) return 'por_vencer';
  return 'vigente';
}

/**
 * Determina el tipo de movimiento de inventario
 */
export function determineMovementType(cantidadAjustada: number): TipoMovimientoInventario {
  if (cantidadAjustada > 0) return 'entrada';
  if (cantidadAjustada < 0) return 'salida';
  return 'correccion';
}

/**
 * Genera código de transferencia
 */
export function generateTransferCode(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(3, '0');
  return `TRF-${paddedId}`;
}

/**
 * Genera número de nota de crédito/débito
 */
export function generateNotaNumber(tipo: TipoOperacionNota, id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(3, '0');
  const prefix = tipo === 'credito' ? 'NC' : 'ND';
  return `${prefix}-${paddedId}`;
}

/**
 * Genera número de factura
 */
export function generateFacturaNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(3, '0');
  return `FAC-${year}-${paddedId}`;
}

/**
 * Calcula el IVA paraguayo
 */
export function calculateParaguayanIVA(montoGravado5: number, montoGravado10: number): number {
  const iva5 = montoGravado5 * 0.05; // 5% IVA
  const iva10 = montoGravado10 * 0.10; // 10% IVA
  return iva5 + iva10;
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
 * Formatea moneda costarricense
 */
export function formatCostaRicanCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Valida que una transferencia pueda ser completada
 */
export function canCompleteTransfer(estado: EstadoTransferencia): boolean {
  return estado === 'en_transito';
}

/**
 * Valida que un ajuste pueda ser validado
 */
export function canValidateAdjustment(estado: EstadoAjusteInventario): boolean {
  return estado === 'borrador';
}

/**
 * Valida que una nota pueda ser anulada
 */
export function canCancelNote(estado: EstadoNotaCredito): boolean {
  return estado === 'activo';
}

/**
 * Sanitiza datos sensibles para logs
 */
export function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  delete sanitized.observaciones;
  delete sanitized.comentario;
  delete sanitized.motivo;
  return sanitized;
}

/**
 * Construye la cláusula WHERE para búsquedas avanzadas
 */
export function buildAdvancedSearchWhereClause(
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
 * Construye la cláusula ORDER BY para ordenamiento avanzado
 */
export function buildAdvancedOrderByClause(
  sortBy: string, 
  sortOrder: 'asc' | 'desc', 
  defaultSort: string = 'fecha_creacion'
): string {
  const validSortFields = [
    'fecha_compra', 'fecha', 'fecha_registro', 'fecha_transferencia',
    'estado', 'monto_compra', 'monto_nc', 'valor_total',
    'proveedor_nombre', 'usuario_nombre', 'nro_factura', 'nro_nota',
    'created_at', 'updated_at', 'dias_vencimiento'
  ];
  
  const field = validSortFields.includes(sortBy) ? sortBy : defaultSort;
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  return `ORDER BY ${field} ${order}`;
}
