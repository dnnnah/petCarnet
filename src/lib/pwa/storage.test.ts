import { afterEach, describe, expect, it } from "vitest";
import {
  getBrowserStorage,
  isStorageAvailable,
  readStoredJson,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
  type StorageLike,
} from "@/lib/pwa/storage";

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

function createBlockedStorage(): StorageLike {
  return {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("SecurityError");
    },
    removeItem: () => {
      throw new Error("SecurityError");
    },
  };
}

let originalWindow: Window | undefined;
let originalLocalStorage: PropertyDescriptor | undefined;

function mockLocalStorage(storage: StorageLike): void {
  originalWindow = globalThis.window as Window | undefined;
  originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  (globalThis as Record<string, unknown>).window = globalThis as unknown as Window;
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    writable: true,
    configurable: true,
  });
}

function mockBlockedLocalStorage(): void {
  originalWindow = globalThis.window as Window | undefined;
  originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  (globalThis as Record<string, unknown>).window = globalThis as unknown as Window;
  Object.defineProperty(globalThis, "localStorage", {
    get: () => {
      throw new Error("SecurityError");
    },
    configurable: true,
  });
}

afterEach(() => {
  if (originalWindow === undefined) {
    delete (globalThis as Record<string, unknown>).window;
  } else {
    (globalThis as Record<string, unknown>).window = originalWindow;
  }
  if (originalLocalStorage === undefined) {
    delete (globalThis as Record<string, unknown>).localStorage;
  } else {
    Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
  }
  originalWindow = undefined;
  originalLocalStorage = undefined;
});

describe("getBrowserStorage", () => {
  it("devuelve null durante SSR (sin window)", () => {
    expect(getBrowserStorage()).toBeNull();
  });

  it("devuelve localStorage cuando window existe y es accesible", () => {
    const storage = createMemoryStorage();
    mockLocalStorage(storage);
    expect(getBrowserStorage()).toBe(storage);
  });

  it("devuelve null si acceder a localStorage lanza (bloqueado)", () => {
    mockBlockedLocalStorage();
    expect(getBrowserStorage()).toBeNull();
  });
});

describe("isStorageAvailable", () => {
  it("detecta un storage usable", () => {
    expect(isStorageAvailable(createMemoryStorage())).toBe(true);
  });

  it("detecta storage null/undefined como no disponible", () => {
    expect(isStorageAvailable(null)).toBe(false);
    expect(isStorageAvailable(undefined)).toBe(false);
  });

  it("detecta storage bloqueado como no disponible sin lanzar", () => {
    expect(isStorageAvailable(createBlockedStorage())).toBe(false);
  });
});

describe("safeGetItem / safeSetItem / safeRemoveItem", () => {
  it("no lanzan con storage inexistente", () => {
    expect(safeGetItem(null, "k")).toBeNull();
    expect(safeSetItem(undefined, "k", "v")).toBe(false);
    expect(safeRemoveItem(null, "k")).toBe(false);
  });

  it("no lanzan con storage bloqueado", () => {
    const blocked = createBlockedStorage();
    expect(safeGetItem(blocked, "k")).toBeNull();
    expect(safeSetItem(blocked, "k", "v")).toBe(false);
    expect(safeRemoveItem(blocked, "k")).toBe(false);
  });

  it("escriben y leen valores normales", () => {
    const storage = createMemoryStorage();
    expect(safeSetItem(storage, "k", "v")).toBe(true);
    expect(safeGetItem(storage, "k")).toBe("v");
    expect(safeRemoveItem(storage, "k")).toBe(true);
    expect(safeGetItem(storage, "k")).toBeNull();
  });
});

describe("readStoredJson", () => {
  const decodeReward = (raw: unknown): number | null =>
    typeof raw === "number" && Number.isFinite(raw) ? raw : null;

  it("devuelve null con storage inexistente o clave ausente", () => {
    expect(readStoredJson(null, "k", decodeReward)).toBeNull();
    expect(readStoredJson(createMemoryStorage(), "k", decodeReward)).toBeNull();
  });

  it("decodifica un valor JSON válido", () => {
    const storage = createMemoryStorage({ k: "100" });
    expect(readStoredJson(storage, "k", decodeReward)).toBe(100);
  });

  it("devuelve null con JSON inválido sin lanzar", () => {
    const storage = createMemoryStorage({ k: "{not-json" });
    expect(readStoredJson(storage, "k", decodeReward)).toBeNull();
  });

  it("devuelve null cuando la forma no es válida (decode)", () => {
    const storage = createMemoryStorage({ k: JSON.stringify("texto") });
    expect(readStoredJson(storage, "k", decodeReward)).toBeNull();
  });

  it("no lanza con storage bloqueado", () => {
    expect(readStoredJson(createBlockedStorage(), "k", decodeReward)).toBeNull();
  });
});