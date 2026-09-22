"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa/registerServiceWorker";

/**
 * Monta el registro del service worker una sola vez por sesión.
 * Componente de infraestructura sin salida visual (B construye la UI).
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return null;
}