// ===== FUNCIONES PARA PEDIDOS DE COMPRA (CLIENTE) =====

/**
 * Obtiene el color del estado de un pedido de compra
 */
export function getEstadoColor(estado: string): string {
  const colores: { [key: string]: string } = {
    'borrador': 'bg-gray-500 text-white',
    'pendiente': 'bg-yellow-500 text-white',
    'confirmado': 'bg-blue-500 text-white',
    'recibido': 'bg-green-500 text-white',
    'anulado': 'bg-red-500 text-white',
    'cancelado': 'bg-red-500 text-white'
  };
  return colores[estado] || 'bg-muted text-muted-foreground';
}

/**
 * Obtiene la etiqueta del estado de un pedido de compra
 */
export function getEstadoLabel(estado: string): string {
  const etiquetas: { [key: string]: string } = {
    'borrador': 'Borrador',
    'pendiente': 'Pendiente',
    'confirmado': 'Confirmado',
    'recibido': 'Recibido',
    'anulado': 'Anulado',
    'cancelado': 'Cancelado'
  };
  return etiquetas[estado] || estado;
}

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

// ===== FUNCIONES PARA ÓRDENES DE COMPRA (CLIENTE) =====

/**
 * Calcula el progreso de una orden de compra basado en fechas
 */
export function calculateProgress(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const hoy = new Date();
  
  const totalDias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  const diasTranscurridos = Math.ceil((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  
  if (totalDias <= 0) return 100;
  if (diasTranscurridos <= 0) return 0;
  
  const progreso = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));
  return Math.round(progreso);
}

/**
 * Calcula los días restantes hasta una fecha
 */
export function calculateDaysRemaining(fechaFin: string): number {
  const fin = new Date(fechaFin);
  const hoy = new Date();
  
  const diferenciaTiempo = fin.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
  
  return diasRestantes;
}

/**
 * Determina la prioridad basada en días restantes
 */
export function determinePriority(diasRestantes: number): string {
  if (diasRestantes < 0) return 'alta'; // Vencida
  if (diasRestantes <= 3) return 'alta'; // Por vencer
  if (diasRestantes <= 7) return 'media'; // Próxima a vencer
  return 'baja'; // Vigente
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