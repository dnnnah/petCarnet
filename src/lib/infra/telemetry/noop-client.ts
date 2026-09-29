import type { TelemetryEvent } from '@/lib/domain/telemetry/events';

export function createNoopTelemetryClient(): {
  track: (event: TelemetryEvent) => void;
} {
  return {
    track: () => {
      // No-op: no envio fuera de la app (preparado para futuro)
    },
  };
}

export const telemetryClient = createNoopTelemetryClient();
