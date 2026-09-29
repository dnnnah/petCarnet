"use client";

import { useOfflineNavigationGuard } from "@/lib/pwa/useOfflineNavigationGuard";
import { OfflineRouteNotice } from "@/components/pwa/OfflineRouteNotice";

/**
 * Punto de montaje del guardia de navegación sin conexión (FASE 7B).
 *
 * No dibuja nada por su cuenta: expone el hook, y si hay una ruta bloqueada
 * delega el aviso en `OfflineRouteNotice`. Vive una sola vez en el shell, así
 * que hay exactamente un listener de documento mientras hay conexión perdida.
 */
export function OfflineNavGuard() {
  const { blockedPath, dismissBlocked } = useOfflineNavigationGuard();

  return <OfflineRouteNotice blockedPath={blockedPath} onDismiss={dismissBlocked} />;
}
