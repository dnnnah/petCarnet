import { describe, expect, it } from "vitest";
import { isValidTelemetryEvent, sanitizeEvent } from "./validators";
import type { TelemetryEvent } from "./events";

describe("contrato de eventos de telemetría", () => {
  it("acepta todos los eventos del catálogo con contexto válido", () => {
    const events: TelemetryEvent[] = [
      { name: "registration_started", timestamp: 0, context: { flow: "manual" } },
      { name: "registration_completed", timestamp: 1, context: { flow: "manual", success: true } },
      { name: "qr_generated", timestamp: 2, context: { source: "profile" } },
      { name: "profile_viewed", timestamp: 3, context: { section: "public" } },
      { name: "emergency_action_started", timestamp: 4, context: { action: "open" } },
      { name: "found_pet_flow_started", timestamp: 5, context: { step: "started" } },
      { name: "adoption_request_started", timestamp: 6, context: { section: "form" } },
    ];

    for (const event of events) {
      expect(isValidTelemetryEvent(event), `evento inválido: ${event.name}`).toBe(true);
    }
  });

  it("acepta timestamp ISO como string", () => {
    const event = {
      name: "qr_generated" as const,
      timestamp: "2026-01-01T00:00:00.000Z",
      context: { source: "share" as const },
    };
    expect(isValidTelemetryEvent(event)).toBe(true);
  });

  it("acepta duración cero (timestamp 0)", () => {
    const event = { name: "profile_viewed" as const, timestamp: 0, context: { section: "public" as const } };
    expect(isValidTelemetryEvent(event)).toBe(true);
  });

  it("rechaza nombres de evento desconocidos", () => {
    expect(
      isValidTelemetryEvent({ name: "user_born", timestamp: 1, context: { flow: "manual" } }),
    ).toBe(false);
  });

  it("rechaza contextos inválidos", () => {
    expect(
      isValidTelemetryEvent({ name: "registration_started", timestamp: 1, context: { flow: "otro" } }),
    ).toBe(false);
    expect(
      isValidTelemetryEvent({ name: "qr_generated", timestamp: 1, context: { source: "impresora" } }),
    ).toBe(false);
    expect(
      isValidTelemetryEvent({ name: "emergency_action_started", timestamp: 1, context: { action: "grabar" } }),
    ).toBe(false);
  });

  it("exige success booleano en registration_completed", () => {
    expect(
      isValidTelemetryEvent({ name: "registration_completed", timestamp: 1, context: { flow: "manual" } }),
    ).toBe(false);
    expect(
      isValidTelemetryEvent({ name: "registration_completed", timestamp: 1, context: { flow: "manual", success: "si" } }),
    ).toBe(false);
  });

  it("rechaza timestamp ausente o de tipo incorrecto", () => {
    expect(isValidTelemetryEvent({ name: "profile_viewed", context: { section: "public" } })).toBe(false);
    expect(isValidTelemetryEvent({ name: "profile_viewed", timestamp: {}, context: { section: "public" } })).toBe(
      false,
    );
  });

  it("rechaza valores no-objeto", () => {
    expect(isValidTelemetryEvent(null)).toBe(false);
    expect(isValidTelemetryEvent(undefined)).toBe(false);
    expect(isValidTelemetryEvent("registration_started")).toBe(false);
    expect(isValidTelemetryEvent(42)).toBe(false);
  });

  it("rechaza contexto ausente", () => {
    expect(isValidTelemetryEvent({ name: "profile_viewed", timestamp: 1 })).toBe(false);
    expect(isValidTelemetryEvent({ name: "profile_viewed", timestamp: 1, context: null })).toBe(false);
  });
});

describe("estabilidad y privacidad del catálogo", () => {
  it("mantiene exactamente los nombres definidos en el contrato", () => {
    const names = [
      "registration_started",
      "registration_completed",
      "qr_generated",
      "profile_viewed",
      "emergency_action_started",
      "found_pet_flow_started",
      "adoption_request_started",
    ].sort();

    const sample: TelemetryEvent[] = [
      { name: "registration_started", timestamp: 0, context: { flow: "manual" } },
      { name: "registration_completed", timestamp: 0, context: { flow: "manual", success: true } },
      { name: "qr_generated", timestamp: 0, context: { source: "profile" } },
      { name: "profile_viewed", timestamp: 0, context: { section: "public" } },
      { name: "emergency_action_started", timestamp: 0, context: { action: "open" } },
      { name: "found_pet_flow_started", timestamp: 0, context: { step: "started" } },
      { name: "adoption_request_started", timestamp: 0, context: { section: "form" } },
    ];
    const observed = sample.map((event) => event.name);

    expect([...new Set(observed)].sort()).toEqual(names);
  });

  it("no transporta campos de PII en el contrato", () => {
    const forbidden = [
      "petId",
      "pet_id",
      "ownerId",
      "ownerName",
      "email",
      "phone",
      "address",
      "latitude",
      "longitude",
      "token",
      "message",
      "sessionId",
    ];

    const event = {
      name: "profile_viewed" as const,
      timestamp: 0,
      context: { section: "public" as const },
    };

    for (const field of forbidden) {
      expect(Object.keys(event)).not.toContain(field);
      expect(Object.keys(event.context)).not.toContain(field);
    }
  });

  it("sanitizeEvent devuelve una copia sin alterar el original", () => {
    const event: TelemetryEvent = { name: "qr_generated", timestamp: 7, context: { source: "profile" } };
    const copy = sanitizeEvent(event);

    expect(copy).toEqual(event);
    expect(copy).not.toBe(event);
  });
});
