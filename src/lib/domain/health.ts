/**
 * Reglas puras de salud general (FASE 5).
 *
 * Capa: domain. No depende de React, Next.js, Supabase ni componentes.
 *
 * Cubre: desparasitación (5.2), historial médico (5.3), resumen sanitario
 * exportable (5.4) y completitud de datos ("datos faltantes").
 *
 * NO se inventan reglas clínicas. Las reglas calendáricas se limitan a
 * comparar fechas ISO y los estados se toman de los datos tal como están.
 */

import type { HealthConsultation, HealthDeworming, HealthExportSummary } from "@/types/health";
import type { PetProfile } from "@/types/pet";
import { compareIsoDates, normalizeIsoDate, todayIsoDate } from "./dateRules.ts";
import { getVaccineMissingFields, getVaccineNextDoseDate } from "./vaccine.ts";
import type { VaccineRecordInput } from "./vaccine.ts";

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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function isHealthDeworming(value: unknown): value is HealthDeworming {
  return parseHealthDeworming(value) !== null;
}

/**
 * Parsea un payload de desparasitación tolerante. Devuelve null si no es un
 * objeto o le falta `id`/`producto`/`fecha`; los campos opcionales vacíos se
 * normalizan a null y las fechas inválidas se descartan.
 */
export function parseHealthDeworming(raw: unknown): HealthDeworming | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = asNullableString(raw.id);
  const producto = asNullableString(raw.producto);
  const fecha = normalizeIsoDate(raw.fecha);

  if (id === null || producto === null || fecha === null) {
    return null;
  }

  return {
    id,
    producto,
    fecha,
    proximaFecha: normalizeIsoDate(raw.proximaFecha) ?? undefined,
    dosis: asNullableString(raw.dosis) ?? undefined,
    veterinario: asNullableString(raw.veterinario) ?? undefined,
    documentoUrl: asNullableString(raw.documentoUrl) ?? undefined,
    documentoId: asNullableString(raw.documentoId) ?? undefined,
    fechaCreacion: normalizeIsoDate(raw.fechaCreacion) ?? undefined,
    origen: asNullableString(raw.origen) ?? undefined,
  };
}

export function isHealthConsultation(value: unknown): value is HealthConsultation {
  return parseHealthConsultation(value) !== null;
}

/**
 * Parsea una consulta médica tolerante. Devuelve null si no es un objeto o le
 * falta `id`/`fecha`/`motivo`. `medicamentos` y `documentos` se normalizan a
 * arrays (pueden quedar vacíos).
 */
export function parseHealthConsultation(raw: unknown): HealthConsultation | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = asNullableString(raw.id);
  const fecha = normalizeIsoDate(raw.fecha);
  const motivo = asNullableString(raw.motivo);

  if (id === null || fecha === null || motivo === null) {
    return null;
  }

  const documentos = Array.isArray(raw.documentos)
    ? raw.documentos
        .filter(isRecord)
        .map((document) => {
          const nombre = asNullableString(document.nombre) ?? "";
          return {
            id: asNullableString(document.id) ?? nombre,
            nombre,
            url: asNullableString(document.url) ?? "",
          };
        })
    : [];

  return {
    id,
    fecha,
    motivo,
    diagnostico: asNullableString(raw.diagnostico) ?? undefined,
    tratamiento: asNullableString(raw.tratamiento) ?? undefined,
    medicamentos: asStringArray(raw.medicamentos),
    veterinario: asNullableString(raw.veterinario) ?? undefined,
    documentos,
    fechaCreacion: normalizeIsoDate(raw.fechaCreacion) ?? undefined,
    origen: asNullableString(raw.origen) ?? undefined,
  };
}

export function getDewormingNextDate(deworming: HealthDeworming): string | null {
  return normalizeIsoDate(deworming.proximaFecha);
}

export function hasDewormingNextDate(deworming: HealthDeworming): boolean {
  return getDewormingNextDate(deworming) !== null;
}

export function hasDewormingDocument(deworming: HealthDeworming): boolean {
  return (
    asNullableString(deworming.documentoUrl) !== null ||
    asNullableString(deworming.documentoId) !== null
  );
}

export type DewormingSortOrder = "cronologico" | "reverso";

/** Orden cronológico por fecha de aplicación; sin fecha válida van al final. */
export function sortDewormingsByDate(
  dewormings: ReadonlyArray<HealthDeworming>,
  order: DewormingSortOrder = "cronologico",
): HealthDeworming[] {
  const withDate: Array<{ item: HealthDeworming; date: string }> = [];
  const withoutDate: HealthDeworming[] = [];

  for (const item of dewormings) {
    const date = normalizeIsoDate(item.fecha);
    if (date !== null) {
      withDate.push({ item, date });
    } else {
      withoutDate.push(item);
    }
  }

  withDate.sort((a, b) => {
    const diff = compareIsoDates(a.date, b.date);
    return order === "cronologico" ? diff : -diff;
  });

  return [...withDate.map(({ item }) => item), ...withoutDate];
}

