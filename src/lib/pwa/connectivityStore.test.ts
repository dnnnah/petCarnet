import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  acknowledgeRecovery,
  getConnectivitySnapshot,
  getServerConnectivitySnapshot,
  resetConnectivityStore,
  subscribeConnectivity,
  type ConnectivitySnapshot,
} from "@/lib/pwa/connectivityStore";

/**
 * El store de conectividad es lo que decide qué ve la persona en pantalla, así
 * que se prueba con eventos reales sobre un `window` simulado: `online`,
 * `offline` y la recuperación. Sin red y sin temporizadores reales.
 */

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

type Listeners = Map<string, Set<() => void>>;

type FakeWindow = {
  emit: (type: "online" | "offline") => void;
  added: string[];
  removed: string[];
  listenerCount: (type: string) => number;
};

/**
 * `window` simulado con contabilidad de escuchas. Devolver el mismo objeto que
 * se instala como global es lo que permite comprobar qué se registró y qué se
 * retiró: una envoltura separada observaría listeners que nadie puede quitar.
 */
function installFakeWindow(initialOnline: boolean): FakeWindow {
  const listeners: Listeners = new Map();
  const added: string[] = [];
  const removed: string[] = [];
  let online = initialOnline;

  const win = {
    added,
    removed,
    get __online() {
      return online;
    },
    set __online(value: boolean) {
      online = value;
    },
    addEventListener(type: string, handler: () => void) {
      added.push(type);
      const set = listeners.get(type) ?? new Set();
      set.add(handler);
      listeners.set(type, set);
    },
    removeEventListener(type: string, handler: () => void) {
      removed.push(type);
      listeners.get(type)?.delete(handler);
    },
    emit(type: "online" | "offline") {
      online = type === "online";
      for (const handler of [...(listeners.get(type) ?? [])]) {
        handler();
      }
    },
    listenerCount: (type: string) => listeners.get(type)?.size ?? 0,
  };

  Object.defineProperty(globalThis, "window", { value: win, configurable: true });
  Object.defineProperty(globalThis, "navigator", {
    value: {
      get onLine() {
        return online;
      },
    },
    configurable: true,
  });

  return win;
}

function snapshot(): ConnectivitySnapshot {
  return getConnectivitySnapshot();
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  resetConnectivityStore();
  vi.useRealTimers();
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    delete (globalThis as Record<string, unknown>).window;
  }
  delete (globalThis as Record<string, unknown>).navigator;
});

describe("instantánea de servidor", () => {
  it("es indeterminada y estable: la misma referencia en todas las llamadas", () => {
    const first = getServerConnectivitySnapshot();
    expect(first.phase).toBe("unknown");
    expect(first.recovered).toBe(false);
    // `useSyncExternalStore` compara por identidad: un objeto nuevo en cada
    // llamada provocaría un bucle de render infinito.
    expect(getServerConnectivitySnapshot()).toBe(first);
  });
});

