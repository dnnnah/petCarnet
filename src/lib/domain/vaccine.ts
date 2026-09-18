/**
 * Reglas puras de vacunación (FASE 5.1).
 *
 * Capa: domain. No depende de React, Next.js, Supabase ni componentes.
 *
 * Las reglas documentadas se derivan de:
 * - la forma actual de los datos (`PetVaccine`);
 * - los estados explícitos ya presentes (`VaccineStatus`);
 * - las mejoras que FASE 5.1 solicita: historial completo, orden
 *   cronológico, filtros, alertas de próxima dosis, documento asociado,
 *   fecha de creación y origen del registro.
 *
 * NO se inventan reglas clínicas. Las comparaciones de fecha son puramente
 * calendáricas (¿la próxima dosis ya pasó?, ¿es hoy?) y los estados se toman
 * de los datos tal como están; nunca se "recalcula" el `estatus` almacenado.
 */

import type { VaccineStatus } from "@/types/pet";
import { compareIsoDates, normalizeIsoDate, todayIsoDate } from "./dateRules.ts";

export const VACCINE_STATUSES: readonly VaccineStatus[] = ["al_dia", "proxima_dosis", "vencida"];

export const VACCINE_STATUS_ALL = "todos" as const;

export type VaccineStatusFilter = VaccineStatus | typeof VACCINE_STATUS_ALL;

