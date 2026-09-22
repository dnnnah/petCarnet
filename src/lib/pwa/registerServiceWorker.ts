/**
 * Registro del service worker (FASE 7).
 *
 * Infraestructura nativa, sin dependencias. Tokens de navegador solo dentro
 * de guards SSRR-safe; el registro se limita a producción para no interferir
 * con `next dev` ni con el cacheado de desarrollo.
 */

export const SERVICE_WORKER_PATH = "/sw.js";

export function isServiceWorkerRegistrationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.serviceWorker)
  );
}

export function shouldRegisterServiceWorker(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Registra el service worker si el entorno lo soporta.
 * Devuelve la registration, o `null` si no aplica/falla. Nunca lanza.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!shouldRegisterServiceWorker()) {
    return null;
  }

  if (!isServiceWorkerRegistrationSupported()) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
      scope: "/",
    });
  } catch {
    return null;
  }
}