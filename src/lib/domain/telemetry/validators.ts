import type { TelemetryEvent, TelemetryEventName } from '@/lib/domain/telemetry/events';

const EVENT_NAMES = new Set<TelemetryEventName>([
  'registration_started',
  'registration_completed',
  'qr_generated',
  'profile_viewed',
  'emergency_action_started',
  'found_pet_flow_started',
  'adoption_request_started',
]);

export function isValidTelemetryEvent(event: unknown): event is TelemetryEvent {
  if (!event || typeof event !== 'object') return false;
  const e = event as unknown as Record<string, unknown>;
  if (typeof e.name !== 'string' || !EVENT_NAMES.has(e.name as TelemetryEventName)) return false;
  if (typeof e.timestamp === 'undefined' || e.timestamp === null) return false;
  const ts = e.timestamp;
  if (typeof ts !== 'number' && typeof ts !== 'string') return false;
  if (typeof e.context !== 'object' || e.context === null) return false;
  const context = e.context as Record<string, unknown>;

  switch (e.name) {
    case 'registration_started':
      return isRegistrationContext(context);
    case 'registration_completed':
      return isRegistrationCompletedContext(context);
    case 'qr_generated':
      return isQrContext(context);
    case 'profile_viewed':
      return isProfileContext(context);
    case 'emergency_action_started':
      return isEmergencyContext(context);
    case 'found_pet_flow_started':
      return isFoundPetContext(context);
    case 'adoption_request_started':
      return isAdoptionContext(context);
    default:
      return false;
  }
}

function isRegistrationContext(c: Record<string, unknown>): boolean {
  return c.flow === 'onboarding' || c.flow === 'manual' || c.flow === 'import';
}

function isRegistrationCompletedContext(c: Record<string, unknown>): boolean {
  if (!isRegistrationContext(c)) return false;
  return typeof c.success === 'boolean';
}

function isQrContext(c: Record<string, unknown>): boolean {
  return c.source === 'profile' || c.source === 'share' || c.source === 'preview';
}

function isProfileContext(c: Record<string, unknown>): boolean {
  return c.section === 'public' || c.section === 'private' || c.section === 'print';
}

function isEmergencyContext(c: Record<string, unknown>): boolean {
  return c.action === 'open' || c.action === 'call' || c.action === 'share' || c.action === 'copied';
}

function isFoundPetContext(c: Record<string, unknown>): boolean {
  return c.step === 'started' || c.step === 'reported' || c.step === 'shared';
}

function isAdoptionContext(c: Record<string, unknown>): boolean {
  return c.section === 'list' || c.section === 'detail' || c.section === 'form';
}

export function sanitizeEvent(event: TelemetryEvent): TelemetryEvent {
  return { ...event };
}
