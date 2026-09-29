"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, CloudOff } from "lucide-react";
import {
  getConnectivitySnapshot,
  getServerConnectivitySnapshot,
  subscribeConnectivity,
  type ConnectivitySnapshot,
} from "@/lib/pwa/connectivityStore";
import { OFFLINE_BANNER_COPY, OFFLINE_RETURNED_COPY } from "@/lib/pwa/copy";

/**
 * Estado de conexión (FASE 7B).
 *
 * Cuando hay conexión y nunca se perdió, no renderiza nada: no hay banda, ni
 * punto, ni espacio reservado. En campo la señal suele ser buena y un "todo
 * bien" permanente solo roba altura y distrae. La banda aparece al perder la
 * conexión, se retira sola al recuperarla, y avisa brevemente de que volvió.
 *
 * Los cambios se anuncian con `role="status"`, que es una región viva cortés:
 * se lee sin robar el foco ni cortar lo que la persona está haciendo.
 *
 * El estado sale del store de `connectivityStore` en vez de un `useEffect` con
 * `useState`: así no hay render en cascada por transición, el objeto del snapshot
 * es estable entre renders y no puede haber un banner que parpadee.
 *
 * El copy es deliberadamente modesto y no promete nada: dice "sin conexión" y
 * qué se puede seguir viendo, nunca que algo se sincronizará después.
 */
export function OfflineStatus() {
  const snapshot = useSyncExternalStore(
    subscribeConnectivity,
    getConnectivitySnapshot,
    getServerConnectivitySnapshot
  );

  return <OfflineStatusView snapshot={snapshot} />;
}

type OfflineStatusViewProps = {
  snapshot: ConnectivitySnapshot;
};

/**
 * Presentación pura de la banda, separada del store a propósito.
 *
 * No es una abstracción gratuita: durante SSR y en el primer render cliente el
 * snapshot es `unknown`, así que el componente con hooks **siempre** rendería
 * `null` en un render de servidor y su marcado sería imposible de testear. Al
 * separar el estado, la banda se puede renderizar directamente con cada fase y
 * comprobar que avisa de lo que debe, sin necesitar un navegador.
 */
export function OfflineStatusView({ snapshot }: OfflineStatusViewProps) {
  const { phase, recovered } = snapshot;

  // Sin estado conocido no se dibuja nada, y no puede haber hydration mismatch.
  if (phase === "unknown") return null;
  if (phase === "online" && !recovered) return null;

  const isOffline = phase === "offline";

  return (
    <div
      role="status"
      aria-live="polite"
      data-pwa-status={isOffline ? "offline" : "recovered"}
      className={
        isOffline
          ? "border-b border-warning-rule bg-warning-soft"
          : "border-b border-success-rule bg-success-soft"
      }
    >
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
        <span
          aria-hidden="true"
          className={
            isOffline
              ? "grid h-7 w-7 shrink-0 place-items-center rounded-md bg-warning-soft text-warning ring-1 ring-inset ring-warning-rule"
              : "grid h-7 w-7 shrink-0 place-items-center rounded-md bg-success-soft text-success ring-1 ring-inset ring-success-rule"
          }
        >
          {isOffline ? <CloudOff size={16} /> : <Check size={16} />}
        </span>

        <p className="min-w-0 flex-1 leading-6">
          <span
            className={
              isOffline ? "font-semibold text-warning" : "font-semibold text-success"
            }
          >
            {isOffline ? OFFLINE_BANNER_COPY.titulo : OFFLINE_RETURNED_COPY.titulo}
          </span>
          <span className="ml-1.5 text-ink-2">
            {isOffline ? OFFLINE_BANNER_COPY.cuerpo : OFFLINE_RETURNED_COPY.cuerpo}
          </span>
        </p>

        {isOffline ? (
          <Link
            href="/"
            className="-my-1 inline-flex min-h-9 shrink-0 items-center rounded-xs px-2 text-sm font-semibold text-warning underline underline-offset-4 transition-colors hover:text-ink"
          >
            {OFFLINE_BANNER_COPY.accion}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
