import { useCallback, useSyncExternalStore } from "react";

export type LostAlertPayload = {
  active: boolean;
  zonaPerdida?: string;
  fechaPerdida?: string;
  recompensa?: number | null;
  mensaje?: string;
};

const PREFIX = "petcarnet-alerta:v1:";
const EVENT = "petcarnet-lost-mode";

const cache = new Map<string, LostAlertPayload | null>();

function keyOf(petId: string) {
  return PREFIX + petId;
}

function read(petId: string): LostAlertPayload | null {
  const key = keyOf(petId);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  let value: LostAlertPayload | null = null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as LostAlertPayload;
      value = parsed && parsed.active === true ? parsed : null;
    }
  } catch {
    value = null;
  }
  cache.set(key, value);
  return value;
}

function invalidate(petId: string) {
  cache.delete(keyOf(petId));
}

function write(petId: string, payload: LostAlertPayload | null) {
  const key = keyOf(petId);
  try {
    if (payload) {
      window.localStorage.setItem(key, JSON.stringify(payload));
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // sin acceso a storage, ignorar
  }
  invalidate(petId);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(petId: string, onChange: () => void) {
  const key = keyOf(petId);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) {
      invalidate(petId);
      onChange();
    }
  };
  const onCustom = () => {
    invalidate(petId);
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, onCustom);
  };
}

export function useLostAlerts(petId: string) {
  const alert = useSyncExternalStore<LostAlertPayload | null>(
    (onChange) => subscribe(petId, onChange),
    () => read(petId),
    () => null
  );

  const activate = useCallback(
    (payload: Omit<LostAlertPayload, "active">) => {
      write(petId, { active: true, ...payload });
    },
    [petId]
  );

  const deactivate = useCallback(() => {
    write(petId, null);
  }, [petId]);

  return { alert, activate, deactivate };
}