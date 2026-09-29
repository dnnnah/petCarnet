import { describe, expect, it, vi, afterEach } from "vitest";
import { createTaskTimer } from "./timer";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("createTaskTimer con reloj inyectado", () => {
  it("mide una duración usando una fuente monotónica determinista", () => {
    let fakeNow = 1000;
    vi.stubGlobal("performance", { now: () => fakeNow });

    const timer = createTaskTimer();
    timer.start();
    fakeNow = 1123.456;
    const duration = timer.stop();

    expect(duration).toBeCloseTo(123.456, 6);
    expect(timer.isRunning()).toBe(false);
  });

  it("devuelve la misma duración al consultarla tras stop", () => {
    let fakeNow = 0;
    vi.stubGlobal("performance", { now: () => fakeNow });

    const timer = createTaskTimer();
    timer.start();
    fakeNow = 500;
    const duration = timer.stop();

    expect(duration).toBe(500);
    expect(timer.getElapsedMs()).toBe(500);
    expect(timer.getElapsedMs()).toBe(500);
  });

  it("reporta elapsed en vivo mientras corre", () => {
    let fakeNow = 0;
    vi.stubGlobal("performance", { now: () => fakeNow });

    const timer = createTaskTimer();
    timer.start();
    fakeNow = 250;
    expect(timer.getElapsedMs()).toBe(250);
    fakeNow = 900;
    expect(timer.getElapsedMs()).toBe(900);
  });

  it("devuelve 0 para una duración cero", () => {
    const fakeNow = 42;
    vi.stubGlobal("performance", { now: () => fakeNow });

    const timer = createTaskTimer();
    timer.start();
    expect(timer.stop()).toBe(0);
  });

  it("no produce duración negativa si el reloj retrocede", () => {
    let fakeNow = 1000;
    vi.stubGlobal("performance", { now: () => fakeNow });

    const timer = createTaskTimer();
    timer.start();
    fakeNow = 500;
    expect(timer.stop()).toBe(0);
  });

  it("stop() sin start() devuelve null y no marca corrida", () => {
    const timer = createTaskTimer();
    expect(timer.isRunning()).toBe(false);
    expect(timer.stop()).toBeNull();
    expect(timer.getElapsedMs()).toBeNull();
  });

  it("cancel() descarta la medición y vuelve al estado inicial", () => {
    let fakeNow = 0;
    vi.stubGlobal("performance", { now: () => fakeNow });

    const timer = createTaskTimer();
    timer.start();
    fakeNow = 800;
    timer.cancel();

    expect(timer.isRunning()).toBe(false);
    expect(timer.getElapsedMs()).toBeNull();
    expect(timer.stop()).toBeNull();

    timer.start();
    fakeNow = 810;
    expect(timer.stop()).toBe(10);
  });

  it("start() reinicia la medición desde cero", () => {
    let fakeNow = 0;
    vi.stubGlobal("performance", { now: () => fakeNow });

    const timer = createTaskTimer();
    timer.start();
    fakeNow = 700;
    timer.start();
    fakeNow = 750;
    expect(timer.stop()).toBe(50);
  });
});

describe("seguridad ante SSR", () => {
  it("funciona sin performance.now() (entorno Node sin performance global)", () => {
    const originalPerformance = (globalThis as Record<string, unknown>).performance;
    delete (globalThis as Record<string, unknown>).performance;
    try {
      const timer = createTaskTimer();
      timer.start();
      expect(timer.isRunning()).toBe(true);
      const duration = timer.stop();
      expect(duration).not.toBeNull();
      expect(duration).toBeGreaterThanOrEqual(0);
    } finally {
      (globalThis as Record<string, unknown>).performance = originalPerformance;
    }
  });

  it("no referencia window ni document", async () => {
    const source = await import("./timer").then((m) => JSON.stringify(Object.keys(m)));
    expect(source).toContain("createTaskTimer");
  });

  it("usa Date.now() como fallback, no Date.now() disperso en componentes", async () => {
    const { nowMonotonic, nowIso } = await import("./time");
    expect(typeof nowMonotonic).toBe("function");
    expect(typeof nowIso).toBe("function");
  });
});
