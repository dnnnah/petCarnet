/**
 * Contratos mínimos de conectividad de red (FASE 7).
 *
 * `navigator.onLine` es un **indicador de red del dispositivo**, no una verdad
 * sobre la conectividad con un servidor. Esta capa solo expone:
 *  - lectura SSRR-safe de la API del navegador (`getBrowserOnline`)
 *  - mapeo puro a un estado explícito (`resolveConnectivityStatus`)
 *
 * No contiene lógica de negocio ni suscripciones a eventos; el hook
 * `useOnlineStatus` (capa cliente) reacciona a `online`/`offline`.
 */

export type ConnectivityStatus = "online" | "offline" | "unknown";

/**
 * Lee `navigator.onLine` de forma SSRR-safe.
 * Devuelve `null` cuando no hay navegador (SSR) → la aplicación debe usar
 * `"unknown"` en ese caso.
 */
export function getBrowserOnline(): boolean | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  try {
    const value = navigator.onLine;
    return typeof value === "boolean" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Mapeo puro del indicador del dispositivo a un estado explícito.
 * - `true` → `"online"`
 * - `false` → `"offline"`
 * - `null`/`undefined` (SSR o API no disponible) → `"unknown"`
 */
export function resolveConnectivityStatus(
  online: boolean | null | undefined,
): ConnectivityStatus {
  if (typeof online !== "boolean") {
    return "unknown";
  }
  return online ? "online" : "offline";
}