describe("transiciones de red", () => {
  it("parte del estado real del dispositivo al suscribirse", () => {
    installFakeWindow(false);
    const unsubscribe = subscribeConnectivity(() => undefined);
    expect(snapshot().phase).toBe("offline");
    unsubscribe();
  });

  it("avisa a los suscriptores al perder la conexión", () => {
    const net = installFakeWindow(true);
    const listener = vi.fn();
    const unsubscribe = subscribeConnectivity(listener);

    expect(snapshot()).toEqual({ phase: "online", recovered: false });

    net.emit("offline");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(snapshot()).toEqual({ phase: "offline", recovered: false });
    unsubscribe();
  });

  it("marca la recuperación al volver de estar sin conexión", () => {
    const net = installFakeWindow(false);
    const listener = vi.fn();
    const unsubscribe = subscribeConnectivity(listener);

    expect(snapshot().phase).toBe("offline");

    net.emit("online");

    expect(snapshot()).toEqual({ phase: "online", recovered: true });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("no marca recuperación si nunca se perdió la conexión", () => {
    const net = installFakeWindow(true);
    const unsubscribe = subscribeConnectivity(() => undefined);

    // Online -> online no es una recuperación: el aviso aparecería sin motivo.
    net.emit("online");

    expect(snapshot().recovered).toBe(false);
    unsubscribe();
  });

  it("el aviso de recuperación se retira solo, sin esperar a otra transición", () => {
    const net = installFakeWindow(false);
    const listener = vi.fn();
    const unsubscribe = subscribeConnectivity(listener);

    net.emit("online");
    expect(snapshot().recovered).toBe(true);

    vi.advanceTimersByTime(6000);

    expect(snapshot()).toEqual({ phase: "online", recovered: false });
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("volver a quedarse sin conexión cancela el aviso de recuperación", () => {
    const net = installFakeWindow(false);
    const unsubscribe = subscribeConnectivity(() => undefined);

    net.emit("online");
    expect(snapshot().recovered).toBe(true);

    net.emit("offline");
    vi.advanceTimersByTime(6000);

    // El aviso de "volvió la conexión" ya no debe saltar 6 s después de volver a
    // quedarse sin señal: sería un estado imposible en pantalla.
    expect(snapshot()).toEqual({ phase: "offline", recovered: false });
    unsubscribe();
  });

  it("aguanta muchos ciclos offline -> online sin acumular escuchas", () => {
    const net = installFakeWindow(true);
    const listener = vi.fn();
    const unsubscribe = subscribeConnectivity(listener);

    for (let i = 0; i < 50; i += 1) {
      net.emit("offline");
      net.emit("online");
    }

    // Un solo evento por transición: si las escuchas se multiplicaran, aquí
    // habría más llamadas que iteraciones.
    expect(listener).toHaveBeenCalledTimes(100);
    unsubscribe();
  });
});

describe("suscripción", () => {
  it("registra una escucha por evento y la retira al cancelar el último", () => {
    const win = installFakeWindow(true);

    const first = subscribeConnectivity(() => undefined);
    const second = subscribeConnectivity(() => undefined);

    // Las escuchas viven en window, no en el suscriptor: dos consumidores
    // comparten una sola pareja de escuchas.
    expect(win.added).toEqual(["online", "offline"]);
    expect(win.listenerCount("online")).toBe(1);

    first();
    expect(win.removed).toEqual([]);
    expect(win.listenerCount("online")).toBe(1);

    second();
    expect(win.removed).toEqual(["online", "offline"]);
    expect(win.listenerCount("online")).toBe(0);
    expect(win.listenerCount("offline")).toBe(0);
  });

  it("deja de notificar tras cancelar", () => {
    const win = installFakeWindow(true);
    const listener = vi.fn();
    const unsubscribe = subscribeConnectivity(listener);

    unsubscribe();
    win.emit("offline");

    expect(listener).not.toHaveBeenCalled();
  });

  it("vuelve a registrar escuchas tras un ciclo completo de suscripción", () => {
    const win = installFakeWindow(true);

    subscribeConnectivity(() => undefined)();
    const listener = vi.fn();
    const unsubscribe = subscribeConnectivity(listener);

    expect(win.listenerCount("online")).toBe(1);
    win.emit("offline");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});

describe("acknowledgeRecovery", () => {
  it("desaparece el aviso sin tocar la fase de red", () => {
    const net = installFakeWindow(false);
    const unsubscribe = subscribeConnectivity(() => undefined);

    net.emit("online");
    expect(snapshot().recovered).toBe(true);

    acknowledgeRecovery();

    expect(snapshot()).toEqual({ phase: "online", recovered: false });
    unsubscribe();
  });

  it("es inocuo si no hay nada que reconocer", () => {
    installFakeWindow(true);
    const unsubscribe = subscribeConnectivity(() => undefined);

    expect(() => acknowledgeRecovery()).not.toThrow();
    expect(snapshot()).toEqual({ phase: "online", recovered: false });
    unsubscribe();
  });
});
