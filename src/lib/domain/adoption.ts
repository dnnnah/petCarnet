import { isTerminalPetStatus, resolveEffectivePetState } from "./petStatus.ts";
import type { ResolveEffectivePetStateInput } from "./petStatus.ts";
import type { LostAlert } from "../../types/emergency";
import type { PetProfile, PetStatus } from "../../types/pet";
import type { Shelter } from "../../types/shelter";
import type {
  AdoptionCatalogEntry,
  AdoptionRequestDraft,
  AdoptionRequestStatus,
} from "../../types/adoption";

export const ADOPTION_REQUEST_STATUSES: readonly AdoptionRequestStatus[] = [
  "enviada",
  "en_revision",
  "aprobada",
  "rechazada",
  "cancelada",
  "completada",
];

export const ADOPTABLE_PET_STATUS: PetStatus = "en_adopcion";

export function isAdoptionRequestStatus(value: unknown): value is AdoptionRequestStatus {
  return (
    typeof value === "string" && (ADOPTION_REQUEST_STATUSES as readonly string[]).includes(value)
  );
}

export function initialAdoptionRequestStatus(): AdoptionRequestStatus {
  return "enviada";
}

export type AdoptionUnavailableReason = "estado_no_disponible" | "perdido" | "terminal";

export type AdoptionAvailability = {
  available: boolean;
  reason: AdoptionUnavailableReason | null;
  effectiveStatus: PetStatus;
};

export function resolveAdoptionAvailability(
  input: ResolveEffectivePetStateInput,
): AdoptionAvailability {
  const effective = resolveEffectivePetState(input);

  if (isTerminalPetStatus(effective.status)) {
    return { available: false, reason: "terminal", effectiveStatus: effective.status };
  }

  if (effective.isLost) {
    return { available: false, reason: "perdido", effectiveStatus: effective.status };
  }

  if (effective.status !== ADOPTABLE_PET_STATUS) {
    return { available: false, reason: "estado_no_disponible", effectiveStatus: effective.status };
  }

  return { available: true, reason: null, effectiveStatus: effective.status };
}

export function isPetAvailableForAdoption(input: ResolveEffectivePetStateInput): boolean {
  return resolveAdoptionAvailability(input).available;
}

export function filterPetsInAdoption(pets: ReadonlyArray<PetProfile>): PetProfile[] {
  return pets.filter((pet) => pet.estado === ADOPTABLE_PET_STATUS);
}

export function filterAdoptablePets(
  pets: ReadonlyArray<PetProfile>,
  alertResolver?: (pet: PetProfile) => LostAlert | null,
): PetProfile[] {
  return pets.filter((pet) =>
    isPetAvailableForAdoption({
      estado: pet.estado,
      emergencia: pet.emergencia,
      alert: alertResolver ? alertResolver(pet) : null,
    }),
  );
}

export function buildAdoptionCatalogEntry(
  pet: PetProfile,
  shelter: Shelter | null = null,
): AdoptionCatalogEntry {
  return {
    petId: pet.id,
    nombre: pet.mascota.nombre,
    especie: pet.mascota.especie,
    raza: pet.mascota.raza,
    genero: pet.mascota.genero,
    talla: pet.mascota.talla,
    fotoUrl: pet.mascota.fotoPerfilUrl,
    codigoPublico: pet.identificacion.codigoPublico,
    fechaNacimiento: pet.mascota.fechaNacimiento,
    zona: shelter?.ubicacion ?? pet.contacto.zonaHabitual,
    verificado: pet.verificado,
    shelterId: shelter?.id ?? null,
    shelterNombre: shelter?.nombre ?? null,
  };
}

export type AdoptionRequestError =
  | "pet_no_disponible"
  | "pet_no_coincide"
  | "pet_requerido"
  | "nombre_requerido"
  | "telefono_requerido"
  | "telefono_invalido"
  | "email_invalido"
  | "motivo_requerido"
  | "fecha_invalida";

export type AdoptionRequestValidation = {
  valid: boolean;
  errors: ReadonlyArray<AdoptionRequestError>;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidApplicantPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return (
    digits.length === 10 ||
    (digits.length === 12 && digits.startsWith("52")) ||
    (digits.length === 13 && digits.startsWith("521"))
  );
}

export function validateAdoptionRequest(input: {
  pet: PetProfile;
  alert?: LostAlert | null;
  draft: AdoptionRequestDraft;
}): AdoptionRequestValidation {
  const { pet, draft } = input;
  const alert = input.alert ?? null;
  const errors: AdoptionRequestError[] = [];

  const availability = resolveAdoptionAvailability({
    estado: pet.estado,
    emergencia: pet.emergencia,
    alert,
  });

  if (!availability.available) {
    errors.push("pet_no_disponible");
  }

  if (typeof draft.petId !== "string" || draft.petId.trim() === "") {
    errors.push("pet_requerido");
  } else if (draft.petId !== pet.id) {
    errors.push("pet_no_coincide");
  }

  const aspirante = draft.aspirante;

  if (typeof aspirante?.nombre !== "string" || aspirante.nombre.trim() === "") {
    errors.push("nombre_requerido");
  }

  if (typeof aspirante?.telefono !== "string" || aspirante.telefono.trim() === "") {
    errors.push("telefono_requerido");
  } else if (!isValidApplicantPhone(aspirante.telefono)) {
    errors.push("telefono_invalido");
  }

  if (
    typeof aspirante?.email === "string" &&
    aspirante.email.trim() !== "" &&
    !EMAIL_PATTERN.test(aspirante.email.trim())
  ) {
    errors.push("email_invalido");
  }

  if (typeof aspirante?.motivo !== "string" || aspirante.motivo.trim() === "") {
    errors.push("motivo_requerido");
  }

  if (typeof draft.fechaEnviada !== "string" || !ISO_DATE_PATTERN.test(draft.fechaEnviada)) {
    errors.push("fecha_invalida");
  }

  return { valid: errors.length === 0, errors };
}