import { parseLostAlert } from "@/lib/domain/emergency";
import type { LostAlert } from "@/types/emergency";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const memory = new Map<string, LostAlert | null>();

export function readLostAlert(
  storage: StorageLike | null | undefined,
  key: string,
): LostAlert | null {
  if (memory.has(key)) {
    return memory.get(key) ?? null;
  }

  let value: LostAlert | null = null;

  if (storage) {
    try {
      const raw = storage.getItem(key);
      if (raw) {
        value = parseLostAlert(JSON.parse(raw));
      }
    } catch {
      value = memory.get(key) ?? null;
    }
  }

  memory.set(key, value);
  return value;
}

export function writeLostAlert(
  storage: StorageLike | null | undefined,
  key: string,
  alert: LostAlert | null,
): void {
  memory.set(key, alert);

  if (!storage) {
    return;
  }

  try {
    if (alert === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, JSON.stringify(alert));
    }
  } catch {
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