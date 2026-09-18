import type { Shelter } from "../types/shelter";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectString(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "string") {
    errors.push(`${field} debe ser string (recibido: ${JSON.stringify(value)}).`);
  } else if (value.trim() === "") {
    errors.push(`${field} no debe estar vacío.`);
  }
}

function expectNullableString(value: unknown, field: string, errors: string[]): void {
  if (value !== null && typeof value !== "string") {
    errors.push(`${field} debe ser string o null.`);
  }
}

function expectStringArray(value: unknown, field: string, errors: string[]): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    errors.push(`${field} debe ser un array de strings.`);
  }
}

function expectBoolean(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "boolean") {
    errors.push(`${field} debe ser boolean.`);
  }
}

export function collectShelterValidationErrors(data: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    return ["shelters.mock.json debe ser un array de refugios."];
  }

  const ids = new Set<string>();

  data.forEach((entry, index) => {
    const shelterId =
      isRecord(entry) && typeof entry.id === "string" && entry.id.trim() !== ""
        ? entry.id
        : `refugio[${index}]`;

    if (!isRecord(entry)) {
      errors.push(`${shelterId} debe ser un objeto.`);
      return;
    }

    if (typeof entry.id === "string") {
      if (ids.has(entry.id)) {
        errors.push(`id duplicado: ${entry.id}.`);
      }
      ids.add(entry.id);
    }

    expectString(entry.id, `${shelterId}.id`, errors);
    expectString(entry.nombre, `${shelterId}.nombre`, errors);
    expectString(entry.descripcion, `${shelterId}.descripcion`, errors);
    expectString(entry.ubicacion, `${shelterId}.ubicacion`, errors);
    expectNullableString(entry.logoUrl, `${shelterId}.logoUrl`, errors);
    expectStringArray(entry.redes, `${shelterId}.redes`, errors);
    expectStringArray(entry.mascotas, `${shelterId}.mascotas`, errors);
    expectBoolean(entry.verificado, `${shelterId}.verificado`, errors);

    const contacto = entry.contacto;
    if (!isRecord(contacto)) {
      errors.push(`${shelterId}.contacto debe ser un objeto.`);
      return;
    }

    expectString(contacto.nombreResponsable, `${shelterId}.contacto.nombreResponsable`, errors);
    expectString(contacto.telefono, `${shelterId}.contacto.telefono`, errors);
    expectString(contacto.whatsapp, `${shelterId}.contacto.whatsapp`, errors);
    expectNullableString(contacto.email, `${shelterId}.contacto.email`, errors);
  });

  return errors;
}

export function assertValidShelters(data: unknown): asserts data is Shelter[] {
  const errors = collectShelterValidationErrors(data);
  if (errors.length > 0) {
    throw new Error(`Datos de refugios inválidos:\n  - ${errors.join("\n  - ")}`);
  }
}