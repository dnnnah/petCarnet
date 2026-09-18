import {
  initialAdoptionRequestStatus,
  type AdoptionRequestError,
} from "@/lib/domain/adoption";
import type { AdoptionApplicant, AdoptionRequest, AdoptionRequestDraft } from "@/types/adoption";

export type AdoptionFormValues = {
  nombre: string;
  telefono: string;
  email: string;
  motivo: string;
  notas: string;
};

export const EMPTY_ADOPTION_FORM_VALUES: AdoptionFormValues = {
  nombre: "",
  telefono: "",
  email: "",
  motivo: "",
  notas: "",
};

export const ADOPTION_ERROR_COPY: Record<AdoptionRequestError, string> = {
  pet_no_disponible:
    "Esta mascota no está disponible para adopción en este momento. Si reportaste que se perdió, no se puede solicitar su adopción.",
  pet_no_coincide: "Los datos de la mascota no coinciden. Recarga la página e inténtalo de nuevo.",
  pet_requerido: "Falta el identificador de la mascota. Recarga la página e inténtalo de nuevo.",
  nombre_requerido: "Escribe tu nombre completo.",
  telefono_requerido: "Escribe un teléfono para ponernos en contacto contigo.",
  telefono_invalido: "El teléfono debe tener 10 dígitos (o formato México 52/521).",
  email_invalido: "El correo no tiene un formato válido.",
  motivo_requerido: "Cuéntanos por qué quieres adoptar a esta mascota.",
  fecha_invalida: "La fecha de la solicitud no es válida. Recarga la página e inténtalo de nuevo.",
};

export type AdoptionFieldError = keyof Pick<
  AdoptionFormValues,
  "nombre" | "telefono" | "email" | "motivo"
>;

const FIELD_FOR_ERROR: Partial<Record<AdoptionRequestError, AdoptionFieldError | "general">> = {
  pet_no_disponible: "general",
  pet_no_coincide: "general",
  pet_requerido: "general",
  fecha_invalida: "general",
  nombre_requerido: "nombre",
  telefono_requerido: "telefono",
  telefono_invalido: "telefono",
  email_invalido: "email",
  motivo_requerido: "motivo",
};

export function mapAdoptionValidationErrors(errors: ReadonlyArray<AdoptionRequestError>): {
  fields: Partial<Record<AdoptionFieldError, string>>;
  general: string[];
} {
  const fields: Partial<Record<AdoptionFieldError, string>> = {};
  const general: string[] = [];

  for (const error of errors) {
    const copy = ADOPTION_ERROR_COPY[error];
    const target = FIELD_FOR_ERROR[error];

    if (target === undefined || target === "general") {
      general.push(copy);
    } else if (fields[target] === undefined) {
      fields[target] = copy;
    }
  }

  return { fields, general };
}

export function todayInMexicoISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildAdoptionRequestDraft(
  petId: string,
  fechaEnviada: string,
  values: AdoptionFormValues,
): AdoptionRequestDraft {
  const notas = values.notas.trim();
  const aspirante: AdoptionApplicant = {
    nombre: values.nombre.trim(),
    telefono: values.telefono.trim(),
    email: values.email.trim() === "" ? null : values.email.trim(),
    motivo: values.motivo.trim(),
  };

  return {
    petId,
    fechaEnviada,
    aspirante,
    notas: notas === "" ? null : notas,
  };
}

export function buildAdoptionRequestFromDraft(
  draft: AdoptionRequestDraft,
  seed: string,
): AdoptionRequest {
  return {
    id: `sol-${seed}`,
    petId: draft.petId,
    shelterId: null,
    estado: initialAdoptionRequestStatus(),
    fechaEnviada: draft.fechaEnviada,
    notas: draft.notas ?? null,
    aspirante: {
      nombre: draft.aspirante.nombre,
      telefono: draft.aspirante.telefono,
      email: draft.aspirante.email,
      motivo: draft.aspirante.motivo,
    },
  };
}