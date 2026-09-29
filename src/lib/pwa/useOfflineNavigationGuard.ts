"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnlineStatus } from "@/lib/pwa/useOnlineStatus";
import { describeRouteCache } from "@/lib/pwa/cacheApi";
import {
  resolveInternalTarget,
  resolveLinkPrecheck,
  resolveOfflineNavigation,
  toCacheKey,
} from "@/lib/pwa/offlineNavigation";

/**
 * Guardia de navegación sin conexión (FASE 7B).
 *
 * Sin backend, la única forma honesta de moverse sin conexión es lo que el
 * service worker tiene cacheado. Un enlace interno a una ruta nunca visitada no
 * tiene copia local: dejarlo pasar produce un error técnico de red, que es
 * justo lo que esta fase no quiere. El guardia lo detiene y deja que la UI
 * explique qué pasó y ofrezca una salida.
 *
 * El listener se registra en fase de captura y **solo mientras hay conexión
 * perdida**: con `connectivity !== "offline"` no hay ni un handler en el
 * documento, así que el coste y el riesgo se anulan por completo.
 *
 * La ruta bloqueada se filtra en el render, no con un efecto que la borre al
 * recuperar la señal. Un `setState` síncrono dentro de un efecto obliga a un
 * render en cascada en cada transición, que es justo el tipo de parpadeo que
 * esta fase quiere evitar.
 */
export function useOfflineNavigationGuard(): {
  blockedPath: string | null;
  dismissBlocked: () => void;
} {
  const connectivity = useOnlineStatus();
  const router = useRouter();
  const [blocked, setBlocked] = useState<string | null>(null);

  const dismissBlocked = useCallback(() => {
    setBlocked(null);
  }, []);

  useEffect(() => {
    if (connectivity !== "offline") {
      return;
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("target") && anchor.getAttribute("target") !== "_self") return;

      const target = resolveInternalTarget(anchor.getAttribute("href"), window.location.href);
      if (!target) return;

      const precheck = resolveLinkPrecheck({
        connectivity,
        modifiedActivation: event.metaKey || event.ctrlKey || event.shiftKey || event.altKey,
        internal: target.internal,
        sameDocument: target.sameDocument,
      });

      if (precheck === "ignore") return;

      event.preventDefault();
      const cacheKey = toCacheKey(target.pathname);

      // Consultar la caché es asíncrono, así que la decisión final se toma
      // después del clic. `describeRouteCache` nunca rechaza: si no puede
      // responder, dice que no hay nada y el enlace se detiene con el aviso.
      void describeRouteCache(cacheKey).then((availability) => {
        const verdict = resolveOfflineNavigation({
          connectivity,
          cached: availability.document || availability.payload,
        });

        if (verdict === "block") {
          setBlocked(cacheKey);
          return;
        }

        setBlocked(null);

        /* Sin payload RSC, `router.push` no tiene de dónde sacar la ruta y
           fallaría con un error de red. El documento sí está en caché, así que
           una navegación completa funciona: se pierde la transición de cliente,
           no el contenido. Es el mismo camino que sigue un F5 sin señal. */
        if (!availability.payload && availability.document) {
          window.location.assign(target.pathname);
          return;
        }

        router.push(cacheKey);
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [connectivity, router]);

  return {
    blockedPath: connectivity === "offline" ? blocked : null,
    dismissBlocked,
  };
}
