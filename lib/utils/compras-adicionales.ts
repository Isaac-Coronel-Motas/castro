import { ValidationResult, CreateRegistroCompraRequest } from '@/lib/types/compras-adicionales';

// Funciones de búsqueda avanzada
export function buildAdvancedSearchWhereClause(
  searchFields: string[],
  searchTerm: string,
  additionalConditions: string[] = []
): { whereClause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramCount = 0;

  if (searchTerm && searchTerm.trim() !== '') {
    paramCount++;
    const searchCondition = searchFields
      .map(field => `LOWER(${field}) LIKE LOWER($${paramCount})`)
      .join(' OR ');
    conditions.push(`(${searchCondition})`);
    params.push(`%${searchTerm.trim()}%`);
  }

  additionalConditions.forEach(condition => {
    conditions.push(condition);
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  return { whereClause, params };
}

export function buildAdvancedOrderByClause(
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  defaultField: string = 'id',
  tableContext?: string
): string {
  const validSortFields = [
    'id', 'fecha', 'fecha_pedido', 'fecha_presupuesto', 'fecha_orden', 'fecha_compra',
    'fecha_registro', 'estado', 'monto', 'monto_total', 'nombre', 'descripcion',
    'fecha_entrega', 'progreso', 'prioridad', 'nro_comprobante', 'nro_nota', 'created_at'
  ];
  
  // Mapear campos comunes a campos reales según el contexto de la tabla
  let fieldMapping: { [key: string]: string } = {};
  
  if (tableContext === 'compra_cabecera' || tableContext === 'registro') {
    fieldMapping = {
      'created_at': 'fecha_compra',
      'fecha': 'fecha_compra',
      'fecha_registro': 'fecha_compra',
      'monto': 'monto_compra',
      'nombre': 'proveedor_nombre'
    };
  } else if (tableContext === 'nota_credito' || tableContext === 'nota_debito') {
    fieldMapping = {
      'created_at': 'fecha_registro',
      'fecha': 'fecha_registro',
      'monto': 'monto_nc',
      'nombre': 'proveedor_nombre'
    };
  } else if (tableContext === 'ajustes_inventario' || tableContext === 'ajustes') {
    fieldMapping = {
      'created_at': 'fecha',
      'fecha': 'fecha',
      'fecha_registro': 'fecha',
      'monto': 'cantidad_ajustada',
      'nombre': 'observaciones'
    };
  } else {
    // Mapeo genérico por defecto
    fieldMapping = {
      'created_at': 'fecha_registro',
      'fecha': 'fecha_registro',
      'monto': 'monto_total',
      'nombre': 'proveedor_nombre'
    };
  }
  
  const mappedField = fieldMapping[sortBy] || sortBy;
  const field = validSortFields.includes(sortBy) ? mappedField : defaultField;
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
  
  return `ORDER BY ${field} ${order}`;
}

// Función de ordenamiento específica para transferencias
export function buildTransferenciaOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc', defaultField: string = 'fecha'): string {
  const validSortFields = [
    'transferencia_id', 'fecha', 'estado', 'usuario_nombre', 
    'almacen_origen_nombre', 'almacen_destino_nombre', 'total_productos', 'valor_total'
  ];
  
  // Mapear campos comunes a campos reales de la tabla transferencia_stock
  const fieldMapping: { [key: string]: string } = {
    'created_at': 'fecha',
    'fecha': 'fecha',
    'monto': 'valor_total',
    'nombre': 'usuario_nombre'
  };
  
  const mappedField = fieldMapping[sortBy] || sortBy;
  const field = validSortFields.includes(sortBy) ? mappedField : defaultField;
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
  
  return `ORDER BY ${field} ${order}`;
}

// Función de paginación
export function buildPaginationParams(page: number, limit: number, offset: number): { limitParam: number; offsetParam: number } {
  return {
    limitParam: limit,
    offsetParam: offset
  };
}

// Función de validación para registro de compras
export function validateRegistroCompraData(data: CreateRegistroCompraRequest): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.proveedor_id || data.proveedor_id <= 0) {
    errors.proveedor_id = 'El proveedor es requerido';
  }

  if (!data.usuario_id || data.usuario_id <= 0) {
    errors.usuario_id = 'El usuario es requerido';
  }

  if (!data.sucursal_id || data.sucursal_id <= 0) {
    errors.sucursal_id = 'La sucursal es requerida';
  }

  if (!data.tipo_doc_id || data.tipo_doc_id <= 0) {
    errors.tipo_doc_id = 'El tipo de documento es requerido';
  }

  if (data.monto_compra <= 0) {
    errors.monto_compra = 'El monto de la compra debe ser mayor a 0';
  }

  if (data.fecha_compra && isNaN(Date.parse(data.fecha_compra))) {
    errors.fecha_compra = 'La fecha de la compra no es válida';
  }

  if (data.fecha_comprobante && isNaN(Date.parse(data.fecha_comprobante))) {
    errors.fecha_comprobante = 'La fecha del comprobante no es válida';
  }

  if (data.estado && !['pendiente', 'en_progreso', 'completada', 'cancelada'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  if (data.condicion_pago && !['contado', 'credito_15', 'credito_30', 'credito_45', 'credito_60'].includes(data.condicion_pago)) {
    errors.condicion_pago = 'La condición de pago no es válida';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

// Función para calcular IVA paraguayo
export function calculateParaguayanIVA(montoGravada5: number, montoGravada10: number): number {
  const iva5 = montoGravada5 * 0.05; // 5% IVA
  const iva10 = montoGravada10 * 0.10; // 10% IVA
  return iva5 + iva10;
}

// Función para generar número de factura
export function generateFacturaNumber(compraId: number): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `FAC-${year}${month}-${String(compraId).padStart(6, '0')}`;
}

// Función para calcular días hasta vencimiento
export function calculateDaysToExpiration(fechaVencimiento: string): number {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diffTime = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Función para determinar estado de vencimiento
export function determineExpirationStatus(fechaVencimiento: string): string {
  const dias = calculateDaysToExpiration(fechaVencimiento);
  
  if (dias < 0) {
    return 'vencida';
  } else if (dias <= 7) {
    return 'por_vencer';
  } else {
    return 'vigente';
  }
}

// Funciones de validación adicionales
export function validateNotaCreditoCompraData(data: any): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.tipo_operacion || !['compra', 'venta'].includes(data.tipo_operacion)) {
    errors.tipo_operacion = 'El tipo de operación es requerido';
  }

  if (!data.sucursal_id || data.sucursal_id <= 0) {
    errors.sucursal_id = 'La sucursal es requerida';
  }

  if (!data.almacen_id || data.almacen_id <= 0) {
    errors.almacen_id = 'El almacén es requerido';
  }

  if (!data.usuario_id || data.usuario_id <= 0) {
    errors.usuario_id = 'El usuario es requerido';
  }

  if (!data.referencia_id || data.referencia_id <= 0) {
    errors.referencia_id = 'La referencia es requerida';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

export function validateNotaDebitoCompraData(data: any): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.tipo_operacion || !['compra', 'venta'].includes(data.tipo_operacion)) {
    errors.tipo_operacion = 'El tipo de operación es requerido';
  }

  if (!data.sucursal_id || data.sucursal_id <= 0) {
    errors.sucursal_id = 'La sucursal es requerida';
  }

  if (!data.almacen_id || data.almacen_id <= 0) {
    errors.almacen_id = 'El almacén es requerido';
  }

  if (!data.usuario_id || data.usuario_id <= 0) {
    errors.usuario_id = 'El usuario es requerido';
  }

  if (!data.referencia_id || data.referencia_id <= 0) {
    errors.referencia_id = 'La referencia es requerida';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}


// Funciones de utilidad
export function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  return sanitized;
}

// ===== FUNCIONES PARA AJUSTES DE INVENTARIO =====

/**
 * Valida los datos de un ajuste de inventario
 */
export function validateAjusteInventarioData(data: CreateAjusteInventarioRequest): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.usuario_id || data.usuario_id <= 0) {
    errors.usuario_id = 'El usuario es requerido';
  }

  if (!data.motivo_id || data.motivo_id <= 0) {
    errors.motivo_id = 'El motivo es requerido';
  }

  if (!data.almacen_id || data.almacen_id <= 0) {
    errors.almacen_id = 'El almacén es requerido';
  }

  if (data.estado && !['borrador', 'validado', 'anulado'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  if (data.items && data.items.length === 0) {
    errors.items = 'Debe incluir al menos un producto para ajustar';
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!item.producto_id || item.producto_id <= 0) {
        errors[`items[${index}].producto_id`] = 'El producto es requerido';
      }
      if (item.cantidad_ajustada === 0) {
        errors[`items[${index}].cantidad_ajustada`] = 'La cantidad ajustada no puede ser cero';
      }
    });
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Determina el tipo de movimiento basado en la cantidad ajustada
 */
