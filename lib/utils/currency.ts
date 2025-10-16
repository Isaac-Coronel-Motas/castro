/**
 * Utilidades para formateo de moneda paraguaya (PYG)
 */

/**
 * Formatea un número como moneda paraguaya (PYG)
 * @param amount - Cantidad a formatear
 * @returns String formateado con PYG
 */
export function formatCurrency(amount: number): string {
  return `PYG ${amount.toLocaleString('es-PY')}`;
}

/**
 * Formatea un número como moneda paraguaya usando Intl.NumberFormat
 * @param amount - Cantidad a formatear
 * @returns String formateado con símbolo de moneda
 */
export function formatCurrencyWithSymbol(amount: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formatea un número como moneda paraguaya simple (solo PYG + número)
 * @param amount - Cantidad a formatear
 * @returns String formateado como "PYG 150,000"
 */
export function formatCurrencySimple(amount: number): string {
  return `PYG ${amount.toLocaleString('es-PY')}`;
}
