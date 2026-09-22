import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isServiceWorkerRegistrationSupported,
  registerServiceWorker,
  SERVICE_WORKER_PATH,
  shouldRegisterServiceWorker,
} from "@/lib/pwa/registerServiceWorker";

function stubBrowser(enabled: boolean): void {
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  (globalThis as Record<string, unknown>).__restoreNavigator = navigatorDescriptor;

  Object.defineProperty(globalThis, "navigator", {
    value: {
      serviceWorker: enabled
        ? {
            register: vi.fn(async () => ({ scope: "/" } as ServiceWorkerRegistration)),
          }
        : undefined,
    },
    configurable: true,
  });
  Object.defineProperty(globalThis, "window", { value: {}, configurable: true });
}

afterEach(() => {
  vi.unstubAllEnvs();

  delete (globalThis as Record<string, unknown>).window;

  const restore = (globalThis as Record<string, unknown>).__restoreNavigator as
    | PropertyDescriptor
    | undefined;
  delete (globalThis as Record<string, unknown>).__restoreNavigator;

  if (restore) {
    Object.defineProperty(globalThis, "navigator", restore);
  } else {
    delete (globalThis as Record<string, unknown>).navigator;
  }
});

describe("shouldRegisterServiceWorker", () => {
  it("se registra solo en producción (no en dev)", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(shouldRegisterServiceWorker()).toBe(true);

    vi.stubEnv("NODE_ENV", "development");
    expect(shouldRegisterServiceWorker()).toBe(false);
  });
});

describe("isServiceWorkerRegistrationSupported", () => {
  it("devuelve false durante SSR (sin window)", () => {
    expect(isServiceWorkerRegistrationSupported()).toBe(false);
  });

  it("devuelve true solo si el navegador soporta service workers", () => {
    stubBrowser(false);
    expect(isServiceWorkerRegistrationSupported()).toBe(false);

    stubBrowser(true);
    expect(isServiceWorkerRegistrationSupported()).toBe(true);
  });
});

describe("registerServiceWorker", () => {
  it("no hace nada fuera de producción", async () => {
    vi.stubEnv("NODE_ENV", "test");
    stubBrowser(true);
    await expect(registerServiceWorker()).resolves.toBeNull();
  });

  it("no lanza sin soporte de navegador", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(registerServiceWorker()).resolves.toBeNull();
  });

  it("registra el service worker en la ruta esperada", async () => {
    vi.stubEnv("NODE_ENV", "production");
    stubBrowser(true);
    const registration = await registerServiceWorker();
    expect(registration).toEqual({ scope: "/" });

    const register = (globalThis.navigator as Navigator).serviceWorker.register as ReturnType<
      typeof vi.fn
    >;
    expect(register).toHaveBeenCalledWith(SERVICE_WORKER_PATH, { scope: "/" });
  });
});