export function determineMovementType(cantidadAjustada: number): string {
  if (cantidadAjustada > 0) {
    return 'entrada';
  } else if (cantidadAjustada < 0) {
    return 'salida';
  } else {
    return 'ajuste';
  }
}

/**
 * Obtiene el color del estado de un ajuste
 */
export function getAjusteEstadoColor(estado: string): string {
  const colores: { [key: string]: string } = {
    'borrador': 'bg-secondary text-secondary-foreground',
    'validado': 'bg-green-500 text-white',
    'anulado': 'bg-destructive text-destructive-foreground'
  };
  return colores[estado] || 'bg-muted text-muted-foreground';
}

/**
 * Obtiene la etiqueta del estado de un ajuste
 */
export function getAjusteEstadoLabel(estado: string): string {
  const etiquetas: { [key: string]: string } = {
    'borrador': 'Borrador',
    'validado': 'Validado',
    'anulado': 'Anulado'
  };
  return etiquetas[estado] || estado;
}

/**
 * Obtiene el color del tipo de movimiento
 */
export function getTipoMovimientoColor(tipo: string): string {
  const colores: { [key: string]: string } = {
    'entrada': 'bg-green-500 text-white',
    'salida': 'bg-blue-500 text-white',
    'ajuste': 'bg-secondary text-secondary-foreground'
  };
  return colores[tipo] || 'bg-muted text-muted-foreground';
}

