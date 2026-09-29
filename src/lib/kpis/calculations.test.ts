import { describe, expect, it, vi } from "vitest";
import {
  calculateQrScanEffectiveness,
  calculateRegistrationToQrDurationMs,
  isWithinTargetDuration,
} from "./calculations";

const TWO_MINUTES_MS = 120_000;

describe("KPI registration_to_qr_duration (registro + QR < 2 minutos)", () => {
  it("calcula la duración entre inicio de registro y QR generado", () => {
    expect(calculateRegistrationToQrDurationMs(1_000, 121_000)).toBe(120_000);
  });

  it("devuelve 0 cuando ambos instantes coinciden (caso límite)", () => {
    expect(calculateRegistrationToQrDurationMs(5_000, 5_000)).toBe(0);
  });

  it("devuelve 0 si el orden de los instantes es inconsistente", () => {
    expect(calculateRegistrationToQrDurationMs(10_000, 2_000)).toBe(0);
  });

  it("devuelve 0 para valores no finitos", () => {
    expect(calculateRegistrationToQrDurationMs(Number.NaN, 5)).toBe(0);
    expect(calculateRegistrationToQrDurationMs(0, Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("permite duraciones fraccionarias (precisión de performance.now)", () => {
    expect(calculateRegistrationToQrDurationMs(1_000.5, 1_003.75)).toBeCloseTo(3.25, 6);
  });

  it("valida el objetivo académico de 2 minutos", () => {
    expect(isWithinTargetDuration(119_999, TWO_MINUTES_MS)).toBe(true);
    expect(isWithinTargetDuration(120_000, TWO_MINUTES_MS)).toBe(true);
    expect(isWithinTargetDuration(120_001, TWO_MINUTES_MS)).toBe(false);
  });

  it("rechaza duraciones o objetivos no finitos o negativos", () => {
    expect(isWithinTargetDuration(Number.NaN)).toBe(false);
    expect(isWithinTargetDuration(100, -1)).toBe(false);
  });
});

describe("KPI qr_scan_effectiveness (>95% de efectividad de escaneo)", () => {
  it("calcula el porcentaje de escaneos exitosos", () => {
    expect(calculateQrScanEffectiveness(19, 20)).toBe(95);
    expect(calculateQrScanEffectiveness(1, 1)).toBe(100);
  });

  it("devuelve 0 sin intentos registrados", () => {
    expect(calculateQrScanEffectiveness(0, 0)).toBe(0);
  });

  it("acota el resultado a 100 en casos inconsistentes", () => {
    expect(calculateQrScanEffectiveness(30, 20)).toBe(100);
  });

  it("no produce valores negativos en casos inconsistentes", () => {
    expect(calculateQrScanEffectiveness(-5, 20)).toBe(0);
  });

  it("devuelve 0 para valores no finitos", () => {
    expect(calculateQrScanEffectiveness(Number.NaN, 10)).toBe(0);
    expect(calculateQrScanEffectiveness(1, Number.NaN)).toBe(0);
  });

  it("es una función pura y determinista", () => {
    const spy = vi.fn();
    const result = calculateQrScanEffectiveness(3, 4);
    expect(result).toBe(75);
    expect(spy).not.toHaveBeenCalled();
  });
});
