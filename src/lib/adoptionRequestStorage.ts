import { isAdoptionRequestStatus } from "@/lib/domain/adoption";
import type { AdoptionRequest } from "@/types/adoption";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const memory = new Map<string, AdoptionRequest[]>();

function isAdoptionRequest(value: unknown): value is AdoptionRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Partial<AdoptionRequest>;

  if (typeof record.id !== "string" || record.id.trim() === "") {
    return false;
  }
  if (typeof record.petId !== "string" || record.petId.trim() === "") {
    return false;
  }
  if (!isAdoptionRequestStatus(record.estado)) {
    return false;
  }
  if (typeof record.fechaEnviada !== "string") {
    return false;
  }
  if (record.notas !== null && typeof record.notas !== "string") {
    return false;
  }

  const aspirante = record.aspirante;
  if (typeof aspirante !== "object" || aspirante === null) {
    return false;
  }

  const applicant = aspirante as Partial<AdoptionRequest["aspirante"]>;
  if (
    typeof applicant.nombre !== "string" ||
    typeof applicant.telefono !== "string" ||
    typeof applicant.motivo !== "string"
  ) {
    return false;
  }
  if (applicant.email !== null && typeof applicant.email !== "string") {
    return false;
  }

  return true;
}

export function readAdoptionRequests(
  storage: StorageLike | null | undefined,
  key: string,
): AdoptionRequest[] {
  if (memory.has(key)) {
    return memory.get(key) ?? [];
  }

  let value: AdoptionRequest[] = [];

  if (storage) {
    try {
      const raw = storage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          value = parsed.filter(isAdoptionRequest);
        }
      }
    } catch {
      value = memory.get(key) ?? [];
    }
  }

  memory.set(key, value);
  return value;
}

export function appendAdoptionRequest(
  storage: StorageLike | null | undefined,
  key: string,
  request: AdoptionRequest,
): AdoptionRequest[] {
  const next = [...readAdoptionRequests(storage, key), request];
  memory.set(key, next);

  if (!storage) {
    return next;
  }

  try {
    storage.setItem(key, JSON.stringify(next));
  } catch {
    // Almacenamiento bloqueado o lleno: el estado se conserva en memoria (fallback de sesión).
  }

  return next;
}

export function invalidateAdoptionRequestsCache(key?: string): void {
  if (key === undefined) {
    memory.clear();
    return;
  }
  memory.delete(key);
}