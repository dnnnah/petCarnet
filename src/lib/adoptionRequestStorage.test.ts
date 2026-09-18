import { afterEach, describe, expect, it } from "vitest";
import {
  appendAdoptionRequest,
  invalidateAdoptionRequestsCache,
  readAdoptionRequests,
  type StorageLike,
} from "@/lib/adoptionRequestStorage";
import type { AdoptionRequest } from "@/types/adoption";

function buildRequest(id: string, petId = "mila"): AdoptionRequest {
  return {
    id,
    petId,
    shelterId: null,
    estado: "enviada",
    fechaEnviada: "2026-09-18",
    notas: null,
    aspirante: {
      nombre: "Ana López",
      telefono: "5512345678",
      email: null,
      motivo: "Quiero darle un hogar",
    },
  };
}

function createFakeStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

describe("adoptionRequestStorage", () => {
  afterEach(() => {
    invalidateAdoptionRequestsCache();
  });

  it("lee una lista vacía si no hay datos guardados", () => {
    const storage = createFakeStorage();
    expect(readAdoptionRequests(storage, "key-1")).toEqual([]);
  });

  it("agrega solicitudes y las persiste en el storage", () => {
    const storage = createFakeStorage();
    const first = appendAdoptionRequest(storage, "key-1", buildRequest("sol-a"));
    const second = appendAdoptionRequest(storage, "key-1", buildRequest("sol-b"));

    expect(first.map((request) => request.id)).toEqual(["sol-a"]);
    expect(second.map((request) => request.id)).toEqual(["sol-a", "sol-b"]);

    invalidateAdoptionRequestsCache();
    expect(readAdoptionRequests(storage, "key-1").map((request) => request.id)).toEqual([
      "sol-a",
      "sol-b",
    ]);
  });

  it("mantiene las solicitudes en memoria sin storage", () => {
    appendAdoptionRequest(undefined, "key-1", buildRequest("sol-a"));
    expect(readAdoptionRequests(undefined, "key-1").map((request) => request.id)).toEqual(["sol-a"]);
  });

  it("descarta datos corruptos del storage", () => {
    const storage = createFakeStorage();
    storage.setItem("key-1", "no-soy-json");

    expect(readAdoptionRequests(storage, "key-1")).toEqual([]);
  });

  it("filtra entradas que no parecen solicitudes", () => {
    const storage = createFakeStorage();
    storage.setItem(
      "key-1",
      JSON.stringify([
        buildRequest("sol-a"),
        { id: "incompleto" },
        "texto",
        { ...buildRequest("sol-b"), estado: "estado-desconocido" },
      ]),
    );

    const requests = readAdoptionRequests(storage, "key-1");
    expect(requests.map((request) => request.id)).toEqual(["sol-a"]);
  });

  it("aísla las solicitudes por clave", () => {
    const storage = createFakeStorage();
    appendAdoptionRequest(storage, "key-1", buildRequest("sol-a"));
    appendAdoptionRequest(storage, "key-2", buildRequest("sol-b", "toby"));

    expect(readAdoptionRequests(storage, "key-1").map((request) => request.id)).toEqual(["sol-a"]);
    expect(readAdoptionRequests(storage, "key-2").map((request) => request.id)).toEqual(["sol-b"]);
  });
});