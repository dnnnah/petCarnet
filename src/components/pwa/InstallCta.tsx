"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { useInstallPrompt } from "@/lib/pwa/useInstallPrompt";
import { resolveInstallCtaVisibility, resolveInstallHintVisibility } from "@/lib/pwa/install";
import { INSTALL_CTA_COPY, INSTALL_MANUAL_COPY } from "@/lib/pwa/copy";

/**
 * Instalación de la PWA (FASE 7B).
 *
 * Solo aparece cuando instalar es realmente posible, y en la forma que el
 * dispositivo permite:
 *
 * 1. **Diálogo nativo** — el navegador emitió `beforeinstallprompt`. Botón que
 *    abre el diálogo del propio sistema.
 * 2. **Instrucciones** — solo en iOS, donde esa API no existe y la única vía es
 *    "Compartir → Añadir a pantalla de inicio". El teléfono más común en campo
 *    no tiene otro camino, y un botón que no instala sería peor que decirlo.
 *
 * En cualquier otro caso no se pinta nada: ni botón falso ni instrucciones
 * inventadas. Si la app ya está instalada, o el usuario lo descartó, no vuelve a
 * aparecer.
 *
 * Vive en el pie: es una mejora, no una urgencia, y arriba competiría con el
 * contenido del carnet.
 */
export function InstallCta() {
  const { canInstall, isInstalled, isSupported, dismissed, install, dismiss, isIos } =
    useInstallPrompt();
  const [busy, setBusy] = useState(false);

  const native = resolveInstallCtaVisibility({
    supported: isSupported,
    promptAvailable: canInstall,
    installed: isInstalled,
    dismissed,
  });

  const hint = resolveInstallHintVisibility({
    installed: isInstalled,
    dismissed,
    ios: isIos,
    promptAvailable: canInstall,
  });

  // El diálogo nativo manda sobre las instrucciones: si puede abrirse, un botón
  // es mejor que un párrafo, y mostrar los dos sería contradictorio.
  const mode = native === "available" ? "native" : hint === "manual" ? "manual" : null;

  async function handleInstall() {
    setBusy(true);
    try {
      await install();
    } finally {
      setBusy(false);
    }
  }

  return <InstallCtaView mode={mode} busy={busy} onInstall={handleInstall} onDismiss={dismiss} />;
}

/** Qué variante se muestra. `null` significa que no se muestra ninguna. */
export type InstallCtaMode = "native" | "manual" | null;

type InstallCtaViewProps = {
  mode: InstallCtaMode;
  busy?: boolean;
  onInstall?: () => void | Promise<unknown>;
  onDismiss: () => void;
};

/**
 * Presentación del CTA, separada de los hooks por el mismo motivo que la banda
 * de conexión: durante SSR no se conoce la capacidad del navegador, así que el
 * componente con hooks siempre renderizaría `null` y su marcado sería
 * imposible de testear. Aquí se puede comprobar cada variante directamente.
 */
export function InstallCtaView({ mode, busy = false, onInstall, onDismiss }: InstallCtaViewProps) {
  if (mode === null) return null;

  const isNative = mode === "native";
  const copy = isNative ? INSTALL_CTA_COPY : INSTALL_MANUAL_COPY;

  return (
    <section
      aria-label={copy.etiquetaGrupo}
      data-pwa-install={mode}
      className={
        isNative
          ? "mt-6 rounded-lg border border-brand-rule bg-brand-soft p-5"
          : "mt-6 rounded-lg border border-rule bg-surface p-5"
      }
    >
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <span
          aria-hidden="true"
          className={
            isNative
              ? "grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand text-on-solid"
              : "grid h-10 w-10 shrink-0 place-items-center rounded-md bg-sunken text-ink-2"
          }
        >
          {isNative ? <Download size={20} /> : <Share2 size={20} />}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-ink">{copy.titulo}</h2>
          <p className="mt-1 max-w-lg text-sm leading-6 text-ink-2">{copy.cuerpo}</p>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center gap-2.5 sm:w-auto">
          {isNative ? (
            <button
              type="button"
              onClick={onInstall}
              disabled={busy}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-on-solid transition-colors hover:bg-brand-hover disabled:opacity-60 sm:flex-none"
            >
              <Download size={17} aria-hidden="true" />
              {INSTALL_CTA_COPY.accion}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-surface px-4 text-sm font-semibold text-ink-2 ring-1 ring-inset ring-edge transition-colors hover:bg-sunken hover:text-ink sm:flex-none"
          >
            {INSTALL_CTA_COPY.descartar}
          </button>
        </div>
      </div>
    </section>
  );
}
