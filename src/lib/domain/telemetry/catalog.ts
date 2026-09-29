import type { TelemetryEventName } from './events';

export type TelemetryEventSpec = {
  name: TelemetryEventName;
  purpose: string;
  contains: string[];
  neverContains: string[];
  derives: string[];
};

export const TELEMETRY_EVENT_CATALOG: readonly TelemetryEventSpec[] = [
  {
    name: 'registration_started',
    purpose: 'Marca el inicio del alta de una mascota (KPI 8.1 registro).',
    contains: ['timestamp', 'flow'],
    neverContains: ['pet.id', 'datos del tutor', 'telefono', 'email', 'direccion'],
    derives: ['registration_to_qr_duration'],
  },
  {
    name: 'registration_completed',
    purpose: 'Marca el fin del alta de una mascota, exista o no exito (KPI 8.1).',
    contains: ['timestamp', 'flow', 'success'],
    neverContains: ['pet.id', 'datos del tutor', 'telefono', 'email'],
    derives: ['registration_completion_rate', 'registration_to_qr_duration'],
  },
  {
    name: 'qr_generated',
    purpose: 'Marca la generacion del QR publico de una mascota (KPI 8.1 y 8.2).',
    contains: ['timestamp', 'source'],
    neverContains: ['pet.id', 'slug del perfil', 'url completa del QR'],
    derives: ['registration_to_qr_duration', 'qr_scan_effectiveness'],
  },
  {
    name: 'profile_viewed',
    purpose: 'Cuenta visualizaciones del perfil (métrica futura 8.3).',
    contains: ['timestamp', 'section'],
    neverContains: ['pet.id', 'slug', 'IP', 'user-agent'],
    derives: ['profile_views'],
  },
  {
    name: 'emergency_action_started',
    purpose: 'Mide uso de acciones de emergencia (métrica futura 8.3).',
    contains: ['timestamp', 'action'],
    neverContains: ['telefono de contacto', 'nombre del tutor', 'contenido del mensaje'],
    derives: ['emergency_actions'],
  },
  {
    name: 'found_pet_flow_started',
    purpose: 'Mide el inicio del flujo de mascota encontrada (métrica futura 8.3).',
    contains: ['timestamp', 'step'],
    neverContains: ['pet.id', 'ubicacion', 'contacto del tutor'],
    derives: ['found_pet_flow_starts'],
  },
  {
    name: 'adoption_request_started',
    purpose: 'Mide el inicio de una solicitud de adopcion (métrica futura 8.3).',
    contains: ['timestamp', 'section'],
    neverContains: ['nombre', 'email', 'telefono', 'mensaje de solicitud'],
    derives: ['adoption_request_starts'],
  },
] as const;

export const KPI_TARGETS = {
  registrationToQrMaxMs: 120_000,
  qrScanEffectivenessMinPct: 95,
} as const;
