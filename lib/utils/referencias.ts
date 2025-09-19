import { 
  ReferenciasValidationResult, 
  ReferenciasValidationError,
  CreateProveedorRequest,
  CreateProductoRequest,
  CreateCategoriaRequest,
  CreateClienteRequest,
  CreateMarcaRequest,
  CreateTipoServicioRequest,
  CreateServicioRequest
} from '@/lib/types/referencias';

// ===== VALIDACIONES GENERALES =====

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de teléfono (paraguayo)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+595|0)?[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valida formato de RUC paraguayo
 */
export function isValidRUC(ruc: string): boolean {
  // RUC paraguayo: 6-8 dígitos + 1 dígito verificador
  const rucRegex = /^[0-9]{6,8}-[0-9]$/;
  return rucRegex.test(ruc);
}

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

// ===== VALIDACIONES DE PROVEEDORES =====

export function validateProveedorData(data: CreateProveedorRequest): ReferenciasValidationResult {
  const errors: ReferenciasValidationError[] = [];

  if (!data.nombre_proveedor || data.nombre_proveedor.trim().length < 2) {
    errors.push({ 
      field: 'nombre_proveedor', 
      message: 'El nombre del proveedor es requerido y debe tener al menos 2 caracteres' 
    });
  }

  if (data.correo && !isValidEmail(data.correo)) {
    errors.push({ 
      field: 'correo', 
      message: 'El formato del email no es válido' 
    });
  }

  if (data.telefono && !isValidPhone(data.telefono)) {
    errors.push({ 
      field: 'telefono', 
      message: 'El formato del teléfono no es válido' 
    });
  }

  if (data.ruc && !isValidRUC(data.ruc)) {
    errors.push({ 
      field: 'ruc', 
      message: 'El formato del RUC no es válido (formato: 12345678-9 o 123456-9)' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE PRODUCTOS =====

export function validateProductoData(data: CreateProductoRequest): ReferenciasValidationResult {
  const errors: ReferenciasValidationError[] = [];

  if (!data.nombre_producto || data.nombre_producto.trim().length < 2) {
    errors.push({ 
      field: 'nombre_producto', 
      message: 'El nombre del producto es requerido y debe tener al menos 2 caracteres' 
    });
  }

  if (data.precio_unitario !== undefined && !isNonNegativeNumber(data.precio_unitario)) {
    errors.push({ 
      field: 'precio_unitario', 
      message: 'El precio unitario debe ser un número no negativo' 
    });
  }

  if (data.stock !== undefined && !isNonNegativeNumber(data.stock)) {
    errors.push({ 
      field: 'stock', 
      message: 'El stock debe ser un número no negativo' 
    });
  }

  if (data.precio_costo !== undefined && !isNonNegativeNumber(data.precio_costo)) {
    errors.push({ 
      field: 'precio_costo', 
      message: 'El precio de costo debe ser un número no negativo' 
    });
  }

  if (data.precio_venta !== undefined && !isNonNegativeNumber(data.precio_venta)) {
    errors.push({ 
      field: 'precio_venta', 
      message: 'El precio de venta debe ser un número no negativo' 
    });
  }

  if (data.stock_minimo !== undefined && !isNonNegativeNumber(data.stock_minimo)) {
    errors.push({ 
      field: 'stock_minimo', 
      message: 'El stock mínimo debe ser un número no negativo' 
    });
  }

  if (data.stock_maximo !== undefined && !isNonNegativeNumber(data.stock_maximo)) {
    errors.push({ 
      field: 'stock_maximo', 
      message: 'El stock máximo debe ser un número no negativo' 
    });
  }

  if (data.stock_minimo !== undefined && data.stock_maximo !== undefined && 
      data.stock_minimo > data.stock_maximo) {
    errors.push({ 
      field: 'stock_minimo', 
      message: 'El stock mínimo no puede ser mayor al stock máximo' 
    });
  }

  if (data.cod_product !== undefined && !isPositiveNumber(data.cod_product)) {
    errors.push({ 
      field: 'cod_product', 
      message: 'El código de producto debe ser un número positivo' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE CATEGORÍAS =====

export function validateCategoriaData(data: CreateCategoriaRequest): ReferenciasValidationResult {
  const errors: ReferenciasValidationError[] = [];

  if (!data.nombre_categoria || data.nombre_categoria.trim().length < 2) {
    errors.push({ 
      field: 'nombre_categoria', 
      message: 'El nombre de la categoría es requerido y debe tener al menos 2 caracteres' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE CLIENTES =====

export function validateClienteData(data: CreateClienteRequest): ReferenciasValidationResult {
  const errors: ReferenciasValidationError[] = [];

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push({ 
      field: 'nombre', 
      message: 'El nombre del cliente es requerido y debe tener al menos 2 caracteres' 
    });
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push({ 
      field: 'email', 
      message: 'El formato del email no es válido' 
    });
  }

  if (data.telefono && !isValidPhone(data.telefono)) {
    errors.push({ 
      field: 'telefono', 
      message: 'El formato del teléfono no es válido' 
    });
  }

  if (data.ruc && !isValidRUC(data.ruc)) {
    errors.push({ 
      field: 'ruc', 
      message: 'El formato del RUC no es válido (formato: 12345678-9 o 123456-9)' 
    });
  }

  if (data.estado && !['activo', 'inactivo', 'suspendido'].includes(data.estado)) {
    errors.push({ 
      field: 'estado', 
      message: 'El estado debe ser: activo, inactivo o suspendido' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE MARCAS =====

export function validateMarcaData(data: CreateMarcaRequest): ReferenciasValidationResult {
  const errors: ReferenciasValidationError[] = [];

  if (!data.descripcion || data.descripcion.trim().length < 2) {
    errors.push({ 
      field: 'descripcion', 
      message: 'La descripción de la marca es requerida y debe tener al menos 2 caracteres' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE TIPOS DE SERVICIO =====

export function validateTipoServicioData(data: CreateTipoServicioRequest): ReferenciasValidationResult {
  const errors: ReferenciasValidationError[] = [];

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push({ 
      field: 'nombre', 
      message: 'El nombre del tipo de servicio es requerido y debe tener al menos 2 caracteres' 
    });
  }

  if (!data.descripcion || data.descripcion.trim().length < 2) {
    errors.push({ 
      field: 'descripcion', 
      message: 'La descripción del tipo de servicio es requerida y debe tener al menos 2 caracteres' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== VALIDACIONES DE SERVICIOS =====

export function validateServicioData(data: CreateServicioRequest): ReferenciasValidationResult {
  const errors: ReferenciasValidationError[] = [];

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push({ 
      field: 'nombre', 
      message: 'El nombre del servicio es requerido y debe tener al menos 2 caracteres' 
    });
  }

  if (data.precio_base !== undefined && !isNonNegativeNumber(data.precio_base)) {
    errors.push({ 
      field: 'precio_base', 
      message: 'El precio base debe ser un número no negativo' 
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
  defaultSort: string = 'nombre'
): string {
  const validSortFields = [
    'nombre', 'nombre_producto', 'nombre_categoria', 'nombre_proveedor', 
    'descripcion', 'precio_unitario', 'stock', 'estado', 'activo',
    'categoria_id', 'marca_id', 'producto_id', 'proveedor_id', 'cliente_id'
  ];
  
  // Mapear campos que no existen en las tablas a campos válidos
  const fieldMapping: { [key: string]: string } = {
    'created_at': defaultSort,
    'updated_at': defaultSort,
    'id': defaultSort
  };
  
  let field = sortBy;
  if (fieldMapping[sortBy]) {
    field = fieldMapping[sortBy];
  } else if (!validSortFields.includes(sortBy)) {
    field = defaultSort;
  }
  
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
 * Formatea un número de teléfono paraguayo
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+595 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Formatea un RUC paraguayo
 */
export function formatRUC(ruc: string): string {
  const cleaned = ruc.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 8)}-${cleaned.slice(8)}`;
  }
  return ruc;
}

// ===== UTILIDADES DE VALIDACIÓN DE DEPENDENCIAS =====

/**
 * Verifica si una categoría puede ser eliminada
 */
export function canDeleteCategoria(productosCount: number): boolean {
  return productosCount === 0;
}

/**
 * Verifica si una marca puede ser eliminada
 */
export function canDeleteMarca(productosCount: number): boolean {
  return productosCount === 0;
}

/**
 * Verifica si un tipo de servicio puede ser eliminado
 */
export function canDeleteTipoServicio(serviciosCount: number): boolean {
  return serviciosCount === 0;
}

/**
 * Verifica si un proveedor puede ser eliminado
 */
export function canDeleteProveedor(comprasCount: number): boolean {
  return comprasCount === 0;
}

/**
 * Verifica si un cliente puede ser eliminado
 */
export function canDeleteCliente(ventasCount: number): boolean {
  return ventasCount === 0;
}

/**
 * Verifica si un servicio puede ser eliminado
 */
export async function canDeleteServicio(servicioId: number): Promise<{ canDelete: boolean; reason?: string }> {
  try {
    const { pool } = await import('@/lib/db');
    
    // Verificar si el servicio está siendo usado en presupuestos
    const presupuestosQuery = `
      SELECT COUNT(*) as count 
      FROM presupuesto_servicios ps 
      WHERE ps.servicio_id = $1
    `;
    const presupuestosResult = await pool.query(presupuestosQuery, [servicioId]);
    const presupuestosCount = parseInt(presupuestosResult.rows[0].count);

    if (presupuestosCount > 0) {
      return {
        canDelete: false,
        reason: `No se puede eliminar el servicio porque está siendo usado en ${presupuestosCount} presupuesto(s)`
      };
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Error verificando dependencias del servicio:', error);
    return {
      canDelete: false,
      reason: 'Error al verificar dependencias'
    };
  }
}

// ===== UTILIDADES DE LOGGING =====

/**
 * Sanitiza datos para logging, removiendo información sensible
 */
export function sanitizeForLog(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };
  
  // Campos sensibles que deben ser removidos o enmascarados
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Recursivamente sanitizar objetos anidados
  for (const key in sanitized) {
    if (sanitized[key] && typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLog(sanitized[key]);
    }
  }

  return sanitized;
}