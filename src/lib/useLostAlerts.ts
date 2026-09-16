import { useCallback, useSyncExternalStore } from "react";
import { parseLostAlertDraft } from "@/lib/domain/emergency";
import {
  invalidateLostAlertCache,
  readLostAlert,
  writeLostAlert,
} from "@/lib/lostAlertStorage";
import type { LostAlert, LostAlertDraft } from "@/types/emergency";

export type { LostAlert, LostAlertDraft };

const PREFIX = "petcarnet-alerta:v1:";
const EVENT = "petcarnet-lost-mode";

function keyOf(petId: string) {
  return `${PREFIX}${String(petId)}`;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function subscribe(petId: string, onChange: () => void) {
  const key = keyOf(petId);

  const onStorage = (event: StorageEvent) => {
    if (event.key === key) {
      invalidateLostAlertCache(key);
      onChange();
    }
  };

  const onCustom = () => {
    invalidateLostAlertCache(key);
    onChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, onCustom);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, onCustom);
  };
}

function notifyAlertChange() {
  window.dispatchEvent(new Event(EVENT));
}

export function useLostAlerts(petId: string) {
  const key = keyOf(petId);

  const alert = useSyncExternalStore<LostAlert | null>(
    (onChange) => subscribe(petId, onChange),
    () => readLostAlert(getStorage(), key),
    () => null
  );

  const activate = useCallback(
    (draft: LostAlertDraft) => {
      writeLostAlert(getStorage(), key, parseLostAlertDraft(draft));
      notifyAlertChange();
    },
    [key]
  );

  const deactivate = useCallback(() => {
    writeLostAlert(getStorage(), key, null);
    notifyAlertChange();
  }, [key]);

  return { alert, activate, deactivate };
}