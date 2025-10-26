// Utilidades del servidor para el módulo de compras
// Este archivo solo debe ser usado en el servidor (APIs)

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

// ===== VALIDACIÓN DE DATOS DEL SERVIDOR =====

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

  if (data.estado && !['pendiente', 'procesado', 'cancelado'].includes(data.estado)) {
    errors.estado = 'El estado no es válido';
  }

  if (data.items && data.items.length === 0) {
    errors.items = 'Debe agregar al menos un producto';
  }

  if (data.proveedores && data.proveedores.length === 0) {
    errors.proveedores = 'Debe agregar al menos un proveedor';
  }

  // Validar items
  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!item.producto_id || item.producto_id <= 0) {
        errors[`items.${index}.producto_id`] = 'El producto es requerido';
      }
      if (!item.cantidad || item.cantidad <= 0) {
        errors[`items.${index}.cantidad`] = 'La cantidad debe ser mayor a 0';
      }
      if (item.precio_unitario !== undefined && item.precio_unitario < 0) {
        errors[`items.${index}.precio_unitario`] = 'El precio no puede ser negativo';
      }
    });
  }

  // Validar proveedores
  if (data.proveedores && data.proveedores.length > 0) {
    data.proveedores.forEach((proveedor, index) => {
      if (!proveedor.proveedor_id || proveedor.proveedor_id <= 0) {
        errors[`proveedores.${index}.proveedor_id`] = 'El proveedor es requerido';
      }
      if (proveedor.fecha_envio && isNaN(Date.parse(proveedor.fecha_envio))) {
        errors[`proveedores.${index}.fecha_envio`] = 'La fecha de envío no es válida';
      }
    });
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

  if (data.estado && !['nuevo', 'pendiente', 'enviado', 'recibido', 'aprobado', 'rechazado', 'vencido'].includes(data.estado)) {
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
export async function generateComprobanteNumber(prefix: string, pedidoId?: number): Promise<string> {
  const { pool } = await import('@/lib/db');
  
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Determinar la tabla según el prefijo
  let tableName = 'pedido_compra'; // default
  if (prefix === 'PP') {
    tableName = 'presupuesto_proveedor';
  } else if (prefix === 'OC') {
    tableName = 'ordenes_compra';
  } else if (prefix === 'CC') {
    tableName = 'compra_cabecera';
  }
  
  // Obtener el último número del mes actual de la tabla correspondiente
  const query = `
    SELECT nro_comprobante 
    FROM ${tableName} 
    WHERE nro_comprobante LIKE $1
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
 * Genera un número de tracking
 */
export async function generateTrackingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000);
  return `TRK-${year}-${String(random).padStart(4, '0')}`;
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Mapea estados de pedido para compatibilidad con el enum de la base de datos
 */
export function mapEstadoForDatabase(estado: string): string {
  const estadoMap: { [key: string]: string } = {
    // Estados válidos del enum estado_pedido_p
    'pendiente': 'pendiente',
    'procesado': 'procesado',
    'cancelado': 'cancelado',
    
    // Estados de presupuestos (diferentes enums)
    'pendiente': 'pendiente',
    'aprobado': 'aprobado',
    'rechazado': 'rechazado',
    'nuevo': 'nuevo',
    'enviado': 'enviado',
    'recibido': 'recibido',
    'vencido': 'vencido',
    
    // Estados de órdenes de compra (diferentes enums)
    'aprobada': 'aprobada',
    'rechazada': 'rechazada',
    'cancelada': 'cancelada'
  };
  
  return estadoMap[estado] || estado;
}

/**
 * Mapea estados de la base de datos para mostrar en el frontend
 */
export function mapEstadoForFrontend(estado: string): string {
  const estadoMap: { [key: string]: string } = {
    // Estados válidos del enum estado_pedido_p
    'pendiente': 'pendiente',
    'procesado': 'procesado',
    'cancelado': 'cancelado',
    
    // Estados de presupuestos (diferentes enums)
    'pendiente': 'pendiente',
    'aprobado': 'aprobado',
    'rechazado': 'rechazado',
    'nuevo': 'nuevo',
    'enviado': 'enviado',
    'recibido': 'recibido',
    'vencido': 'vencido',
    
    // Estados de órdenes de compra (diferentes enums)
    'aprobada': 'aprobada',
    'rechazada': 'rechazada',
    'cancelada': 'cancelada'
  };
  
  return estadoMap[estado] || estado;
}

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
