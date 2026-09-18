import { describe, expect, it } from "vitest";
import {
  compareIsoDates,
  isIsoDate,
  normalizeIsoDate,
  todayIsoDate,
} from "@/lib/domain/dateRules";

describe("isIsoDate", () => {
  it("acepta fechas ISO YYYY-MM-DD", () => {
    expect(isIsoDate("2026-01-15")).toBe(true);
    expect(isIsoDate("2025-12-31")).toBe(true);
    expect(isIsoDate("9999-01-01")).toBe(true);
  });

  it("rechaza formatos no ISO", () => {
    expect(isIsoDate("15/01/2026")).toBe(false);
    expect(isIsoDate("2026-1-15")).toBe(false);
    expect(isIsoDate("2026-01-15T00:00:00Z")).toBe(false);
    expect(isIsoDate("20260115")).toBe(false);
    expect(isIsoDate("")).toBe(false);
    expect(isIsoDate("  ")).toBe(false);
    expect(isIsoDate(null)).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
    expect(isIsoDate(20260115)).toBe(false);
    expect(isIsoDate({})).toBe(false);
  });
});

describe("normalizeIsoDate", () => {
  it("normaliza a fecha ISO válida y recorta espacios", () => {
    expect(normalizeIsoDate(" 2026-01-15 ")).toBe("2026-01-15");
    expect(normalizeIsoDate("2026-01-15")).toBe("2026-01-15");
  });

  it("devuelve null para valores vacíos, inválidos o de otro tipo", () => {
    expect(normalizeIsoDate("")).toBeNull();
    expect(normalizeIsoDate("   ")).toBeNull();
    expect(normalizeIsoDate("15/01/2026")).toBeNull();
    expect(normalizeIsoDate(null)).toBeNull();
    expect(normalizeIsoDate(undefined)).toBeNull();
    expect(normalizeIsoDate(20260115)).toBeNull();
    expect(normalizeIsoDate(new Date())).toBeNull();
  });
});

describe("todayIsoDate", () => {
  it("usa la fecha inyectada cuando es válida", () => {
    expect(todayIsoDate("2026-09-18")).toBe("2026-09-18");
  });

  it("si la fecha inyectada es inválida, genera la fecha UTC actual en formato ISO", () => {
    const today = todayIsoDate("no es una fecha");
    expect(isIsoDate(today)).toBe(true);
  });
});

describe("compareIsoDates", () => {
  it("es negativo cuando a es anterior a b", () => {
    expect(compareIsoDates("2025-01-01", "2026-01-01")).toBeLessThan(0);
    expect(compareIsoDates("2026-01-01", "2026-02-01")).toBeLessThan(0);
  });

  it("es positivo cuando a es posterior a b", () => {
    expect(compareIsoDates("2026-01-01", "2025-01-01")).toBeGreaterThan(0);
  });

  it("es cero cuando son iguales (comparación lexicográfica segura)", () => {
    expect(compareIsoDates("2026-01-15", "2026-01-15")).toBe(0);
  });
});