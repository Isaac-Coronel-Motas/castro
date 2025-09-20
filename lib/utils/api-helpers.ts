// Utilidades para APIs - Funciones de ayuda para consultas SQL

export interface SearchField {
  field: string;
  operator?: 'ILIKE' | 'LIKE' | '=' | '!=' | '>' | '<' | '>=' | '<=';
}

export interface SearchResult {
  whereClause: string;
  params: any[];
}

export interface OrderByResult {
  orderByClause: string;
}

/**
 * Construye la cláusula WHERE para búsquedas
 * @param searchFields Array de campos donde buscar
 * @param searchTerm Término de búsqueda
 * @param additionalConditions Condiciones adicionales
 * @returns Objeto con whereClause y params
 */
export function buildSearchWhereClause(
  searchFields: string[],
  searchTerm: string = '',
  additionalConditions: string[] = []
): SearchResult {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramCount = 0;

  // Agregar condiciones adicionales primero
  additionalConditions.forEach(condition => {
    conditions.push(condition);
  });

  // Agregar búsqueda si hay término de búsqueda
  if (searchTerm && searchTerm.trim()) {
    paramCount++;
    const searchCondition = searchFields
      .map(field => `${field} ILIKE $${paramCount}`)
      .join(' OR ');
    
    if (searchCondition) {
      conditions.push(`(${searchCondition})`);
      params.push(`%${searchTerm.trim()}%`);
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  return {
    whereClause,
    params
  };
}

/**
 * Construye la cláusula ORDER BY
 * @param sortBy Campo por el cual ordenar
 * @param sortOrder Orden (asc/desc)
 * @param defaultSort Campo por defecto si sortBy no es válido
 * @returns Objeto con orderByClause
 */
export function buildOrderByClause(
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  defaultSort: string = 'created_at'
): OrderByResult {
  // Validar que sortOrder sea válido
  const validOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) 
    ? sortOrder.toLowerCase() 
    : 'desc';

  // Usar el campo proporcionado o el por defecto
  const field = sortBy || defaultSort;
  
  const orderByClause = `ORDER BY ${field} ${validOrder}`;
  
  return {
    orderByClause
  };
}

/**
 * Valida parámetros de paginación
 * @param page Número de página
 * @param limit Límite de registros por página
 * @returns Objeto con page y limit validados
 */
export function validatePaginationParams(page: number, limit: number): { page: number; limit: number } {
  const validatedPage = Math.max(1, Math.floor(page) || 1);
  const validatedLimit = Math.min(100, Math.max(1, Math.floor(limit) || 10));
  
  return {
    page: validatedPage,
    limit: validatedLimit
  };
}

/**
 * Construye parámetros de paginación para SQL
 * @param page Número de página
 * @param limit Límite de registros por página
 * @returns Objeto con limit y offset
 */
export function buildPaginationParams(page: number, limit: number): { limit: number; offset: number } {
  const { page: validPage, limit: validLimit } = validatePaginationParams(page, limit);
  
  return {
    limit: validLimit,
    offset: (validPage - 1) * validLimit
  };
}

/**
 * Sanitiza un término de búsqueda para prevenir inyección SQL
 * @param searchTerm Término de búsqueda
 * @returns Término sanitizado
 */
export function sanitizeSearchTerm(searchTerm: string): string {
  if (!searchTerm) return '';
  
  // Remover caracteres peligrosos pero mantener espacios y caracteres normales
  return searchTerm
    .replace(/[;'"\\]/g, '') // Remover caracteres peligrosos
    .trim()
    .substring(0, 100); // Limitar longitud
}

/**
 * Construye filtros de fecha
 * @param fechaDesde Fecha desde
 * @param fechaHasta Fecha hasta
 * @param campoFecha Campo de fecha en la tabla
 * @returns Condiciones de fecha y parámetros
 */
export function buildDateFilters(
  fechaDesde?: string,
  fechaHasta?: string,
  campoFecha: string = 'fecha'
): { conditions: string[]; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramCount = 0;

  if (fechaDesde) {
    paramCount++;
    conditions.push(`${campoFecha} >= $${paramCount}`);
    params.push(fechaDesde);
  }

  if (fechaHasta) {
    paramCount++;
    conditions.push(`${campoFecha} <= $${paramCount}`);
    params.push(fechaHasta);
  }

  return { conditions, params };
}

/**
 * Construye filtros numéricos
 * @param valorMin Valor mínimo
 * @param valorMax Valor máximo
 * @param campo Campo numérico en la tabla
 * @returns Condiciones numéricas y parámetros
 */
export function buildNumericFilters(
  valorMin?: number,
  valorMax?: number,
  campo: string = 'monto'
): { conditions: string[]; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramCount = 0;

  if (valorMin !== undefined && valorMin !== null) {
    paramCount++;
    conditions.push(`${campo} >= $${paramCount}`);
    params.push(valorMin);
  }

  if (valorMax !== undefined && valorMax !== null) {
    paramCount++;
    conditions.push(`${campo} <= $${paramCount}`);
    params.push(valorMax);
  }

  return { conditions, params };
}

/**
 * Valida campos de ordenamiento contra una lista de campos permitidos
 * @param sortBy Campo por el cual ordenar
 * @param allowedFields Campos permitidos para ordenamiento
 * @param defaultField Campo por defecto
 * @returns Campo validado para ordenamiento
 */
export function validateSortField(
  sortBy: string,
  allowedFields: string[],
  defaultField: string = 'created_at'
): string {
  if (!sortBy) return defaultField;
  
  // Verificar si el campo está en la lista de permitidos
  if (allowedFields.includes(sortBy)) {
    return sortBy;
  }
  
  // Si no está permitido, usar el campo por defecto
  return defaultField;
}

/**
 * Construye respuesta de paginación estándar
 * @param data Datos de la consulta
 * @param page Página actual
 * @param limit Límite por página
 * @param total Total de registros
 * @returns Objeto de paginación
 */
export function buildPaginationResponse(
  data: any[],
  page: number,
  limit: number,
  total: number
) {
  return {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
    has_next: page < Math.ceil(total / limit),
    has_prev: page > 1
  };
}
