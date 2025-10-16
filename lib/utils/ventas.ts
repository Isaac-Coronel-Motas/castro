import { 
  VentasValidationResult, 
  VentasValidationError,
  CreateAperturaCierreCajaRequest,
  CreatePedidoVentaRequest,
  CreateVentaRequest,
  CreateCobroRequest,
  CreatePresupuestoVentaRequest,
  CreateNotaRemisionRequest,
  CreateNotaCreditoRequest,
  CreateNotaDebitoRequest,
  EstadoVenta,
  EstadoPedidoVenta,
  EstadoPresupuestoVenta,
  EstadoRemision,
  EstadoNotaCredito,
  EstadoNotaDebito,
  EstadoCuenta,
  CondicionPago,
  EstadoCaja
} from '@/lib/types/ventas';

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
 * Valida formato de número de factura
 */
export function isValidFacturaNumber(factura: string): boolean {
  const facturaRegex = /^[A-Z0-9-]{3,50}$/;
  return facturaRegex.test(factura);
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

/**
 * Valida formato de RUC paraguayo
 */
export function isValidParaguayanRUC(ruc: string): boolean {
  const rucRegex = /^[0-9]{6,8}-[0-9]$/;
  return rucRegex.test(ruc);
}

// ===== VALIDACIONES DE APERTURA/CIERRE CAJA =====

export function validateAperturaCierreCajaData(data: CreateAperturaCierreCajaRequest): VentasValidationResult {
  const errors: VentasValidationError[] = [];

  if (!data.caja_id || !isPositiveNumber(data.caja_id)) {
    errors.push({ 
      field: 'caja_id', 
      message: 'La caja es requerida' 
    });
  }

  if (!data.monto_apertura || !isNonNegativeNumber(data.monto_apertura)) {
    errors.push({ 
      field: 'monto_apertura', 
      message: 'El monto de apertura es requerido y debe ser no negativo' 
    });
  }

  if (data.fecha_apertura && !isValidDate(data.fecha_apertura)) {
    errors.push({ 
      field: 'fecha_apertura', 
      message: 'La fecha de apertura no es válida' 
    });
  }

  if (data.fecha_apertura && !isNotFutureDate(data.fecha_apertura)) {
    errors.push({ 
      field: 'fecha_apertura', 
      message: 'La fecha de apertura no puede ser futura' 
    });
  }

  if (data.fecha_cierre && !isValidDate(data.fecha_cierre)) {
    errors.push({ 
      field: 'fecha_cierre', 
      message: 'La fecha de cierre no es válida' 
    });
  }

  if (data.fecha_cierre && !isNotFutureDate(data.fecha_cierre)) {
    errors.push({ 
      field: 'fecha_cierre', 
      message: 'La fecha de cierre no puede ser futura' 
    });
  }

  if (data.monto_cierre !== undefined && !isNonNegativeNumber(data.monto_cierre)) {
    errors.push({ 
      field: 'monto_cierre', 
      message: 'El monto de cierre debe ser no negativo' 
    });
  }

  if (data.estado && !['abierta', 'cerrada'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: abierta o cerrada' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE PEDIDOS DE VENTA =====

export function validatePedidoVentaData(data: CreatePedidoVentaRequest): VentasValidationResult {
  const errors: VentasValidationError[] = [];

  if (!data.cliente_id || !isPositiveNumber(data.cliente_id)) {
    errors.push({ 
      field: 'cliente_id', 
      message: 'El cliente es requerido' 
    });
  }

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

  if (data.fecha_entrega && !isValidDate(data.fecha_entrega)) {
    errors.push({ 
      field: 'fecha_entrega', 
      message: 'La fecha de entrega no es válida' 
    });
  }

  if (data.estado && !['pendiente', 'confirmado', 'cancelado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, confirmado o cancelado' 
    });
  }

  if (data.monto_total !== undefined && !isNonNegativeNumber(data.monto_total)) {
    errors.push({ 
      field: 'monto_total', 
      message: 'El monto total debe ser no negativo' 
    });
  }

  if (data.condicion_pago && !['contado', 'crédito'].includes(data.condicion_pago)) {
    errors.push({ 
      field: 'condicion_pago', 
      message: 'La condición de pago debe ser: contado o crédito' 
    });
  }

  if (!data.productos || data.productos.length === 0) {
    errors.push({ 
      field: 'productos', 
      message: 'Debe agregar al menos un producto' 
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
          message: 'El precio unitario debe ser no negativo' 
        });
      }
      if (producto.descuento !== undefined && !isNonNegativeNumber(producto.descuento)) {
        errors.push({ 
          field: `productos[${index}].descuento`, 
          message: 'El descuento debe ser no negativo' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE VENTAS =====

export function validateVentaData(data: CreateVentaRequest): VentasValidationResult {
  const errors: VentasValidationError[] = [];

  if (data.fecha_venta && !isValidDate(data.fecha_venta)) {
    errors.push({ 
      field: 'fecha_venta', 
      message: 'La fecha de venta no es válida' 
    });
  }

  if (data.fecha_venta && !isNotFutureDate(data.fecha_venta)) {
    errors.push({ 
      field: 'fecha_venta', 
      message: 'La fecha de venta no puede ser futura' 
    });
  }

  if (data.estado && !['cerrado', 'abierto', 'cancelado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: cerrado, abierto o cancelado' 
    });
  }

  if (data.monto_venta !== undefined && !isNonNegativeNumber(data.monto_venta)) {
    errors.push({ 
      field: 'monto_venta', 
      message: 'El monto de venta debe ser no negativo' 
    });
  }

  if (data.condicion_pago && !['contado', 'crédito'].includes(data.condicion_pago)) {
    errors.push({ 
      field: 'condicion_pago', 
      message: 'La condición de pago debe ser: contado o crédito' 
    });
  }

  if (data.monto_gravada_5 !== undefined && !isNonNegativeNumber(data.monto_gravada_5)) {
    errors.push({ 
      field: 'monto_gravada_5', 
      message: 'El monto gravado al 5% debe ser no negativo' 
    });
  }

  if (data.monto_gravada_10 !== undefined && !isNonNegativeNumber(data.monto_gravada_10)) {
    errors.push({ 
      field: 'monto_gravada_10', 
      message: 'El monto gravado al 10% debe ser no negativo' 
    });
  }

  if (data.monto_exenta !== undefined && !isNonNegativeNumber(data.monto_exenta)) {
    errors.push({ 
      field: 'monto_exenta', 
      message: 'El monto exento debe ser no negativo' 
    });
  }

  if (data.monto_iva !== undefined && !isNonNegativeNumber(data.monto_iva)) {
    errors.push({ 
      field: 'monto_iva', 
      message: 'El monto de IVA debe ser no negativo' 
    });
  }

  if (!data.productos || data.productos.length === 0) {
    errors.push({ 
      field: 'productos', 
      message: 'Debe agregar al menos un producto' 
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
          message: 'El precio unitario debe ser no negativo' 
        });
      }
      if (producto.descuento !== undefined && !isNonNegativeNumber(producto.descuento)) {
        errors.push({ 
          field: `productos[${index}].descuento`, 
          message: 'El descuento debe ser no negativo' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE COBROS =====

export function validateCobroData(data: CreateCobroRequest): VentasValidationResult {
  const errors: VentasValidationError[] = [];

  if (!data.venta_id || !isPositiveNumber(data.venta_id)) {
    errors.push({ 
      field: 'venta_id', 
      message: 'La venta es requerida' 
    });
  }

  if (!data.monto || !isPositiveNumber(data.monto)) {
    errors.push({ 
      field: 'monto', 
      message: 'El monto es requerido y debe ser positivo' 
    });
  }

  if (!data.caja_id || !isPositiveNumber(data.caja_id)) {
    errors.push({ 
      field: 'caja_id', 
      message: 'La caja es requerida' 
    });
  }

  if (data.fecha_cobro && !isValidDate(data.fecha_cobro)) {
    errors.push({ 
      field: 'fecha_cobro', 
      message: 'La fecha de cobro no es válida' 
    });
  }

  if (data.fecha_cobro && !isNotFutureDate(data.fecha_cobro)) {
    errors.push({ 
      field: 'fecha_cobro', 
      message: 'La fecha de cobro no puede ser futura' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE PRESUPUESTOS DE VENTA =====

export function validatePresupuestoVentaData(data: CreatePresupuestoVentaRequest): VentasValidationResult {
  const errors: VentasValidationError[] = [];

  if (!data.cliente_id || !isPositiveNumber(data.cliente_id)) {
    errors.push({ 
      field: 'cliente_id', 
      message: 'El cliente es requerido' 
    });
  }

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

  if (data.fecha_vencimiento && !isValidDate(data.fecha_vencimiento)) {
    errors.push({ 
      field: 'fecha_vencimiento', 
      message: 'La fecha de vencimiento no es válida' 
    });
  }

  if (data.estado && !['pendiente', 'aceptado', 'rechazado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, aceptado o rechazado' 
    });
  }

  if (data.monto_total !== undefined && !isNonNegativeNumber(data.monto_total)) {
    errors.push({ 
      field: 'monto_total', 
      message: 'El monto total debe ser no negativo' 
    });
  }

  if (data.condicion_pago && !['contado', 'crédito'].includes(data.condicion_pago)) {
    errors.push({ 
      field: 'condicion_pago', 
      message: 'La condición de pago debe ser: contado o crédito' 
    });
  }

  if (!data.productos || data.productos.length === 0) {
    errors.push({ 
      field: 'productos', 
      message: 'Debe agregar al menos un producto' 
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
          message: 'El precio unitario debe ser no negativo' 
        });
      }
      if (producto.descuento !== undefined && !isNonNegativeNumber(producto.descuento)) {
        errors.push({ 
          field: `productos[${index}].descuento`, 
          message: 'El descuento debe ser no negativo' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE NOTAS DE REMISIÓN =====

export function validateNotaRemisionData(data: CreateNotaRemisionRequest): VentasValidationResult {
  const errors: VentasValidationError[] = [];

  if (!data.usuario_id || !isPositiveNumber(data.usuario_id)) {
    errors.push({ 
      field: 'usuario_id', 
      message: 'El usuario es requerido' 
    });
  }

  if (!data.origen_almacen_id || !isPositiveNumber(data.origen_almacen_id)) {
    errors.push({ 
      field: 'origen_almacen_id', 
      message: 'El almacén de origen es requerido' 
    });
  }

  if (!data.tipo_remision || data.tipo_remision.trim().length === 0) {
    errors.push({ 
      field: 'tipo_remision', 
      message: 'El tipo de remisión es requerido' 
    });
  }

  if (data.fecha_remision && !isValidDate(data.fecha_remision)) {
    errors.push({ 
      field: 'fecha_remision', 
      message: 'La fecha de remisión no es válida' 
    });
  }

  if (data.fecha_remision && !isNotFutureDate(data.fecha_remision)) {
    errors.push({ 
      field: 'fecha_remision', 
      message: 'La fecha de remisión no puede ser futura' 
    });
  }

  if (data.estado && !['pendiente', 'enviado', 'anulado'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, enviado o anulado' 
    });
  }

  if (!data.productos || data.productos.length === 0) {
    errors.push({ 
      field: 'productos', 
      message: 'Debe agregar al menos un producto' 
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
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE NOTAS DE CRÉDITO =====

export function validateNotaCreditoData(data: CreateNotaCreditoRequest): VentasValidationResult {
  const errors: VentasValidationError[] = [];

  if (!data.tipo_operacion || data.tipo_operacion.trim().length === 0) {
    errors.push({ 
      field: 'tipo_operacion', 
      message: 'El tipo de operación es requerido' 
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

  if (data.estado && !['pendiente', 'aprobada', 'rechazada', 'anulada'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, aprobada, rechazada o anulada' 
    });
  }

  if (data.monto_nc !== undefined && !isNonNegativeNumber(data.monto_nc)) {
    errors.push({ 
      field: 'monto_nc', 
      message: 'El monto de la nota de crédito debe ser no negativo' 
    });
  }

  if (data.monto_gravada_5 !== undefined && !isNonNegativeNumber(data.monto_gravada_5)) {
    errors.push({ 
      field: 'monto_gravada_5', 
      message: 'El monto gravado al 5% debe ser no negativo' 
    });
  }

  if (data.monto_gravada_10 !== undefined && !isNonNegativeNumber(data.monto_gravada_10)) {
    errors.push({ 
      field: 'monto_gravada_10', 
      message: 'El monto gravado al 10% debe ser no negativo' 
    });
  }

  if (data.monto_exenta !== undefined && !isNonNegativeNumber(data.monto_exenta)) {
    errors.push({ 
      field: 'monto_exenta', 
      message: 'El monto exento debe ser no negativo' 
    });
  }

  if (data.monto_iva_5 !== undefined && !isNonNegativeNumber(data.monto_iva_5)) {
    errors.push({ 
      field: 'monto_iva_5', 
      message: 'El monto de IVA al 5% debe ser no negativo' 
    });
  }

  if (data.monto_iva_10 !== undefined && !isNonNegativeNumber(data.monto_iva_10)) {
    errors.push({ 
      field: 'monto_iva_10', 
      message: 'El monto de IVA al 10% debe ser no negativo' 
    });
  }

  if (data.monto_iva !== undefined && !isNonNegativeNumber(data.monto_iva)) {
    errors.push({ 
      field: 'monto_iva', 
      message: 'El monto de IVA debe ser no negativo' 
    });
  }

  if (data.monto_total !== undefined && !isNonNegativeNumber(data.monto_total)) {
    errors.push({ 
      field: 'monto_total', 
      message: 'El monto total debe ser no negativo' 
    });
  }

  if (!data.productos || data.productos.length === 0) {
    errors.push({ 
      field: 'productos', 
      message: 'Debe agregar al menos un producto' 
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
          message: 'El precio unitario debe ser no negativo' 
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE NOTAS DE DÉBITO =====

export function validateNotaDebitoData(data: CreateNotaDebitoRequest): VentasValidationResult {
  const errors: VentasValidationError[] = [];

  if (!data.tipo_operacion || data.tipo_operacion.trim().length === 0) {
    errors.push({ 
      field: 'tipo_operacion', 
      message: 'El tipo de operación es requerido' 
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

  if (data.estado && !['pendiente', 'aprobada', 'rechazada', 'anulada'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: pendiente, aprobada, rechazada o anulada' 
    });
  }

  if (data.monto_nd !== undefined && !isNonNegativeNumber(data.monto_nd)) {
    errors.push({ 
      field: 'monto_nd', 
      message: 'El monto de la nota de débito debe ser no negativo' 
    });
  }

  if (data.monto_gravada_5 !== undefined && !isNonNegativeNumber(data.monto_gravada_5)) {
    errors.push({ 
      field: 'monto_gravada_5', 
      message: 'El monto gravado al 5% debe ser no negativo' 
    });
  }

  if (data.monto_gravada_10 !== undefined && !isNonNegativeNumber(data.monto_gravada_10)) {
    errors.push({ 
      field: 'monto_gravada_10', 
      message: 'El monto gravado al 10% debe ser no negativo' 
    });
  }

  if (data.monto_exenta !== undefined && !isNonNegativeNumber(data.monto_exenta)) {
    errors.push({ 
      field: 'monto_exenta', 
      message: 'El monto exento debe ser no negativo' 
    });
  }

  if (data.monto_iva_5 !== undefined && !isNonNegativeNumber(data.monto_iva_5)) {
    errors.push({ 
      field: 'monto_iva_5', 
      message: 'El monto de IVA al 5% debe ser no negativo' 
    });
  }

  if (data.monto_iva_10 !== undefined && !isNonNegativeNumber(data.monto_iva_10)) {
    errors.push({ 
      field: 'monto_iva_10', 
      message: 'El monto de IVA al 10% debe ser no negativo' 
    });
  }

  if (data.monto_iva !== undefined && !isNonNegativeNumber(data.monto_iva)) {
    errors.push({ 
      field: 'monto_iva', 
      message: 'El monto de IVA debe ser no negativo' 
    });
  }

  if (data.monto_total !== undefined && !isNonNegativeNumber(data.monto_total)) {
    errors.push({ 
      field: 'monto_total', 
      message: 'El monto total debe ser no negativo' 
    });
  }

  if (!data.productos || data.productos.length === 0) {
    errors.push({ 
      field: 'productos', 
      message: 'Debe agregar al menos un producto' 
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
          message: 'El precio unitario debe ser no negativo' 
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
 * Calcula el IVA paraguayo (5% y 10%)
 */
export function calculateParaguayanIVA(montoGravada5: number, montoGravada10: number): number {
  const iva5 = montoGravada5 * 0.05;
  const iva10 = montoGravada10 * 0.10;
  return iva5 + iva10;
}

/**
 * Calcula el monto total de una venta
 */
export function calculateVentaTotal(
  montoGravada5: number, 
  montoGravada10: number, 
  montoExenta: number, 
  montoIVA: number
): number {
  return montoGravada5 + montoGravada10 + montoExenta + montoIVA;
}

/**
 * Calcula el subtotal de un producto
 */
export function calculateProductoSubtotal(
  cantidad: number, 
  precioUnitario: number, 
  descuento: number = 0
): number {
  const subtotal = cantidad * precioUnitario;
  return subtotal - descuento;
}

/**
 * Calcula los días de vencimiento de una cuenta por cobrar
 */
export function calculateCuentaPorCobrarVencimiento(fechaVencimiento: string): number {
  const vencimiento = new Date(fechaVencimiento);
  const hoy = new Date();
  const diffTime = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina el estado de vencimiento de una cuenta por cobrar
 */
export function determineCuentaPorCobrarEstadoVencimiento(diasVencimiento: number): 'vigente' | 'por_vencer' | 'vencida' {
  if (diasVencimiento < 0) return 'vencida';
  if (diasVencimiento <= 7) return 'por_vencer';
  return 'vigente';
}

/**
 * Calcula los días de validez de un presupuesto
 */
export function calculatePresupuestoValidityDays(validoDesde: string, validoHasta: string): number {
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
 * Genera número de pedido
 */
export function generatePedidoNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `PED-${paddedId}-${year}`;
}

/**
 * Genera número de venta
 */
export function generateVentaNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `VEN-${paddedId}-${year}`;
}

/**
 * Genera número de presupuesto
 */
export function generatePresupuestoNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `PRES-${paddedId}-${year}`;
}

/**
 * Genera número de remisión
 */
export function generateRemisionNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `REM-${paddedId}-${year}`;
}

/**
 * Genera número de nota de crédito
 */
export function generateNotaCreditoNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `NC-${paddedId}-${year}`;
}

/**
 * Genera número de nota de débito
 */
export function generateNotaDebitoNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `ND-${paddedId}-${year}`;
}

/**
 * Genera número de cobro
 */
export function generateCobroNumber(id: number): string {
  const year = new Date().getFullYear();
  const paddedId = id.toString().padStart(4, '0');
  return `COB-${paddedId}-${year}`;
}

/**
 * Formatea moneda paraguaya (PYG)
 */
export function formatParaguayanCurrency(amount: number): string {
  return `PYG ${amount.toLocaleString('es-PY')}`;
}

/**
 * Valida que una caja pueda ser cerrada
 */
export function canCloseCaja(estado: EstadoCaja): boolean {
  return estado === 'abierta';
}

/**
 * Valida que una venta pueda ser cancelada
 */
export function canCancelVenta(estado: EstadoVenta): boolean {
  return estado === 'abierto';
}

/**
 * Valida que un pedido pueda ser confirmado
 */
export function canConfirmPedido(estado: EstadoPedidoVenta): boolean {
  return estado === 'pendiente';
}

/**
 * Valida que un presupuesto pueda ser aceptado
 */
export function canAcceptPresupuesto(estado: EstadoPresupuestoVenta): boolean {
  return estado === 'pendiente';
}

/**
 * Valida que una remisión pueda ser enviada
 */
export function canSendRemision(estado: EstadoRemision): boolean {
  return estado === 'pendiente';
}

/**
 * Valida que una nota de crédito pueda ser aprobada
 */
export function canApproveNotaCredito(estado: EstadoNotaCredito): boolean {
  return estado === 'pendiente';
}

/**
 * Valida que una nota de débito pueda ser aprobada
 */
export function canApproveNotaDebito(estado: EstadoNotaDebito): boolean {
  return estado === 'pendiente';
}

/**
 * Sanitiza datos sensibles para logs
 */
export function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  delete sanitized.observaciones;
  delete sanitized.motivo;
  delete sanitized.descripcion;
  return sanitized;
}

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
    'fecha_apertura', 'fecha_pedido', 'fecha_venta', 'fecha_cobro',
    'fecha_presupuesto', 'fecha_remision', 'fecha_registro',
    'estado', 'monto_total', 'monto_venta', 'monto_cobro',
    'cliente_nombre', 'usuario_nombre', 'sucursal_nombre',
    'nro_factura', 'nro_pedido', 'nro_presupuesto',
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
