"use client";

import { useSyncExternalStore } from "react";
import {
  getBrowserOnline,
  resolveConnectivityStatus,
  type ConnectivityStatus,
} from "@/lib/pwa/connectivity";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getSnapshot(): ConnectivityStatus {
  return resolveConnectivityStatus(getBrowserOnline());
}

function getServerSnapshot(): ConnectivityStatus {
  return "unknown";
}

/**
 * Estado de red del dispositivo como indicador (`online` / `offline` /
 * `unknown` durante SSR). No debe tratarse como conectividad real con un
 * servidor; la UI de "sin conexión" la construirá el bloque B.
 */
export function useOnlineStatus(): ConnectivityStatus {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type { ConnectivityStatus };