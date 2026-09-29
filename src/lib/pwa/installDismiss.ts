/**
 * Persistencia del descarte del CTA de instalación (FASE 7B).
 *
 * Es la única pieza de infraestructura de esta fase que sí habla con
 * `localStorage`, y lo hace a través de `src/lib/pwa/storage.ts` (capa de A) en
 * lugar de abrir su propio acceso. Así, storage bloqueado, lleno o corrupto se
 * comportan igual que en el resto del producto: la aplicación no se rompe.
 */

import { safeGetItem, safeSetItem, type StorageLike } from "@/lib/pwa/storage";
import { INSTALL_DISMISS_KEY } from "@/lib/pwa/install";

/**
 * `true` si este dispositivo ya descartó el CTA. Storage ausente (SSR) o
 * bloqueado se leen como `false`: es preferible preguntar una vez de más que
 * ocultar un CTA que sí era relevante.
 */
export function readInstallDismissed(storage: StorageLike | null | undefined): boolean {
  return safeGetItem(storage, INSTALL_DISMISS_KEY) === "1";
}

/** Registra el descarte. `false` devuelve el CTA a su estado normal. */
export function writeInstallDismissed(
  storage: StorageLike | null | undefined,
  dismissed: boolean
): void {
  if (!dismissed) {
    safeSetItem(storage, INSTALL_DISMISS_KEY, "0");
    return;
  }
  safeSetItem(storage, INSTALL_DISMISS_KEY, "1");
}
