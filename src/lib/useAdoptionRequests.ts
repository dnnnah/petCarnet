import { useCallback, useSyncExternalStore } from "react";
import {
  appendAdoptionRequest,
  invalidateAdoptionRequestsCache,
  readAdoptionRequests,
} from "@/lib/adoptionRequestStorage";
import type { AdoptionRequest } from "@/types/adoption";

export type { AdoptionRequest };

const PREFIX = "petcarnet-adopcion:v1:";
const EVENT = "petcarnet-adoption-requests";

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
      invalidateAdoptionRequestsCache(key);
      onChange();
    }
  };

  const onCustom = () => {
    invalidateAdoptionRequestsCache(key);
    onChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, onCustom);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, onCustom);
  };
}

function notifyRequestsChange() {
  window.dispatchEvent(new Event(EVENT));
}

export function useAdoptionRequests(petId: string) {
  const key = keyOf(petId);

  const requests = useSyncExternalStore<AdoptionRequest[]>(
    (onChange) => subscribe(petId, onChange),
    () => readAdoptionRequests(getStorage(), key),
    () => []
  );

  const submit = useCallback(
    (request: AdoptionRequest) => {
      const result = appendAdoptionRequest(getStorage(), key, request);
      notifyRequestsChange();
      return result;
    },
    [key]
  );

  return { requests, submit, key };
}