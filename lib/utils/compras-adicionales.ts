import { ValidationResult } from '@/lib/types/compras-adicionales';

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
  defaultField: string = 'id'
): string {
  const validSortFields = [
    'id', 'fecha', 'fecha_pedido', 'fecha_presupuesto', 'fecha_orden', 'fecha_compra',
    'fecha_registro', 'estado', 'monto', 'monto_total', 'nombre', 'descripcion',
    'fecha_entrega', 'progreso', 'prioridad', 'nro_comprobante', 'nro_nota'
  ];
  
  const field = validSortFields.includes(sortBy) ? sortBy : defaultField;
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
  
  return `ORDER BY ${field} ${order}`;
}

// Funciones de validación
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

// Funciones de generación
export async function generateNotaNumber(prefix: string): Promise<string> {
  const { pool } = await import('@/lib/db');
  
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
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

// Funciones de utilidad
export function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  return sanitized;
}