import { ValidationResult } from '@/lib/types/compras-adicionales';
import { 
  CreatePedidoCompraRequest,
  CreatePresupuestoProveedorRequest,
  CreateOrdenCompraRequest,
  CreateCompraCabeceraRequest,
  CreateAjusteInventarioRequest,
  CreateNotaCreditoRequest,
  CreateNotaDebitoRequest,
  CreateTransferenciaStockRequest
} from '@/lib/types/compras';

// ===== VALIDACIÓN DE DATOS =====

/**
 * Valida los datos de un pedido de compra
 */
export function validatePedidoCompraData(data: CreatePedidoCompraRequest): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.usuario_id || data.usuario_id <= 0) {
    errors.usuario_id = 'El usuario es requerido';
  }

  if (!data.sucursal_id || data.sucursal_id <= 0) {
    errors.sucursal_id = 'La sucursal es requerida';
  }

  if (!data.almacen_id || data.almacen_id <= 0) {
    errors.almacen_id = 'El almacén es requerido';
  }

  if (data.fecha_pedido && isNaN(Date.parse(data.fecha_pedido))) {
    errors.fecha_pedido = 'La fecha del pedido no es válida';
  }

  if (data.estado && !['pendiente', 'aprobado', 'rechazado', 'cancelado'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Valida los datos de un presupuesto de proveedor
 */
export function validatePresupuestoProveedorData(data: CreatePresupuestoProveedorRequest): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.usuario_id || data.usuario_id <= 0) {
    errors.usuario_id = 'El usuario es requerido';
  }

  if (!data.proveedor_id || data.proveedor_id <= 0) {
    errors.proveedor_id = 'El proveedor es requerido';
  }

  if (data.fecha_presupuesto && isNaN(Date.parse(data.fecha_presupuesto))) {
    errors.fecha_presupuesto = 'La fecha del presupuesto no es válida';
  }

  if (data.valido_hasta && isNaN(Date.parse(data.valido_hasta))) {
    errors.valido_hasta = 'La fecha de validez no es válida';
  }

  if (data.estado && !['nuevo', 'enviado', 'recibido', 'aprobado', 'rechazado', 'vencido'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  if (data.monto_presu_prov !== undefined && data.monto_presu_prov < 0) {
    errors.monto_presu_prov = 'El monto no puede ser negativo';
  }

  if (data.descuento !== undefined && (data.descuento < 0 || data.descuento > 100)) {
    errors.descuento = 'El descuento debe estar entre 0 y 100';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Valida los datos de una orden de compra
 */
export function validateOrdenCompraData(data: CreateOrdenCompraRequest): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.proveedor_id || data.proveedor_id <= 0) {
    errors.proveedor_id = 'El proveedor es requerido';
  }

  if (!data.usuario_id || data.usuario_id <= 0) {
    errors.usuario_id = 'El usuario es requerido';
  }

  if (data.fecha_orden && isNaN(Date.parse(data.fecha_orden))) {
    errors.fecha_orden = 'La fecha de la orden no es válida';
  }

  if (data.fecha_entrega && isNaN(Date.parse(data.fecha_entrega))) {
    errors.fecha_entrega = 'La fecha de entrega no es válida';
  }

  if (data.estado && !['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  if (data.prioridad && !['alta', 'media', 'baja'].includes(data.prioridad)) {
    errors.prioridad = 'La prioridad no es válida';
  }

  if (data.monto_oc !== undefined && data.monto_oc < 0) {
    errors.monto_oc = 'El monto no puede ser negativo';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Valida los datos de una compra
 */
export function validateCompraCabeceraData(data: CreateCompraCabeceraRequest): ValidationResult {
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

  if (data.estado && !['pendiente', 'confirmada', 'anulada'].includes(data.estado)) {
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

  if (data.detalles && data.detalles.length === 0) {
    errors.detalles = 'Debe incluir al menos un detalle';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Valida los datos de una nota de crédito
 */
export function validateNotaCreditoData(data: CreateNotaCreditoRequest): ValidationResult {
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
 * Valida los datos de una nota de débito
 */
export function validateNotaDebitoData(data: CreateNotaDebitoRequest): ValidationResult {
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

  if (data.fecha_registro && isNaN(Date.parse(data.fecha_registro))) {
    errors.fecha_registro = 'La fecha de registro no es válida';
  }

  if (data.estado && !['activo', 'anulado'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  if (data.monto_nd !== undefined && data.monto_nd < 0) {
    errors.monto_nd = 'El monto no puede ser negativo';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

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

  if (data.estado && !['pendiente', 'enviada', 'recibida', 'cancelada'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  if (data.detalles && data.detalles.length === 0) {
    errors.detalles = 'Debe incluir al menos un detalle';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

// ===== FUNCIONES DE BÚSQUEDA =====

/**
 * Construye la cláusula WHERE para búsquedas
 */
export function buildSearchWhereClause(
  searchFields: string[],
  searchTerm: string,
  additionalConditions: string[] = []
): { whereClause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramCount = 0;

  // Búsqueda en campos específicos
  if (searchTerm && searchTerm.trim() !== '') {
    paramCount++;
    const searchCondition = searchFields
      .map(field => `LOWER(${field}) LIKE LOWER($${paramCount})`)
      .join(' OR ');
    conditions.push(`(${searchCondition})`);
    params.push(`%${searchTerm.trim()}%`);
  }

  // Condiciones adicionales
  additionalConditions.forEach(condition => {
    conditions.push(condition);
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  return { whereClause, params };
}

/**
 * Construye la cláusula ORDER BY
 */
export function buildOrderByClause(
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  defaultField: string = 'id'
): string {
  const validSortFields = [
    'id', 'fecha', 'fecha_pedido', 'fecha_presupuesto', 'fecha_orden', 'fecha_compra',
    'fecha_registro', 'estado', 'monto', 'monto_total', 'nombre', 'descripcion'
  ];
  
  const field = validSortFields.includes(sortBy) ? sortBy : defaultField;
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
  
  return `ORDER BY ${field} ${order}`;
}

/**
 * Construye los parámetros de paginación
 */
export function buildPaginationParams(page: number, limit: number, offset: number): { limitParam: number; offsetParam: number } {
  const limitParam = Math.min(Math.max(limit, 1), 100); // Entre 1 y 100
  const offsetParam = Math.max(offset, 0);
  
  return { limitParam, offsetParam };
}

// ===== FUNCIONES DE GENERACIÓN =====

/**
 * Genera un número de comprobante
 */
export async function generateComprobanteNumber(prefix: string): Promise<string> {
  const { pool } = await import('@/lib/db');
  
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Obtener el último número del mes actual
  const query = `
    SELECT nro_comprobante 
    FROM (
      SELECT nro_comprobante FROM pedido_compra WHERE nro_comprobante LIKE $1
      UNION ALL
      SELECT nro_comprobante FROM presupuesto_proveedor WHERE nro_comprobante LIKE $1
      UNION ALL
      SELECT nro_comprobante FROM ordenes_compra WHERE nro_comprobante LIKE $1
      UNION ALL
      SELECT nro_comprobante FROM compra_cabecera WHERE nro_comprobante LIKE $1
    ) AS all_comprobantes
    ORDER BY nro_comprobante DESC
    LIMIT 1
  `;
  
  const pattern = `${prefix}-${year}${month}-%`;
  const result = await pool.query(query, [pattern]);
  
  let nextNumber = 1;
  if (result.rows.length > 0) {
    const lastNumber = result.rows[0].nro_comprobante;
    const match = lastNumber.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `${prefix}-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Genera un número de nota
 */
export async function generateNotaNumber(prefix: string): Promise<string> {
  const { pool } = await import('@/lib/db');
  
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Obtener el último número del mes actual
  const query = `
    SELECT nro_nota 
    FROM (
      SELECT nro_nota FROM nota_credito_cabecera WHERE nro_nota LIKE $1
      UNION ALL
      SELECT nro_nota FROM nota_debito_cabecera WHERE nro_nota LIKE $1
    ) AS all_notas
    ORDER BY nro_nota DESC
    LIMIT 1
  `;
  
  const pattern = `${prefix}-${year}${month}-%`;
  const result = await pool.query(query, [pattern]);
  
  let nextNumber = 1;
  if (result.rows.length > 0) {
    const lastNumber = result.rows[0].nro_nota;
    const match = lastNumber.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `${prefix}-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Genera un número de tracking
 */
export async function generateTrackingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000);
  return `TRK-${year}-${String(random).padStart(4, '0')}`;
}

// ===== FUNCIONES DE CÁLCULO =====

/**
 * Calcula el progreso de una orden
 */
export function calculateProgress(fechaInicio: string, fechaEntrega: string): number {
  const inicio = new Date(fechaInicio);
  const entrega = new Date(fechaEntrega);
  const hoy = new Date();
  
  const totalDias = Math.ceil((entrega.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  const diasTranscurridos = Math.ceil((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  
  if (totalDias <= 0) return 100;
  if (diasTranscurridos <= 0) return 0;
  
  return Math.min(Math.round((diasTranscurridos / totalDias) * 100), 100);
}

/**
 * Calcula los días restantes
 */
export function calculateDaysRemaining(fechaEntrega: string): number {
  const entrega = new Date(fechaEntrega);
  const hoy = new Date();
  
  return Math.ceil((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Determina la prioridad basada en días restantes
 */
export function determinePriority(diasRestantes: number): 'alta' | 'media' | 'baja' {
  if (diasRestantes < 0) return 'alta'; // Vencida
  if (diasRestantes <= 3) return 'alta'; // Por vencer
  if (diasRestantes <= 7) return 'media';
  return 'baja';
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Sanitiza datos para logs de auditoría
 */
export function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  
  // Remover campos sensibles
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  
  return sanitized;
}

/**
 * Formatea un número como moneda
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formatea una fecha
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CR');
}

/**
 * Obtiene el color del estado
 */
export function getEstadoColor(estado: string): string {
  const colores: { [key: string]: string } = {
    'pendiente': 'bg-secondary text-secondary-foreground',
    'aprobado': 'bg-chart-1 text-white',
    'confirmada': 'bg-chart-1 text-white',
    'enviada': 'bg-chart-2 text-white',
    'entregada': 'bg-green-500 text-white',
    'completada': 'bg-green-500 text-white',
    'rechazado': 'bg-destructive text-destructive-foreground',
    'cancelada': 'bg-destructive text-destructive-foreground',
    'anulada': 'bg-destructive text-destructive-foreground',
    'activo': 'bg-green-500 text-white',
    'borrador': 'bg-gray-500 text-white',
    'validado': 'bg-blue-500 text-white',
    'nuevo': 'bg-blue-500 text-white',
    'recibido': 'bg-yellow-500 text-white',
    'vencido': 'bg-red-500 text-white'
  };
  
  return colores[estado] || 'bg-muted text-muted-foreground';
}

/**
 * Obtiene la etiqueta del estado
 */
export function getEstadoLabel(estado: string): string {
  const etiquetas: { [key: string]: string } = {
    'pendiente': 'Pendiente',
    'aprobado': 'Aprobado',
    'confirmada': 'Confirmada',
    'enviada': 'Enviada',
    'entregada': 'Entregada',
    'completada': 'Completada',
    'rechazado': 'Rechazado',
    'cancelada': 'Cancelada',
    'anulada': 'Anulada',
    'activo': 'Activo',
    'borrador': 'Borrador',
    'validado': 'Validado',
    'nuevo': 'Nuevo',
    'recibido': 'Recibido',
    'vencido': 'Vencido'
  };
  
  return etiquetas[estado] || estado;
}