export function isVaccineStatus(value: unknown): value is VaccineStatus {
  return (
    typeof value === "string" && (VACCINE_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Vista de vacuna aceptada por las reglas. Es una supertipo estructural de
 * `PetVaccine`: permite datos incompletos (campos opcionales o null) para
 * poder razonar sobre registros parciales sin romper el tipo existente.
 */
export type VaccineRecordInput = {
  id?: string | null;
  nombre?: string | null;
  fechaAplicacion?: string | null;
  proximaDosis?: string | null;
  estatus?: VaccineStatus | null;
  lote?: string | null;
  veterinario?: string | null;
  documentoUrl?: string | null;
  documentoId?: string | null;
  fechaCreacion?: string | null;
  origen?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Parsea un payload desconocido a una vista de vacuna tolerante. Devuelve
 * null solo si no es un objeto o si le falta `id`. Los campos vacíos se
 * normalizan a null; las fechas inválidas se descartan.
 */
export function parseVaccineRecord(raw: unknown): VaccineRecordInput | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = asNullableString(raw.id);
  if (id === null) {
    return null;
  }

  const record: VaccineRecordInput = {
    id,
    nombre: asNullableString(raw.nombre),
    fechaAplicacion: normalizeIsoDate(raw.fechaAplicacion),
    proximaDosis: normalizeIsoDate(raw.proximaDosis),
    estatus: isVaccineStatus(raw.estatus) ? raw.estatus : null,
    lote: asNullableString(raw.lote),
    veterinario: asNullableString(raw.veterinario),
    documentoUrl: asNullableString(raw.documentoUrl),
    documentoId: asNullableString(raw.documentoId),
    fechaCreacion: normalizeIsoDate(raw.fechaCreacion),
    origen: asNullableString(raw.origen),
  };

  return record;
}

/** Fecha de aplicación normalizada (o null si falta/es inválida). */
export function getVaccineApplicationDate(vaccine: VaccineRecordInput): string | null {
  return normalizeIsoDate(vaccine.fechaAplicacion);
}

/** Próxima dosis normalizada (o null si falta/es inválida). */
export function getVaccineNextDoseDate(vaccine: VaccineRecordInput): string | null {
  return normalizeIsoDate(vaccine.proximaDosis);
}

/**
 * Núcleo de la vacuna según la forma actual de los datos: id, nombre,
 * fecha de aplicación y estatus. Señala en `missing` qué campos faltan.
 */
export function evaluateVaccineCore(vaccine: VaccineRecordInput): {
  complete: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (asNullableString(vaccine.id) === null) missing.push("id");
  if (asNullableString(vaccine.nombre) === null) missing.push("nombre");
  if (getVaccineApplicationDate(vaccine) === null) missing.push("fechaAplicacion");
  if (!isVaccineStatus(vaccine.estatus)) missing.push("estatus");

  return { complete: missing.length === 0, missing };
}

/** Campos de valor informativo vacíos (próxima dosis, lote, veterinario, documento). */
export function getVaccineMissingFields(vaccine: VaccineRecordInput): string[] {
  const missing: string[] = [];

  if (getVaccineNextDoseDate(vaccine) === null) missing.push("proximaDosis");
  if (asNullableString(vaccine.lote) === null) missing.push("lote");
  if (asNullableString(vaccine.veterinario) === null) missing.push("veterinario");
  if (!hasVaccineDocument(vaccine)) missing.push("documentoUrl");

  return missing;
}

export function hasVaccineNextDose(vaccine: VaccineRecordInput): boolean {
  return getVaccineNextDoseDate(vaccine) !== null;
}

export function hasVaccineDocument(vaccine: VaccineRecordInput): boolean {
  return (
    asNullableString(vaccine.documentoUrl) !== null ||
    asNullableString(vaccine.documentoId) !== null
  );
}

export type VaccineSortOrder = "cronologico" | "reverso";

/**
 * Orden cronológico (FASE 5.1) por `fechaApplication`. Los registros sin
 * fecha válida van al final conservando su orden relativo (estable).
 */
export function sortVaccinesByDate<T extends VaccineRecordInput>(
  vaccines: ReadonlyArray<T>,
  order: VaccineSortOrder = "cronologico",
): T[] {
  const withDate: Array<{ vaccine: T; date: string }> = [];
  const withoutDate: T[] = [];

  for (const vaccine of vaccines) {
    const date = getVaccineApplicationDate(vaccine);
    if (date !== null) {
      withDate.push({ vaccine, date });
    } else {
      withoutDate.push(vaccine);
    }
  }

  withDate.sort((a, b) => {
    const diff = compareIsoDates(a.date, b.date);
    return order === "cronologico" ? diff : -diff;
  });

  return [...withDate.map(({ vaccine }) => vaccine), ...withoutDate];
}

export function filterVaccinesByStatus<T extends VaccineRecordInput>(
  vaccines: ReadonlyArray<T>,
  status: VaccineStatusFilter,
): T[] {
  if (status === VACCINE_STATUS_ALL) {
    return [...vaccines];
  }
  return vaccines.filter((vaccine) => vaccine.estatus === status);
}

function foldToSearchableText(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-MX");
}

function normalizeQuery(query: string): string {
  return foldToSearchableText(query);
}

function searchableText(vaccine: VaccineRecordInput): string {
  return (
    [vaccine.nombre, vaccine.lote, vaccine.veterinario, vaccine.documentoUrl, vaccine.origen]
      .filter((value): value is string => typeof value === "string")
      .join(" ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es-MX")
  );
}

export function filterVaccinesByQuery<T extends VaccineRecordInput>(
  vaccines: ReadonlyArray<T>,
  query: string,
): T[] {
  const normalized = normalizeQuery(query);
  if (normalized === "") {
    return [...vaccines];
  }
  return vaccines.filter((vaccine) => searchableText(vaccine).includes(normalized));
}

export type VaccineFilter = {
  status?: VaccineStatusFilter;
  query?: string;
};

export function filterVaccines<T extends VaccineRecordInput>(
  vaccines: ReadonlyArray<T>,
  filter: VaccineFilter = {},
): T[] {
  const byStatus = filterVaccinesByStatus(vaccines, filter.status ?? VACCINE_STATUS_ALL);
  return filterVaccinesByQuery(byStatus, filter.query ?? "");
}

/**
 * Conteos por estado explícito (FASE 5.1 "historial completo"). Los estados
 * se toman tal cual del dato; un estatus inválido se cuenta como `desconocido`.
 */
export function countVaccinesByStatus<T extends VaccineRecordInput>(
  vaccines: ReadonlyArray<T>,
): {
  total: number;
  al_dia: number;
  proxima_dosis: number;
  vencida: number;
  desconocido: number;
} {
  const counts = { al_dia: 0, proxima_dosis: 0, vencida: 0, desconocido: 0 };

  for (const vaccine of vaccines) {
    const status = vaccine.estatus;
    if (status === "al_dia" || status === "proxima_dosis" || status === "vencida") {
      counts[status] += 1;
    } else {
      counts.desconocido += 1;
    }
  }

  return { total: vaccines.length, ...counts };
}

/**
 * Alertas de próxima dosis (FASE 5.1).
 *
 * Regla (calendárica, sin criterio clínico):
 * - `vencida`: el registro está marcado `vencida` O la próxima dosis ya
 *   pasó (fecha < hoy).
 * - `vence_hoy`: la próxima dosis es exactamente hoy.
 * - `marcada_proxima`: el registro está marcado `proxima_dosis` y aún no ha
 *   pasado su fecha.
 *
 * El estatus explícito tiene prioridad; la fecha solo afina cuando no hay
 * conflicto. Sin datos de fecha y sin marcado, no hay alerta.
 */
export type VaccineNextDoseAlertKind = "marcada_proxima" | "vence_hoy" | "vencida";

export type VaccineNextDoseAlert<K extends VaccineRecordInput = VaccineRecordInput> = {
  vaccine: K;
  kind: VaccineNextDoseAlertKind;
};

export function resolveVaccineNextDoseAlert<K extends VaccineRecordInput>(
  vaccine: K,
  today?: string,
): VaccineNextDoseAlert<K> | null {
  const todayIso = todayIsoDate(today);

  if (vaccine.estatus === "vencida") {
    return { vaccine, kind: "vencida" };
  }

  const nextDose = getVaccineNextDoseDate(vaccine);
  if (nextDose === null) {
    return null;
  }

  if (nextDose < todayIso) {
    return { vaccine, kind: "vencida" };
  }
  if (nextDose === todayIso) {
    return { vaccine, kind: "vence_hoy" };
  }

  if (vaccine.estatus === "proxima_dosis") {
    return { vaccine, kind: "marcada_proxima" };
  }

  return null;
}

export function getVaccinesNeedingNextDose<K extends VaccineRecordInput>(
  vaccines: ReadonlyArray<K>,
  today?: string,
): Array<VaccineNextDoseAlert<K>> {
  const alerts: Array<VaccineNextDoseAlert<K>> = [];
  for (const vaccine of vaccines) {
    const alert = resolveVaccineNextDoseAlert(vaccine, today);
    if (alert !== null) {
      alerts.push(alert);
    }
  }
  return alerts;
}

/**
 * Documento asociado (FASE 5.1): resuelve el vínculo a `PetDocument` por
 * `documentoId` (preferente) o por `documentoUrl` (equivalencia histórica).
 */
export function linkVaccineDocument<K extends VaccineRecordInput>(
  vaccine: K,
  documents: ReadonlyArray<{ id: string; url: string }>,
): (typeof documents)[number] | null {
  const documentoId = asNullableString(vaccine.documentoId);
  if (documentoId !== null) {
    const byId = documents.find((document) => document.id === documentoId);
    if (byId) {
      return byId;
    }
  }

  const documentoUrl = asNullableString(vaccine.documentoUrl);
  if (documentoUrl !== null) {
    return documents.find((document) => document.url === documentoUrl) ?? null;
  }

  return null;
}