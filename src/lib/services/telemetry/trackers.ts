import { telemetryClient } from '@/lib/infra/telemetry/noop-client';
import { nowMonotonic } from '@/lib/services/telemetry/time';
import type { TelemetryEvent } from '@/lib/domain/telemetry/events';

function emit(event: TelemetryEvent): void {
  telemetryClient.track(event);
}

export function trackRegistrationStarted(flow: 'onboarding' | 'manual' | 'import' = 'manual'): void {
  emit({ name: 'registration_started', timestamp: nowMonotonic(), context: { flow } });
}

export function trackRegistrationCompleted(
  flow: 'onboarding' | 'manual' | 'import' = 'manual',
  success: boolean = true
): void {
  emit({ name: 'registration_completed', timestamp: nowMonotonic(), context: { flow, success } });
}

export function trackQrGenerated(source: 'profile' | 'share' | 'preview' = 'profile'): void {
  emit({ name: 'qr_generated', timestamp: nowMonotonic(), context: { source } });
}
