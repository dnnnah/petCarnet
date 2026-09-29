"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { OFFLINE_ROUTE_BLOCKED_COPY } from "@/lib/pwa/copy";

type OfflineRouteNoticeProps = {
  /** Ruta interna que no tiene copia local, o `null` si no hay ninguna. */
  blockedPath: string | null;
  onDismiss: () => void;
};

/**
 * Aviso de ruta no disponible sin conexión (FASE 7B).
 *
 * Aparece en lugar de un error de red cuando el guardia detiene un enlace a
 * una sección que este dispositivo nunca abrió. No es una pantalla de error: es
 * el estado real de la PWA sin backend, explicado y con salida.
 *
 * `role="status"` en lugar de `role="alert"`: interrumpe lo que se está
 * leyendo y no hace falta para un aviso que aparece por acción del propio
 * usuario.
 */
export function OfflineRouteNotice({ blockedPath, onDismiss }: OfflineRouteNoticeProps) {
  if (blockedPath === null) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 lg:px-8"
    >
      <div className="rounded-lg border border-l-2 border-info-rule border-l-info bg-info-soft p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          {OFFLINE_ROUTE_BLOCKED_COPY.titulo}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-2">
          {OFFLINE_ROUTE_BLOCKED_COPY.cuerpo}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            onClick={onDismiss}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-on-solid transition-colors hover:bg-brand-hover"
          >
            <Home size={17} aria-hidden="true" />
            {OFFLINE_ROUTE_BLOCKED_COPY.accion}
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex min-h-11 items-center rounded-md bg-surface px-4 text-sm font-semibold text-ink-2 ring-1 ring-inset ring-edge transition-colors hover:bg-sunken hover:text-ink"
          >
            Seguir aquí
          </button>
        </div>
      </div>
    </div>
  );
}
