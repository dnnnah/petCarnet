import { isAdoptionRequestStatus } from "@/lib/domain/adoption";
import { readStoredJson, safeSetItem } from "@/lib/pwa/storage";
import type { StorageLike } from "@/lib/pwa/storage";
import type { AdoptionRequest } from "@/types/adoption";

export type { StorageLike };

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

function decodeAdoptionRequests(raw: unknown): AdoptionRequest[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(isAdoptionRequest);
}

export function readAdoptionRequests(
  storage: StorageLike | null | undefined,
  key: string,
): AdoptionRequest[] {
  if (memory.has(key)) {
    return memory.get(key) ?? [];
  }

  const value = readStoredJson(storage, key, decodeAdoptionRequests) ?? [];

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

  safeSetItem(storage, key, JSON.stringify(next));
  // Almacenamiento bloqueado o lleno: el estado se conserva en memoria (fallback de sesión).

  return next;
}

export function invalidateAdoptionRequestsCache(key?: string): void {
  if (key === undefined) {
    memory.clear();
    return;
  }
  memory.delete(key);
}