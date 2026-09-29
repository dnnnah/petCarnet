import { describe, expect, it } from "vitest";
import {
  readInstallDismissed,
  writeInstallDismissed,
} from "@/lib/pwa/installDismiss";
import { INSTALL_DISMISS_KEY } from "@/lib/pwa/install";
import type { StorageLike } from "@/lib/pwa/storage";

/** Storage en memoria: mismo contrato que `localStorage`, sin navegador. */
function memoryStorage(initial: Record<string, string> = {}): StorageLike & {
  data: Map<string, string>;
} {
  const data = new Map(Object.entries(initial));
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

/** Storage bloqueado: toda operación lanza, como en modo privado. */
function blockedStorage(): StorageLike {
  return {
    getItem: () => {
      throw new Error("SecurityError: acceso denegado");
    },
    setItem: () => {
      throw new Error("SecurityError: acceso denegado");
    },
    removeItem: () => {
      throw new Error("SecurityError: acceso denegado");
    },
  };
}

describe("readInstallDismissed", () => {
  it("es false la primera vez, con storage vacío", () => {
    expect(readInstallDismissed(memoryStorage())).toBe(false);
  });

  it("es true después de descartar", () => {
    const storage = memoryStorage();
    writeInstallDismissed(storage, true);
    expect(readInstallDismissed(storage)).toBe(true);
  });

  it("vuelve a false si se cancela el descarte", () => {
    const storage = memoryStorage();
    writeInstallDismissed(storage, true);
    writeInstallDismissed(storage, false);
    expect(readInstallDismissed(storage)).toBe(false);
  });

  it("durante SSR (sin storage) responde false en lugar de romperse", () => {
    // false y no "error": es preferible preguntar una vez de más que ocultar un
    // CTA que sí era relevante.
    expect(readInstallDismissed(null)).toBe(false);
    expect(readInstallDismissed(undefined)).toBe(false);
  });

  it("con storage bloqueado responde false y no lanza", () => {
    expect(readInstallDismissed(blockedStorage())).toBe(false);
  });

  it("ignora un valor corrupto que no sea el esperado", () => {
    expect(readInstallDismissed(memoryStorage({ [INSTALL_DISMISS_KEY]: "quizá" }))).toBe(false);
    expect(readInstallDismissed(memoryStorage({ [INSTALL_DISMISS_KEY]: "" }))).toBe(false);
  });
});

describe("writeInstallDismissed", () => {
  it("guarda el descarte en la clave versionada", () => {
    const storage = memoryStorage();
    writeInstallDismissed(storage, true);
    expect(storage.data.get(INSTALL_DISMISS_KEY)).toBe("1");
  });

  it("con storage bloqueado no lanza: el CTA simplemente vuelve a mostrarse", () => {
    expect(() => writeInstallDismissed(blockedStorage(), true)).not.toThrow();
  });

  it("durante SSR no lanza", () => {
    expect(() => writeInstallDismissed(null, true)).not.toThrow();
  });
});
