import { describe, expect, it } from "vitest";
import { KPI_TARGETS, TELEMETRY_EVENT_CATALOG } from "./catalog";
import type { TelemetryEvent } from "./events";
import { isValidTelemetryEvent } from "./validators";

describe("catálogo de eventos", () => {
  it("está alineado con el contrato de eventos", () => {
    const sample: TelemetryEvent[] = [
      { name: "registration_started", timestamp: 0, context: { flow: "manual" } },
      { name: "registration_completed", timestamp: 0, context: { flow: "manual", success: true } },
      { name: "qr_generated", timestamp: 0, context: { source: "profile" } },
      { name: "profile_viewed", timestamp: 0, context: { section: "public" } },
      { name: "emergency_action_started", timestamp: 0, context: { action: "open" } },
      { name: "found_pet_flow_started", timestamp: 0, context: { step: "started" } },
      { name: "adoption_request_started", timestamp: 0, context: { section: "form" } },
    ];

    expect(sample.map((event) => event.name).sort()).toEqual(
      TELEMETRY_EVENT_CATALOG.map((spec) => spec.name).sort(),
    );

    for (const event of sample) {
      expect(isValidTelemetryEvent(event), `evento de catálogo no reconocido: ${event.name}`).toBe(true);
    }
  });

  it("no define objetivos de KPI distintos a los del roadmap", () => {
    expect(KPI_TARGETS.registrationToQrMaxMs).toBe(120_000);
    expect(KPI_TARGETS.qrScanEffectivenessMinPct).toBe(95);
  });

  it("declara explícitamente los datos que cada evento nunca contiene", () => {
    for (const spec of TELEMETRY_EVENT_CATALOG) {
      expect(spec.neverContains.length, `falta neverContains en ${spec.name}`).toBeGreaterThan(0);
      expect(spec.contains.length, `falta contains en ${spec.name}`).toBeGreaterThan(0);
    }
  });
});
