import type { TelemetryEvent, TelemetryEventName } from './events';

export type TelemetryClient = {
  track: (event: TelemetryEvent) => void;
};

export type TelemetryMetric = {
  name: string;
  description: string;
  unit: string;
  derivedFrom: TelemetryEventName[];
};

export type TaskTimer = {
  start(): void;
  stop(): number | null;
  cancel(): void;
  getElapsedMs(): number | null;
  isRunning(): boolean;
};
