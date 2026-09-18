/**
 * Contratos de dominio de salud (FASE 5).
 *
 * Capa: types / contratos.
 * No dependen de React, Next.js, Supabase ni componentes.
 *
 * Backward-compatible: son entidades NUEVAS o campos opcionales añadidos a
 * contratos existentes. No se altera ningún campo existente de PetProfile.
 */

/**
 * Referencia a un documento dentro de una entidad de salud.
 * Puede corresponder a un `PetDocument` (mismo `id`/`url`) o ser un adjunto
 * independiente aun no subido a `PetProfile.documentos`.
 */
export type HealthDocumentRef = {
  id: string;
  nombre: string;
  url: string;
};

/**
 * Registro de desparasitación (FASE 5.2).
 *
 * Campos requeridos por el contrato: `id`, `producto`, `fecha`.
 * El resto son opcionales y se modelan como "dato faltante" cuando están
 * vacíos; NO se invalidan como error de datos (son datos incompletos, no
 * incorrectos).
 */
export type HealthDeworming = {
  id: string;
  producto: string;
  /** Fecha de aplicación (ISO YYYY-MM-DD). */
  fecha: string;
  /** Próxima fecha sugerida de desparasitación (ISO YYYY-MM-DD). */
  proximaFecha?: string;
  dosis?: string;
  veterinario?: string;
  documentoUrl?: string;
  /** Vincula la desparasitación a un `PetDocument` existente. */
  documentoId?: string;
  /** Fecha de creación del registro (ISO YYYY-MM-DD). */
  fechaCreacion?: string;
  /** Origen del registro (texto libre; p. ej. "veterinario", "manual"). */
  origen?: string;
};

/**
 * Consulta del historial médico (FASE 5.3).
 *
 * Campos requeridos: `id`, `fecha`, `motivo`.
 * `medicamentos` y `documentos` son arrays (pueden estar vacíos).
 */
export type HealthConsultation = {
  id: string;
  /** Fecha de la consulta (ISO YYYY-MM-DD). */
  fecha: string;
  motivo: string;
  diagnostico?: string;
  tratamiento?: string;
  medicamentos: string[];
  veterinario?: string;
  documentos: HealthDocumentRef[];
  /** Fecha de creación del registro (ISO YYYY-MM-DD). */
  fechaCreacion?: string;
  /** Origen del registro (texto libre). */
  origen?: string;
};

/**
 * Resumen sanitario exportable (FASE 5.4).
 *
 * Contenido definido por el roadmap: identificación, vacunas,
 * desparasitación, alergias, condiciones, medicamentos, veterinario e
 * historial médico. Este es el CONTRATO de contenido; la generación del PDF
 * (o PNG/SVG/impresión) pertenece a la capa de servicios/UI y no a este
 * dominio.
 */
export type HealthExportSummary = {
  pet: {
    id: string;
    nombre: string;
    codigoPublico: string;
    especie: string;
    raza: string;
    genero: string;
    fechaNacimiento: string | null;
  };
  identificacion: {
    microchip: string | null;
    estado: string;
    verificado: boolean;
  };
  alergias: ReadonlyArray<string>;
  condicionesMedicas: ReadonlyArray<string>;
  medicamentosActuales: ReadonlyArray<string>;
  veterinario: {
    nombre: string;
    clinica: string;
    telefono: string;
  } | null;
  vacunas: ReadonlyArray<{
    nombre: string;
    fechaAplicacion: string | null;
    proximaDosis: string | null;
    estatus: string | null;
    lote: string | null;
    veterinario: string | null;
  }>;
  desparasitaciones: ReadonlyArray<{
    producto: string;
    fecha: string;
    proximaFecha: string | null;
    dosis: string | null;
    veterinario: string | null;
  }>;
  historialMedico: ReadonlyArray<{
    fecha: string;
    motivo: string;
    diagnostico: string | null;
    tratamiento: string | null;
    medicamentos: ReadonlyArray<string>;
    veterinario: string | null;
  }>;
  /** Fecha de generación del resumen (ISO YYYY-MM-DD). */
  generadoEn: string;
};