/**
 * Próxima desparasitación pendiente (FASE 5.2).
 *
 * Regla calendárica: se consideran los registros con `proximaFecha`. Los que
 * ya pasaron son `vencida` (requieren acción); el de hoy es `entrega_hoy`; se
 * elige la próxima más cercana como `programada`. Sin ningún `proximaFecha`
 * válido devuelve null.
 */
export type DewormingDueKind = "vencida" | "entrega_hoy" | "programada";

export type DewormingDue = {
  deworming: HealthDeworming;
  kind: DewormingDueKind;
  fecha: string;
};

export function resolveNextDewormingDue(
  dewormings: ReadonlyArray<HealthDeworming>,
  today?: string,
): DewormingDue | null {
  const todayIso = todayIsoDate(today);

  let overdue: DewormingDue | null = null;
  let todayDue: DewormingDue | null = null;
  let upcoming: DewormingDue | null = null;

  for (const item of dewormings) {
    const fecha = getDewormingNextDate(item);
    if (fecha === null) {
      continue;
    }

    if (fecha < todayIso) {
      if (overdue === null || fecha > overdue.fecha) {
        overdue = { deworming: item, kind: "vencida", fecha };
      }
      continue;
    }

    if (fecha === todayIso) {
      if (todayDue === null) {
        todayDue = { deworming: item, kind: "entrega_hoy", fecha };
      }
      continue;
    }

    if (upcoming === null || fecha < upcoming.fecha) {
      upcoming = { deworming: item, kind: "programada", fecha };
    }
  }

  return overdue ?? todayDue ?? upcoming;
}

export function sortConsultationsByDate(
  consultations: ReadonlyArray<HealthConsultation>,
  order: "cronologico" | "reverso" = "cronologico",
): HealthConsultation[] {
  const withDate: Array<{ item: HealthConsultation; date: string }> = [];
  const withoutDate: HealthConsultation[] = [];

  for (const item of consultations) {
    const date = normalizeIsoDate(item.fecha);
    if (date !== null) {
      withDate.push({ item, date });
    } else {
      withoutDate.push(item);
    }
  }

  withDate.sort((a, b) => {
    const diff = compareIsoDates(a.date, b.date);
    return order === "cronologico" ? diff : -diff;
  });

  return [...withDate.map(({ item }) => item), ...withoutDate];
}

export type ConsultationsSummary = {
  total: number;
  conDiagnostico: number;
  conTratamiento: number;
  conMedicamentos: number;
  sinVeterinario: number;
};

/** Resumen del historial médico (FASE 5.3). */
export function getConsultationsSummary(
  consultations: ReadonlyArray<HealthConsultation>,
): ConsultationsSummary {
  let conDiagnostico = 0;
  let conTratamiento = 0;
  let conMedicamentos = 0;
  let sinVeterinario = 0;

  for (const consultation of consultations) {
    if (asNullableString(consultation.diagnostico) !== null) conDiagnostico += 1;
    if (asNullableString(consultation.tratamiento) !== null) conTratamiento += 1;
    if (consultation.medicamentos.length > 0) conMedicamentos += 1;
    if (asNullableString(consultation.veterinario) === null) sinVeterinario += 1;
  }

  return {
    total: consultations.length,
    conDiagnostico,
    conTratamiento,
    conMedicamentos,
    sinVeterinario,
  };
}

/** Campos de valor informativo vacíos de una consulta. */
export function getConsultationMissingFields(consultation: HealthConsultation): string[] {
  const missing: string[] = [];

  if (asNullableString(consultation.motivo) === null) missing.push("motivo");
  if (asNullableString(consultation.diagnostico) === null) missing.push("diagnostico");
  if (asNullableString(consultation.tratamiento) === null) missing.push("tratamiento");
  if (asNullableString(consultation.veterinario) === null) missing.push("veterinario");
  if (consultation.medicamentos.length === 0) missing.push("medicamentos");
  if (consultation.documentos.length === 0) missing.push("documentos");

  return missing;
}

/** Campos de valor informativo vacíos de una desparasitación. */
export function getDewormingMissingFields(deworming: HealthDeworming): string[] {
  const missing: string[] = [];

  if (getDewormingNextDate(deworming) === null) missing.push("proximaFecha");
  if (asNullableString(deworming.dosis) === null) missing.push("dosis");
  if (asNullableString(deworming.veterinario) === null) missing.push("veterinario");
  if (!hasDewormingDocument(deworming)) missing.push("documentoUrl");

  return missing;
}

/**
 * Reporte de completitud del expediente de salud ("datos faltantes").
 *
 * Solo señala la AUSENCIA de campos informativos dentro de entidades; no es
 * una validación de datos (eso es dataValidation) ni una evaluación clínica.
 */
export type HealthCompletenessItem = {
  entity: "vacuna" | "desparasitacion" | "consulta";
  id: string;
  missingFields: ReadonlyArray<string>;
};

export type HealthCompletenessReport = {
  items: HealthCompletenessItem[];
  totalMissing: number;
  complete: boolean;
};