/**
 * Obtiene la etiqueta del tipo de movimiento
 */
export function getTipoMovimientoLabel(tipo: string): string {
  const etiquetas: { [key: string]: string } = {
    'entrada': 'Entrada',
    'salida': 'Salida',
    'ajuste': 'Ajuste'
  };
  return etiquetas[tipo] || tipo;
}

// ===== FUNCIONES PARA NOTAS DE CRÉDITO/DÉBITO =====

/**
 * Valida los datos de una nota de crédito/débito
 */
export function validateNotaCreditoDebitoData(data: CreateNotaCreditoDebitoRequest): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.tipo_operacion || !['compra', 'venta'].includes(data.tipo_operacion)) {
    errors.tipo_operacion = 'El tipo de operación es requerido';
  }

  if (!data.sucursal_id || data.sucursal_id <= 0) {
    errors.sucursal_id = 'La sucursal es requerida';
  }

  if (!data.almacen_id || data.almacen_id <= 0) {
    errors.almacen_id = 'El almacén es requerido';
  }

  if (!data.usuario_id || data.usuario_id <= 0) {
    errors.usuario_id = 'El usuario es requerido';
  }

  if (!data.referencia_id || data.referencia_id <= 0) {
    errors.referencia_id = 'La referencia es requerida';
  }

  if (data.tipo_operacion === 'compra' && (!data.proveedor_id || data.proveedor_id <= 0)) {
    errors.proveedor_id = 'El proveedor es requerido para operaciones de compra';
  }

  if (data.tipo_operacion === 'venta' && (!data.cliente_id || data.cliente_id <= 0)) {
    errors.cliente_id = 'El cliente es requerido para operaciones de venta';
  }

  if (data.fecha_registro && isNaN(Date.parse(data.fecha_registro))) {
    errors.fecha_registro = 'La fecha de registro no es válida';
  }

  if (data.estado && !['activo', 'anulado'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  if (data.monto_nc !== undefined && data.monto_nc < 0) {
    errors.monto_nc = 'El monto no puede ser negativo';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Genera un número de nota único
 */
export function generateNotaNumber(tipoOperacion: string, notaId: number): string {
  const prefix = tipoOperacion === 'compra' ? 'NC' : 'ND';
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  return `${prefix}-${year}${month}-${String(notaId).padStart(4, '0')}`;
}

/**
 * Obtiene el color del tipo de operación
 */
export function getTipoOperacionColor(tipo: string): string {
  const colores: { [key: string]: string } = {
    'compra': 'bg-blue-500 text-white',
    'venta': 'bg-green-500 text-white'
  };
  return colores[tipo] || 'bg-muted text-muted-foreground';
}

/**
 * Obtiene la etiqueta del tipo de operación
 */
export function getTipoOperacionLabel(tipo: string): string {
  const etiquetas: { [key: string]: string } = {
    'compra': 'Compra',
    'venta': 'Venta'
  };
  return etiquetas[tipo] || tipo;
}

/**
 * Obtiene el color del estado de una nota
 */
export function getNotaEstadoColor(estado: string): string {
  const colores: { [key: string]: string } = {
    'activo': 'bg-green-500 text-white',
    'anulado': 'bg-destructive text-destructive-foreground'
  };
  return colores[estado] || 'bg-muted text-muted-foreground';
}

/**
 * Obtiene la etiqueta del estado de una nota
 */
export function getNotaEstadoLabel(estado: string): string {
  const etiquetas: { [key: string]: string } = {
    'activo': 'Activo',
    'anulado': 'Anulado'
  };
  return etiquetas[estado] || estado;
}

// ===== FUNCIONES PARA TRANSFERENCIAS DE STOCK =====

/**
 * Valida los datos de una transferencia de stock
 */
export function validateTransferenciaStockData(data: CreateTransferenciaStockRequest): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.usuario_id || data.usuario_id <= 0) {
    errors.usuario_id = 'El usuario es requerido';
  }

  if (!data.almacen_origen_id || data.almacen_origen_id <= 0) {
    errors.almacen_origen_id = 'El almacén de origen es requerido';
  }

  if (!data.almacen_destino_id || data.almacen_destino_id <= 0) {
    errors.almacen_destino_id = 'El almacén de destino es requerido';
  }

  if (data.almacen_origen_id === data.almacen_destino_id) {
    errors.almacen_destino_id = 'El almacén de destino debe ser diferente al de origen';
  }

  if (data.fecha && isNaN(Date.parse(data.fecha))) {
    errors.fecha = 'La fecha no es válida';
  }

  if (data.estado && !['pendiente', 'en_transito', 'completada', 'cancelada'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  if (data.items && data.items.length === 0) {
    errors.items = 'Debe incluir al menos un producto para transferir';
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!item.producto_id || item.producto_id <= 0) {
        errors[`items[${index}].producto_id`] = 'El producto es requerido';
      }
      if (!item.cantidad || item.cantidad <= 0) {
        errors[`items[${index}].cantidad`] = 'La cantidad debe ser mayor a 0';
      }
    });
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Genera un código único para la transferencia
 */
export function generateTransferCode(transferenciaId: number): string {
  return `TRF-${String(transferenciaId).padStart(4, '0')}`;
}

/**
 * Verifica si una transferencia puede ser completada
 */
export function canCompleteTransfer(estado: string): boolean {
  return estado === 'pendiente' || estado === 'en_transito';
}