/**
 * Reglas puras de fechas (FASE 5).
 *
 * Solo manipulan fechas en notación ISO `YYYY-MM-DD` usando comparación
 * lexicográfica (equivalente a orden cronológico). No usan husos horarios
 * ni `Date` con hora local: esto mantiene los cálculos deterministas y
 * testables mediante una "fecha de hoy" inyectable.
 */

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE_PATTERN.test(value);
}

/**
 * Normaliza un valor a fecha ISO válida o null. Tolera espacios, strings
 * vacíos, null/undefined y formatos no ISO (se descartan, no se corrigen).
 */
export function normalizeIsoDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return isIsoDate(trimmed) ? trimmed : null;
}

/**
 * Fecha "de hoy" inyectable. Si el caller no la provee, usa la fecha UTC del
 * día actual; en pruebas SIEMPRE debe inyectarse para mantener determinismo.
 */
export function todayIsoDate(today?: string): string {
  const normalized = normalizeIsoDate(today);
  if (normalized !== null) {
    return normalized;
  }
  return new Date().toISOString().slice(0, 10);
}

/**
 * Compara dos fechas ISO válidas. Devuelve negativo si `a` es anterior a
 * `b`, positivo si es posterior y 0 si son iguales. Comparación
 * lexicográfica segura para ISO `YYYY-MM-DD`.
 */
export function compareIsoDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}