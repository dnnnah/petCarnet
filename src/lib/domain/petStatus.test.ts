import { describe, expect, it } from "vitest";
import {
  isAdoptionPetStatus,
  isLostPetStatus,
  isPetStatus,
  isTerminalPetStatus,
  PET_STATUSES,
  resolveEffectivePetState,
} from "@/lib/domain/petStatus";
import type { PetEmergency, PetStatus } from "@/types/pet";

const EMERGENCIA: PetEmergency = {
  perdido: false,
  fechaPerdida: null,
  zonaPerdida: null,
  mensajeEmergencia: null,
  recompensa: null,
  instrucciones: [],
};

const EMERGENCIA_PERDIDA: PetEmergency = {
  ...EMERGENCIA,
  perdido: true,
  fechaPerdida: "2026-09-01",
  zonaPerdida: "Parque de la Condesa",
  mensajeEmergencia: "Ayuda a encontrar a Prueba",
  recompensa: 500,
};

describe("PET_STATUSES", () => {
  it("contiene exactamente los seis estados del ciclo de vida", () => {
    expect(PET_STATUSES).toEqual([
      "en_casa",
      "perdido",
      "en_adopcion",
      "adoptado",
      "rescatado",
      "fallecido",
    ]);
  });
});

describe("isPetStatus", () => {
  it("acepta cada estado válido del dominio", () => {
    for (const status of PET_STATUSES) {
      expect(isPetStatus(status)).toBe(true);
    }
  });

  it("rechaza estados inválidos", () => {
    expect(isPetStatus("extraviado")).toBe(false);
    expect(isPetStatus("En Casa")).toBe(false);
    expect(isPetStatus("en_casa ")).toBe(false);
    expect(isPetStatus("")).toBe(false);
    expect(isPetStatus(null)).toBe(false);
    expect(isPetStatus(undefined)).toBe(false);
    expect(isPetStatus(42)).toBe(false);
    expect(isPetStatus({})).toBe(false);
  });
});

describe("isLostPetStatus", () => {
  it("solo 'perdido' es un estado perdido", () => {
    expect(isLostPetStatus("perdido")).toBe(true);
    for (const status of PET_STATUSES.filter((s): s is PetStatus => s !== "perdido")) {
      expect(isLostPetStatus(status)).toBe(false);
    }
  });
});

describe("isTerminalPetStatus", () => {
  it("solo 'fallecido' es terminal", () => {
    expect(isTerminalPetStatus("fallecido")).toBe(true);
    for (const status of PET_STATUSES.filter((s): s is PetStatus => s !== "fallecido")) {
      expect(isTerminalPetStatus(status)).toBe(false);
    }
  });
});

describe("isAdoptionPetStatus", () => {
  it("marca estados del ciclo de adopción", () => {
    expect(isAdoptionPetStatus("en_adopcion")).toBe(true);
    expect(isAdoptionPetStatus("adoptado")).toBe(true);
    expect(isAdoptionPetStatus("rescatado")).toBe(true);
    expect(isAdoptionPetStatus("en_casa")).toBe(false);
    expect(isAdoptionPetStatus("perdido")).toBe(false);
    expect(isAdoptionPetStatus("fallecido")).toBe(false);
  });
});

describe("resolveEffectivePetState", () => {
  it("en_casa sin alerta ni flag estático: estado efectivo en_casa", () => {
    const state = resolveEffectivePetState({
      estado: "en_casa",
      emergencia: EMERGENCIA,
      alert: null,
    });
    expect(state).toEqual({
      status: "en_casa",
      isLost: false,
      lostOverlay: "none",
      zonaPerdida: null,
      fechaPerdida: null,
      mensaje: null,
      recompensa: null,
    });
  });

  it("perdido estático sin alerta runtime: overlay estático y datos de emergencia", () => {
    const state = resolveEffectivePetState({
      estado: "perdido",
      emergencia: EMERGENCIA_PERDIDA,
      alert: null,
    });
    expect(state).toEqual({
      status: "perdido",
      isLost: true,
      lostOverlay: "static",
      zonaPerdida: EMERGENCIA_PERDIDA.zonaPerdida,
      fechaPerdida: EMERGENCIA_PERDIDA.fechaPerdida,
      mensaje: EMERGENCIA_PERDIDA.mensajeEmergencia,
      recompensa: EMERGENCIA_PERDIDA.recompensa,
    });
  });

  it("alerta runtime activa impone estado efectivo perdido sin tocar el canónico", () => {
    const state = resolveEffectivePetState({
      estado: "en_casa",
      emergencia: EMERGENCIA,
      alert: { active: true, zonaPerdida: "Otra zona", fechaPerdida: "2026-09-15", recompensa: 900 },
    });
    expect(state.status).toBe("perdido");
    expect(state.isLost).toBe(true);
    expect(state.lostOverlay).toBe("runtime");
    expect(state.zonaPerdida).toBe("Otra zona");
    expect(state.fechaPerdida).toBe("2026-09-15");
    expect(state.recompensa).toBe(900);
  });

  it("la alerta runtime gana sobre el flag estático (precedencia FASE 2)", () => {
    const state = resolveEffectivePetState({
      estado: "perdido",
      emergencia: EMERGENCIA_PERDIDA,
      alert: { active: true, zonaPerdida: "Zona nueva" },
    });
    expect(state.isLost).toBe(true);
    expect(state.lostOverlay).toBe("runtime");
    expect(state.zonaPerdida).toBe("Zona nueva");
    expect(state.fechaPerdida).toBe(EMERGENCIA_PERDIDA.fechaPerdida);
  });

  it("campos faltantes de la alerta caen al estado estático (semántica ?? histórica)", () => {
    const state = resolveEffectivePetState({
      estado: "perdido",
      emergencia: EMERGENCIA_PERDIDA,
      alert: { active: true },
    });
    expect(state.zonaPerdida).toBe(EMERGENCIA_PERDIDA.zonaPerdida);
    expect(state.fechaPerdida).toBe(EMERGENCIA_PERDIDA.fechaPerdida);
    expect(state.mensaje).toBe(EMERGENCIA_PERDIDA.mensajeEmergencia);
    expect(state.recompensa).toBe(EMERGENCIA_PERDIDA.recompensa);
  });

  it("preserva estados futuros del ciclo de vida (en_adopcion)", () => {
    const state = resolveEffectivePetState({
      estado: "en_adopcion",
      emergencia: EMERGENCIA,
      alert: null,
    });
    expect(state.status).toBe("en_adopcion");
    expect(state.isLost).toBe(false);
  });

  it("estados terminales bloquean el overlay de lost mode runtime", () => {
    const state = resolveEffectivePetState({
      estado: "fallecido",
      emergencia: EMERGENCIA,
      alert: { active: true, zonaPerdida: "Zona" },
    });
    expect(state.status).toBe("fallecido");
    expect(state.isLost).toBe(false);
    expect(state.lostOverlay).toBe("none");
    expect(state.zonaPerdida).toBeNull();
  });

  it("estados terminales bloquean el overlay aunque los datos sean inconsistentes", () => {
    const state = resolveEffectivePetState({
      estado: "fallecido",
      emergencia: EMERGENCIA_PERDIDA,
      alert: null,
    });
    expect(state.status).toBe("fallecido");
    expect(state.isLost).toBe(false);
    expect(state.lostOverlay).toBe("none");
  });
});