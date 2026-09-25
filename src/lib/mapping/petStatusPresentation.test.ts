import { describe, expect, it } from "vitest";
import { PetEmergency, PetStatus } from "@/types/pet";
import { LostAlert } from "@/types/emergency";
import { PET_STATUSES } from "@/lib/domain/petStatus";
import {
  getPetStatusMeta,
  resolvePetStatusView,
  type PetStatusTone,
} from "@/lib/mapping/petStatusPresentation";

function buildEmergency(overrides: Partial<PetEmergency> = {}): PetEmergency {
  return {
    perdido: false,
    fechaPerdida: null,
    zonaPerdida: null,
    mensajeEmergencia: null,
    recompensa: null,
    instrucciones: [],
    ...overrides,
  };
}

const runtimeAlert: LostAlert = {
  active: true,
  zonaPerdida: "Zona Runtime",
  fechaPerdida: "2026-09-10",
  mensaje: "Se perdió hoy",
  recompensa: 500,
};

const TONES: ReadonlyArray<PetStatusTone> = [
  "success",
  "danger",
  "adoption",
  "settled",
  "rescue",
  "muted",
];

describe("getPetStatusMeta", () => {
  it("expone presentación para cada estado válido", () => {
    for (const status of PET_STATUSES) {
      const meta = getPetStatusMeta(status);
      expect(meta.label).not.toBe("");
      expect(TONES).toContain(meta.tone);
      expect(meta.icon).toBeTruthy();
    }
  });

  it("etiqueta los estados del ciclo de vida", () => {
    expect(getPetStatusMeta("en_casa").label).toBe("En casa");
    expect(getPetStatusMeta("perdido").label).toBe("Perdido");
    expect(getPetStatusMeta("en_adopcion").label).toBe("En adopción");
    expect(getPetStatusMeta("adoptado").label).toBe("Adoptado");
    expect(getPetStatusMeta("rescatado").label).toBe("Rescatado");
    expect(getPetStatusMeta("fallecido").label).toBe("En memoria");
  });

  it("mantiene un color estable por estado: rojo para perdido, neutro para terminal", () => {
    expect(getPetStatusMeta("perdido").tone).toBe("danger");
    expect(getPetStatusMeta("fallecido").tone).toBe("muted");
    expect(getPetStatusMeta("en_casa").tone).toBe("success");
  });

  it("cae a un fallback seguro para estado desconocido", () => {
    expect(getPetStatusMeta("nuevo_estado" as PetStatus).label).toBe("Estado desconocido");
    expect(getPetStatusMeta("nuevo_estado" as PetStatus).tone).toBe("muted");
    expect(getPetStatusMeta(null).label).toBe("Estado desconocido");
    expect(getPetStatusMeta(undefined).label).toBe("Estado desconocido");
  });
});

describe("resolvePetStatusView", () => {
  it("en_casa sin señal → nada que mostrar", () => {
    const view = resolvePetStatusView({
      estado: "en_casa",
      emergencia: buildEmergency(),
      alert: null,
    });

    expect(view.kind).toBe("none");
    expect(view.effective.status).toBe("en_casa");
    expect(view.effective.isLost).toBe(false);
  });

  it("alerta runtime resuelve el estado efectivo a perdido", () => {
    const view = resolvePetStatusView({
      estado: "en_casa",
      emergencia: buildEmergency(),
      alert: runtimeAlert,
    });

    expect(view.kind).toBe("lost-mode");
    expect(view.effective.status).toBe("perdido");
    expect(view.effective.isLost).toBe(true);
    expect(view.effective.lostOverlay).toBe("runtime");
    expect(view.effective.zonaPerdida).toBe("Zona Runtime");
  });

  it("señal estática (emergencia.perdido) activa el modo perdido", () => {
    const view = resolvePetStatusView({
      estado: "en_casa",
      emergencia: buildEmergency({ perdido: true }),
      alert: null,
    });

    expect(view.kind).toBe("lost-mode");
    expect(view.effective.status).toBe("perdido");
    expect(view.effective.lostOverlay).toBe("static");
  });

  it("estados de adopción → banner informativo", () => {
    for (const status of ["en_adopcion", "adoptado", "rescatado"] as const) {
      const view = resolvePetStatusView({
        estado: status,
        emergencia: buildEmergency(),
        alert: null,
      });

      expect(view.kind).toBe("banner");
      expect(view.effective.status).toBe(status);
    }
  });

  it("fallecido bloquea el overlay aunque exista alerta runtime", () => {
    const view = resolvePetStatusView({
      estado: "fallecido",
      emergencia: buildEmergency(),
      alert: runtimeAlert,
    });

    expect(view.kind).toBe("banner");
    expect(view.effective.status).toBe("fallecido");
    expect(view.effective.isLost).toBe(false);
    expect(view.effective.lostOverlay).toBe("none");
  });

  it("fallecido bloquea el overlay aunque exista señal estática", () => {
    const view = resolvePetStatusView({
      estado: "fallecido",
      emergencia: buildEmergency({ perdido: true }),
      alert: null,
    });

    expect(view.kind).toBe("banner");
    expect(view.effective.status).toBe("fallecido");
    expect(view.effective.isLost).toBe(false);
  });
});