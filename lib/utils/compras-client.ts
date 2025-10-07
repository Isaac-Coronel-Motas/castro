// ===== FUNCIONES PARA AJUSTES DE INVENTARIO (CLIENTE) =====

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

/**
 * Determina el tipo de movimiento basado en la cantidad ajustada (CLIENTE)
 */
export function determineMovementTypeClient(cantidadAjustada: number): string {
  if (cantidadAjustada > 0) {
    return 'entrada';
  } else if (cantidadAjustada < 0) {
    return 'salida';
  } else {
    return 'ajuste';
  }
}

// ===== FUNCIONES PARA NOTAS DE CRÉDITO/DÉBITO (CLIENTE) =====

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