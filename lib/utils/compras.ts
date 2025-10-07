// Utilidades básicas para el módulo de compras
// Este archivo contiene funciones que pueden usarse tanto en cliente como servidor

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

// ===== VALIDACIÓN DE DATOS BÁSICA =====

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

  if (data.estado && !['pendiente', 'procesado', 'cancelado', 'aprobado'].includes(data.estado)) {
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

  // proveedor_id es opcional - solo se requiere si se proporciona
  if (data.proveedor_id !== undefined && data.proveedor_id <= 0) {
    errors.proveedor_id = 'El proveedor debe ser válido';
  }

  if (data.fecha_presupuesto && isNaN(Date.parse(data.fecha_presupuesto))) {
    errors.fecha_presupuesto = 'La fecha del presupuesto no es válida';
  }

  if (data.valido_hasta && isNaN(Date.parse(data.valido_hasta))) {
    errors.valido_hasta = 'La fecha de validez no es válida';
  }

  if (data.estado && !['nuevo', 'pendiente', 'aprobado', 'rechazado'].includes(data.estado)) {
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

  if (data.estado && !['pendiente', 'aprobada', 'rechazada', 'cancelada'].includes(data.estado)) {
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

// ===== FUNCIONES DE UTILIDAD BÁSICAS =====

/**
 * Verifica si un pedido puede ser procesado (modificado o eliminado)
 */
export function canProcessPedido(estado: string): boolean {
  const estadosProcesables = ['pendiente', 'borrador'];
  return estadosProcesables.includes(estado);
}

/**
 * Mapea estados de pedido para compatibilidad con el enum de la base de datos
 */
export function mapEstadoForDatabase(estado: string): string {
  const estadoMap: { [key: string]: string } = {
    'aprobado': 'procesado',  // Mapear 'aprobado' a 'procesado'
    'rechazado': 'cancelado', // Mapear 'rechazado' a 'cancelado'
    'pendiente': 'pendiente',
    'procesado': 'procesado',
    'cancelado': 'cancelado'
  };
  
  return estadoMap[estado] || estado;
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
    'procesado': 'bg-chart-1 text-white',
    'aprobado': 'bg-chart-1 text-white',
    'cancelado': 'bg-destructive text-destructive-foreground',
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
    'procesado': 'Procesado',
    'aprobado': 'Aprobado',
    'cancelado': 'Cancelado',
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

/**
 * Determina si un presupuesto puede ser procesado (modificado o eliminado)
 */
export function canProcessPresupuesto(estado: string): boolean {
  const estadosProcesables = ['nuevo', 'enviado'];
  return estadosProcesables.includes(estado);
}