export function getHealthCompletenessReport(pet: PetProfile): HealthCompletenessReport {
  const items: HealthCompletenessItem[] = [];
  let totalMissing = 0;

  const add = (entity: HealthCompletenessItem["entity"], id: string, missing: ReadonlyArray<string>): void => {
    if (missing.length === 0) return;
    items.push({ entity, id, missingFields: missing });
    totalMissing += missing.length;
  };

  for (const vaccine of pet.vacunas ?? []) {
    add("vacuna", vaccine.id, getVaccineMissingFields(vaccine as VaccineRecordInput));
  }

  for (const deworming of pet.desparasitaciones ?? []) {
    add("desparasitacion", deworming.id, getDewormingMissingFields(deworming));
  }

  for (const consultation of pet.historialMedico ?? []) {
    add("consulta", consultation.id, getConsultationMissingFields(consultation));
  }

  return {
    items,
    totalMissing,
    complete: totalMissing === 0,
  };
}

export type HealthRecordCounts = {
  vacunas: number;
  desparasitaciones: number;
  consultas: number;
  alergias: number;
  condicionesMedicas: number;
  medicamentosActuales: number;
  veterinarioRegistrado: boolean;
};

/**
 * Indica si hay algún contenido de salud registrado (para estados vacíos de
 * la UI sin duplicar la lógica en componente alguno).
 */
export function getHealthRecordCounts(pet: PetProfile): HealthRecordCounts {
  return {
    vacunas: (pet.vacunas ?? []).length,
    desparasitaciones: (pet.desparasitaciones ?? []).length,
    consultas: (pet.historialMedico ?? []).length,
    alergias: pet.salud.alergias.length,
    condicionesMedicas: pet.salud.condicionesMedicas.length,
    medicamentosActuales: pet.salud.medicamentosActuales.length,
    veterinarioRegistrado:
      asNullableString(pet.veterinario.nombre) !== null ||
      asNullableString(pet.veterinario.clinica) !== null,
  };
}

export function hasHealthRecord(pet: PetProfile): boolean {
  const counts = getHealthRecordCounts(pet);
  return (
    counts.vacunas > 0 ||
    counts.desparasitaciones > 0 ||
    counts.consultas > 0 ||
    counts.alergias > 0 ||
    counts.condicionesMedicas > 0 ||
    counts.medicamentosActuales > 0 ||
    counts.veterinarioRegistrado
  );
}

function emptyVet(): HealthExportSummary["veterinario"] {
  return null;
}

function toVetSummary(pet: PetProfile): HealthExportSummary["veterinario"] {
  const nombre = asNullableString(pet.veterinario.nombre);
  const clinica = asNullableString(pet.veterinario.clinica);
  const telefono = asNullableString(pet.veterinario.telefono);

  if (nombre === null && clinica === null && telefono === null) {
    return emptyVet();
  }

  return { nombre: nombre ?? "", clinica: clinica ?? "", telefono: telefono ?? "" };
}

/**
 * Construye el resumen sanitario exportable (FASE 5.4).
 *
 * Contenido definido por el roadmap: identificación, vacunas,
 * desparasitación, alergias, condiciones, medicamentos, veterinario e
 * historial médico. Es un mapeo puro a datos planos; la generación final
 * (PDF/PNG/impresión) pertenece a la capa de servicios/UI.
 */
export function buildHealthExportSummary(pet: PetProfile, today?: string): HealthExportSummary {
  const vacunas = (pet.vacunas ?? []).map((vaccine) => ({
    nombre: vaccine.nombre,
    fechaAplicacion: normalizeIsoDate(vaccine.fechaAplicacion),
    proximaDosis: getVaccineNextDoseDate(vaccine as VaccineRecordInput),
    estatus: vaccine.estatus,
    lote: asNullableString(vaccine.lote),
    veterinario: asNullableString(vaccine.veterinario),
  }));

  const desparasitaciones = (pet.desparasitaciones ?? []).map((item) => ({
    producto: item.producto,
    fecha: item.fecha,
    proximaFecha: getDewormingNextDate(item),
    dosis: asNullableString(item.dosis),
    veterinario: asNullableString(item.veterinario),
  }));

  const historialMedico = (pet.historialMedico ?? []).map((consultation) => ({
    fecha: consultation.fecha,
    motivo: consultation.motivo,
    diagnostico: asNullableString(consultation.diagnostico),
    tratamiento: asNullableString(consultation.tratamiento),
    medicamentos: consultation.medicamentos,
    veterinario: asNullableString(consultation.veterinario),
  }));

  return {
    pet: {
      id: pet.id,
      nombre: pet.mascota.nombre,
      codigoPublico: pet.identificacion.codigoPublico,
      especie: pet.mascota.especie,
      raza: pet.mascota.raza,
      genero: pet.mascota.genero,
      fechaNacimiento: normalizeIsoDate(pet.mascota.fechaNacimiento),
    },
    identificacion: {
      microchip: asNullableString(pet.identificacion.microchip),
      estado: pet.estado,
      verificado: pet.verificado,
    },
    alergias: pet.salud.alergias,
    condicionesMedicas: pet.salud.condicionesMedicas,
    medicamentosActuales: pet.salud.medicamentosActuales,
    veterinario: toVetSummary(pet),
    vacunas,
    desparasitaciones,
    historialMedico,
    generadoEn: todayIsoDate(today),
  };
}