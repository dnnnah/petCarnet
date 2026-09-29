/**
 * Tienda de conectividad para la capa de UI (FASE 7B).
 *
 * `useOnlineStatus` (Fase 7A) responde "¿hay red ahora?". Esto responde además
 * "¿hace un instante no la había?", que es lo que necesita el aviso de
 * conexión recuperada.
 *
 * Vive fuera de React a propósito. Derivar la recuperación con un
 * `useState` + `useEffect` obliga a pintar un estado provisional y provoca un
 * render en cascada en cada transición; con un store externo el valor es único,
 * estable entre renders y comparable con `Object.is`, que es lo que
 * `useSyncExternalStore` exige para no entrar en bucle.
 *
 * El store es infraestructura pura: sin React, sin Next, sin navegador en el
 * camino de lectura. `Date.now()` solo se usa para numerar la transición.
 */

import { getBrowserOnline, resolveConnectivityStatus, type ConnectivityStatus } from "@/lib/pwa/connectivity";

/** Cuánto tiempo se mantiene el aviso de "volvió la conexión". */
export const RECOVERY_NOTICE_MS = 6000;

export type ConnectivitySnapshot = {
  phase: ConnectivityStatus;
  /** Pasó de estar sin conexión a estar en línea en esta sesión. */
  recovered: boolean;
};

/**
 * Instantánea de servidor y de primer render: indeterminada, sin recuperación.
 * Congelada para que la identidad del objeto sea estable.
 */
const UNKNOWN_SNAPSHOT: ConnectivitySnapshot = Object.freeze({
  phase: "unknown" as const,
  recovered: false,
});

type Listener = () => void;

const listeners = new Set<Listener>();

let state: ConnectivitySnapshot = UNKNOWN_SNAPSHOT;
let recoveryTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function cancelRecoveryTimer() {
  if (recoveryTimer !== null) {
    clearTimeout(recoveryTimer);
    recoveryTimer = null;
  }
}

function scheduleRecoveryClear() {
  cancelRecoveryTimer();
  recoveryTimer = setTimeout(() => {
    recoveryTimer = null;
    if (!state.recovered) return;
    state = { phase: state.phase, recovered: false };
    emit();
  }, RECOVERY_NOTICE_MS);
}

function handleOnline() {
  const wasOffline = state.phase === "offline";
  state = { phase: "online", recovered: wasOffline };

  if (wasOffline) {
    scheduleRecoveryClear();
  } else {
    cancelRecoveryTimer();
  }
  emit();
}

function handleOffline() {
  cancelRecoveryTimer();
  state = { phase: "offline", recovered: false };
  emit();
}

/** Vacía el store. Solo lo usan los tests; la app nunca lo llama. */
export function resetConnectivityStore(): void {
  cancelRecoveryTimer();
  state = UNKNOWN_SNAPSHOT;
}

export function subscribeConnectivity(listener: Listener): () => void {
  if (listeners.size === 0) {
    // Solo el primer suscriptor pone los listeners: añadir y quitar el store en
    // el árbol no puede dejar suscripciones huérfanas en `window`.
    if (typeof window !== "undefined") {
      state = { phase: resolveConnectivityStatus(getBrowserOnline()), recovered: false };
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
  };
}

export function getConnectivitySnapshot(): ConnectivitySnapshot {
  return state;
}

export function getServerConnectivitySnapshot(): ConnectivitySnapshot {
  return UNKNOWN_SNAPSHOT;
}

/** Marca la recuperación como ya mostrada, sin tocar la fase de red. */
export function acknowledgeRecovery(): void {
  cancelRecoveryTimer();
  if (!state.recovered) return;
  state = { phase: state.phase, recovered: false };
  emit();
}
