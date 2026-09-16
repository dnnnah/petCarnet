import { describe, expect, it } from "vitest";
import {
  isActiveLostAlert,
  parseLostAlert,
  parseLostAlertDraft,
  resolveLostState,
} from "@/lib/domain/emergency";
import type { PetEmergency } from "@/types/pet";

const EMERGENCIA: PetEmergency = {
  perdido: true,
  fechaPerdida: "2026-09-01",
  zonaPerdida: "Parque de la Condesa",
  mensajeEmergencia: "Ayuda a encontrar a Prueba",
  recompensa: 500,
  instrucciones: ["No perseguir", "Avisar"],
};

describe("parseLostAlert", () => {
  it("devuelve null para valores que no son objetos", () => {
    expect(parseLostAlert(null)).toBeNull();
    expect(parseLostAlert("texto")).toBeNull();
    expect(parseLostAlert(42)).toBeNull();
    expect(parseLostAlert([])).toBeNull();
  });

  it("devuelve null cuando active no es true", () => {
    expect(parseLostAlert({ active: false, zonaPerdida: "Zona" })).toBeNull();
    expect(parseLostAlert({ zonaPerdida: "Zona" })).toBeNull();
    expect(parseLostAlert({ active: "true" })).toBeNull();
  });

  it("acepta un payload válido", () => {
    const alert = parseLostAlert({
      active: true,
      zonaPerdida: "  Zona  ",
      fechaPerdida: "2026-09-10",
      recompensa: 100,
      mensaje: " Mensaje ",
    });
    expect(alert).toEqual({
      active: true,
      zonaPerdida: "Zona",
      fechaPerdida: "2026-09-10",
      recompensa: 100,
      mensaje: "Mensaje",
    });
  });

  it("sanea strings vacíos y fechas mal formadas", () => {
    const alert = parseLostAlert({
      active: true,
      zonaPerdida: "",
      fechaPerdida: "12/09/2026",
      recompensa: 50,
      mensaje: "",
    });
    expect(alert).toEqual({ active: true, recompensa: 50 });
  });

  it("rechaza recompensa negativa, NaN o no numérica", () => {
    expect(parseLostAlert({ active: true, recompensa: -5 })?.recompensa).toBeUndefined();
    expect(parseLostAlert({ active: true, recompensa: Number.NaN })?.recompensa).toBeUndefined();
    expect(parseLostAlert({ active: true, recompensa: "100" })?.recompensa).toBeUndefined();
  });

  it("conserva recompensa null explícito", () => {
    expect(parseLostAlert({ active: true, recompensa: null })).toEqual({ active: true, recompensa: null });
  });

  it("no acepta strings JSON sin parsear", () => {
    expect(parseLostAlert('{"active":true}')).toBeNull();
  });
});

describe("parseLostAlertDraft", () => {
  it("marca active: true en el payload generado", () => {
    expect(parseLostAlertDraft({ zonaPerdida: "Zona" })).toEqual({
      active: true,
      zonaPerdida: "Zona",
    });
  });

  it("sanea campos inválidos de un draft", () => {
    expect(parseLostAlertDraft({ fechaPerdida: "", recompensa: -3 })).toEqual({ active: true });
  });

  it("devuelve null si el draft no es un objeto", () => {
    expect(parseLostAlertDraft("zona")).toBeNull();
  });
});

describe("isActiveLostAlert", () => {
  it("es true solo para alertas activas válidas", () => {
    expect(isActiveLostAlert({ active: true })).toBe(true);
    expect(isActiveLostAlert({ active: false })).toBe(false);
    expect(isActiveLostAlert({})).toBe(false);
    expect(isActiveLostAlert(null)).toBe(false);
  });
});

describe("resolveLostState", () => {
  it("mantiene el estado estático cuando no hay alerta activa", () => {
    const resolved = resolveLostState(EMERGENCIA, null);
    expect(resolved).toEqual({
      isLost: true,
      zonaPerdida: EMERGENCIA.zonaPerdida,
      fechaPerdida: EMERGENCIA.fechaPerdida,
      mensaje: EMERGENCIA.mensajeEmergencia,
      recompensa: EMERGENCIA.recompensa,
    });
  });

  it("la alerta en runtime gana sobre el estado estático", () => {
    const resolved = resolveLostState(EMERGENCIA, {
      active: true,
      zonaPerdida: "Otra zona",
      fechaPerdida: "2026-09-15",
      mensaje: "Mensaje nuevo",
      recompensa: 900,
    });
    expect(resolved).toEqual({
      isLost: true,
      zonaPerdida: "Otra zona",
      fechaPerdida: "2026-09-15",
      mensaje: "Mensaje nuevo",
      recompensa: 900,
    });
  });

  it("cae al estado estático cuando campos de la alerta faltan", () => {
    const resolved = resolveLostState(EMERGENCIA, { active: true });
    expect(resolved.isLost).toBe(true);
    expect(resolved.zonaPerdida).toBe(EMERGENCIA.zonaPerdida);
    expect(resolved.fechaPerdida).toBe(EMERGENCIA.fechaPerdida);
    expect(resolved.mensaje).toBe(EMERGENCIA.mensajeEmergencia);
    expect(resolved.recompensa).toBe(EMERGENCIA.recompensa);
  });

  it("recompensa null de la alerta cae al estado estático (semántica ?? histórica)", () => {
    const resolved = resolveLostState(EMERGENCIA, { active: true, recompensa: null });
    expect(resolved.recompensa).toBe(EMERGENCIA.recompensa);
  });

  it("reporta no perdido si el estado estático y la alerta lo dicen", () => {
    const resolved = resolveLostState({ ...EMERGENCIA, perdido: false }, null);
    expect(resolved.isLost).toBe(false);
  });

  it("reporta perdido si solo la alerta de runtime está activa", () => {
    const resolved = resolveLostState({ ...EMERGENCIA, perdido: false }, { active: true });
    expect(resolved.isLost).toBe(true);
  });
});