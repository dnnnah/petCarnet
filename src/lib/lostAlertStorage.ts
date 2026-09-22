import { parseLostAlert } from "@/lib/domain/emergency";
import { readStoredJson, safeRemoveItem, safeSetItem } from "@/lib/pwa/storage";
import type { StorageLike } from "@/lib/pwa/storage";
import type { LostAlert } from "@/types/emergency";

export type { StorageLike };

const memory = new Map<string, LostAlert | null>();

export function readLostAlert(
  storage: StorageLike | null | undefined,
  key: string,
): LostAlert | null {
  if (memory.has(key)) {
    return memory.get(key) ?? null;
  }

  const value = readStoredJson(storage, key, parseLostAlert);

  memory.set(key, value);
  return value;
}

export function writeLostAlert(
  storage: StorageLike | null | undefined,
  key: string,
  alert: LostAlert | null,
): void {
  memory.set(key, alert);

  if (alert === null) {
    safeRemoveItem(storage, key);
  } else {
    safeSetItem(storage, key, JSON.stringify(alert));
    // Storage bloqueado o lleno: el estado se conserva en memoria (fallback de sesión).
  }
}

export function invalidateLostAlertCache(key?: string): void {
  if (key === undefined) {
    memory.clear();
    return;
  }
  memory.delete(key);
}