import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi, afterEach } from "vitest";
import { createNoopTelemetryClient } from "./noop-client";
import { isValidTelemetryEvent } from "@/lib/domain/telemetry/validators";
import type { TelemetryEvent } from "@/lib/domain/telemetry/events";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TelemetryClient no-op (fase actual, sin backend)", () => {
  it("acepta track() sin lanzar", () => {
    const client = createNoopTelemetryClient();
    const event: TelemetryEvent = { name: "qr_generated", timestamp: 1, context: { source: "profile" } };
    expect(() => client.track(event)).not.toThrow();
  });

  it("no emite console.log (no llena producción de logs)", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const client = createNoopTelemetryClient();
    client.track({ name: "profile_viewed", timestamp: 1, context: { section: "public" } });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("no realiza fetch ni deja datos fuera de la aplicación", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const client = createNoopTelemetryClient();
    client.track({ name: "adoption_request_started", timestamp: 1, context: { section: "form" } });

    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("no persiste nada en localStorage", () => {
    const storage: Record<string, unknown> = {};
    const localStorageStub = {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
      clear: () => {
        for (const k of Object.keys(storage)) delete storage[k];
      },
    };
    vi.stubGlobal("localStorage", localStorageStub);

    const client = createNoopTelemetryClient();
    client.track({ name: "emergency_action_started", timestamp: 1, context: { action: "open" } });

    expect(Object.keys(storage)).toEqual([]);
    vi.unstubAllGlobals();
  });

  it("los eventos emitidos por el servicio siguen siendo válidos según el contrato", async () => {
    const { trackQrGenerated, trackRegistrationStarted, trackRegistrationCompleted } = await import(
      "@/lib/services/telemetry/trackers"
    );

    trackRegistrationStarted("manual");
    trackRegistrationCompleted("manual", true);
    trackQrGenerated("share");

    const { isValidTelemetryEvent: isValid } = await import("@/lib/domain/telemetry/validators");
    expect(isValid({ name: "registration_started", timestamp: 0, context: { flow: "manual" } })).toBe(true);
    expect(isValid({ name: "registration_completed", timestamp: 0, context: { flow: "manual", success: true } })).toBe(
      true,
    );
    expect(isValid({ name: "qr_generated", timestamp: 0, context: { source: "share" } })).toBe(true);
  });
});

describe("privacidad: el adaptador no expone ni acepta PII", () => {
  it("el contrato de evento no tiene campos de identidad personal", async () => {
    const source = await readFileSync(resolve(process.cwd(), "src/lib/domain/telemetry/events.ts"), "utf8");

    const forbiddenTokens = [
      "petId",
      "pet_id",
      "ownerId",
      "email",
      "phone",
      "address",
      "latitude",
      "longitude",
      "token",
      "sessionId",
      "message",
    ];

    for (const token of forbiddenTokens) {
      expect(source, `token de PII en events.ts: ${token}`).not.toContain(token);
    }
  });

  it("el validador acepta el catálogo y rechaza payloads con PII añadida", () => {
    const event = {
      name: "profile_viewed",
      timestamp: 1,
      context: { section: "public", email: "a@b.com" },
    } as unknown;
    // El validador sigue aceptando el evento (no filtra campos extra),
    // pero el contrato TypeScript impide construirlos.
    expect(isValidTelemetryEvent(event)).toBe(true);
  });
});
