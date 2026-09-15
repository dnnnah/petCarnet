import type { PetProfile } from "../types/pet";

export const PET_SPECIES: readonly string[] = ["Perro", "Gato"];
export const PET_STATUSES: readonly string[] = ["en_casa", "perdido"];
export const PET_GENDERS: readonly string[] = ["Macho", "Hembra"];
export const PET_SIZES: readonly string[] = ["Pequeño", "Mediano", "Grande", "Miniatura"];
export const VACCINE_STATUSES: readonly string[] = ["al_dia", "proxima_dosis", "vencida"];
export const DOCUMENT_TYPES: readonly string[] = ["pdf", "imagen", "otro"];
export const DOCUMENT_CATEGORIES: readonly string[] = [
  "vacunas",
  "veterinario",
  "identificacion",
  "salud",
  "foto",
  "otro",
];

export const PUBLIC_CODE_PATTERN = /^PC-[A-Z0-9]+-\d{3,}$/;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const VALID_PHONE_PATTERN = /^(\d{10}|52\d{10}|521\d{10})$/;

const SENTINELS = new Set(["Ninguna", "Ninguna registrada", "ninguna", "ninguna registrada"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function add(errors: string[], message: string): void {
  errors.push(message);
}

function expectString(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "string") {
    add(errors, `${field} debe ser string (recibido: ${JSON.stringify(value)}).`);
  }
}

function expectNonEmptyString(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    add(errors, `${field} debe ser un string no vacío.`);
  }
}

function expectBoolean(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "boolean") {
    add(errors, `${field} debe ser boolean.`);
  }
}

function expectNumber(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "number" || Number.isNaN(value)) {
    add(errors, `${field} debe ser number.`);
  }
}

function expectNullableString(value: unknown, field: string, errors: string[]): void {
  if (value !== null && typeof value !== "string") {
    add(errors, `${field} debe ser string o null.`);
  }
}

function expectStringArray(value: unknown, field: string, errors: string[]): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    add(errors, `${field} debe ser un array de strings.`);
  }
}

function expectDate(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    add(errors, `${field} debe tener formato YYYY-MM-DD.`);
  }
}

function expectEnum(value: unknown, allowed: readonly string[], field: string, errors: string[]): void {
  if (typeof value !== "string" || !allowed.includes(value)) {
    add(errors, `${field} debe ser uno de [${allowed.join(", ")}] (recibido: ${JSON.stringify(value)}).`);
  }
}

function expectRecord(value: unknown, field: string, errors: string[]): value is Record<string, unknown> {
  if (!isRecord(value)) {
    add(errors, `${field} debe ser un objeto.`);
    return false;
  }
  return true;
}

function validateVaccines(value: unknown, petId: string, errors: string[]): void {
  if (!Array.isArray(value)) {
    add(errors, `${petId}.vacunas debe ser un array.`);
    return;
  }

  value.forEach((vacuna, index) => {
    const field = `${petId}.vacunas[${index}]`;
    if (!isRecord(vacuna)) {
      add(errors, `${field} debe ser un objeto.`);
      return;
    }

    expectNonEmptyString(vacuna.id, `${field}.id`, errors);
    expectNonEmptyString(vacuna.nombre, `${field}.nombre`, errors);
    expectDate(vacuna.fechaAplicacion, `${field}.fechaAplicacion`, errors);
    expectDate(vacuna.proximaDosis, `${field}.proximaDosis`, errors);
    expectEnum(vacuna.estatus, VACCINE_STATUSES, `${field}.estatus`, errors);
    expectString(vacuna.lote, `${field}.lote`, errors);
    expectString(vacuna.veterinario, `${field}.veterinario`, errors);
    expectString(vacuna.documentoUrl, `${field}.documentoUrl`, errors);
  });
}

function validateDocuments(value: unknown, petId: string, errors: string[]): void {
  if (!Array.isArray(value)) {
    add(errors, `${petId}.documentos debe ser un array.`);
    return;
  }

  value.forEach((doc, index) => {
    const field = `${petId}.documentos[${index}]`;
    if (!isRecord(doc)) {
      add(errors, `${field} debe ser un objeto.`);
      return;
    }

    expectNonEmptyString(doc.id, `${field}.id`, errors);
    expectNonEmptyString(doc.nombre, `${field}.nombre`, errors);
    expectEnum(doc.tipo, DOCUMENT_TYPES, `${field}.tipo`, errors);
    expectEnum(doc.categoria, DOCUMENT_CATEGORIES, `${field}.categoria`, errors);
    expectNonEmptyString(doc.url, `${field}.url`, errors);
    expectDate(doc.fecha, `${field}.fecha`, errors);
    expectBoolean(doc.visiblePublico, `${field}.visiblePublico`, errors);
    if (doc.tamano !== undefined) expectString(doc.tamano, `${field}.tamano`, errors);
    if (doc.estado !== undefined) expectString(doc.estado, `${field}.estado`, errors);
    if (doc.descripcion !== undefined) expectString(doc.descripcion, `${field}.descripcion`, errors);
  });
}

function validatePet(entry: Record<string, unknown>, petId: string, publicCodes: Set<string>, errors: string[]): void {
  expectNonEmptyString(entry.id, `${petId}.id`, errors);
  expectEnum(entry.estado, PET_STATUSES, `${petId}.estado`, errors);
  expectBoolean(entry.verificado, `${petId}.verificado`, errors);

  const mascota = entry.mascota;
  if (expectRecord(mascota, `${petId}.mascota`, errors)) {
    expectNonEmptyString(mascota.nombre, `${petId}.mascota.nombre`, errors);
    expectEnum(mascota.especie, PET_SPECIES, `${petId}.mascota.especie`, errors);
    expectNonEmptyString(mascota.raza, `${petId}.mascota.raza`, errors);
    expectNonEmptyString(mascota.fotoPerfilUrl, `${petId}.mascota.fotoPerfilUrl`, errors);
    expectEnum(mascota.genero, PET_GENDERS, `${petId}.mascota.genero`, errors);
    expectEnum(mascota.talla, PET_SIZES, `${petId}.mascota.talla`, errors);
    expectNonEmptyString(mascota.color, `${petId}.mascota.color`, errors);
    expectNumber(mascota.pesoKg, `${petId}.mascota.pesoKg`, errors);
    expectDate(mascota.fechaNacimiento, `${petId}.mascota.fechaNacimiento`, errors);
    expectStringArray(mascota.rasgosDistintivos, `${petId}.mascota.rasgosDistintivos`, errors);
    expectBoolean(mascota.esterilizado, `${petId}.mascota.esterilizado`, errors);
  }

  const identificacion = entry.identificacion;
  if (expectRecord(identificacion, `${petId}.identificacion`, errors)) {
    expectNonEmptyString(identificacion.codigoPublico, `${petId}.identificacion.codigoPublico`, errors);
    if (typeof identificacion.codigoPublico === "string") {
      const codigo = identificacion.codigoPublico.trim();
      if (!PUBLIC_CODE_PATTERN.test(codigo)) {
        add(errors, `${petId}.identificacion.codigoPublico no coincide con el patrón PC-XXX-NNN (recibido: ${codigo}).`);
      }
      if (publicCodes.has(codigo)) {
        add(errors, `${petId}.identificacion.codigoPublico duplicado: ${codigo}.`);
      }
      publicCodes.add(codigo);
    }
    expectNullableString(identificacion.microchip, `${petId}.identificacion.microchip`, errors);
    expectString(identificacion.notas, `${petId}.identificacion.notas`, errors);
  }

  const contacto = entry.contacto;
  if (expectRecord(contacto, `${petId}.contacto`, errors)) {
    expectNonEmptyString(contacto.nombrePublico, `${petId}.contacto.nombrePublico`, errors);
    expectString(contacto.telefonoPrincipal, `${petId}.contacto.telefonoPrincipal`, errors);
    expectString(contacto.whatsapp, `${petId}.contacto.whatsapp`, errors);
    expectString(contacto.telefonoSecundario, `${petId}.contacto.telefonoSecundario`, errors);
    expectString(contacto.email, `${petId}.contacto.email`, errors);
    expectNonEmptyString(contacto.zonaSegura, `${petId}.contacto.zonaSegura`, errors);
    expectNonEmptyString(contacto.zonaHabitual, `${petId}.contacto.zonaHabitual`, errors);
    expectNonEmptyString(contacto.mensajeWhatsapp, `${petId}.contacto.mensajeWhatsapp`, errors);
  }

  const emergencia = entry.emergencia;
  if (expectRecord(emergencia, `${petId}.emergencia`, errors)) {
    expectBoolean(emergencia.perdido, `${petId}.emergencia.perdido`, errors);
    expectNullableString(emergencia.fechaPerdida, `${petId}.emergencia.fechaPerdida`, errors);
    if (typeof emergencia.fechaPerdida === "string" && !DATE_PATTERN.test(emergencia.fechaPerdida)) {
      add(errors, `${petId}.emergencia.fechaPerdida debe tener formato YYYY-MM-DD.`);
    }
    expectNullableString(emergencia.zonaPerdida, `${petId}.emergencia.zonaPerdida`, errors);
    expectNullableString(emergencia.mensajeEmergencia, `${petId}.emergencia.mensajeEmergencia`, errors);
    if (emergencia.recompensa !== null && typeof emergencia.recompensa !== "number") {
      add(errors, `${petId}.emergencia.recompensa debe ser number o null.`);
    }
    expectStringArray(emergencia.instrucciones, `${petId}.emergencia.instrucciones`, errors);
  }

  const salud = entry.salud;
  if (expectRecord(salud, `${petId}.salud`, errors)) {
    expectStringArray(salud.alergias, `${petId}.salud.alergias`, errors);
    expectStringArray(salud.condicionesMedicas, `${petId}.salud.condicionesMedicas`, errors);
    expectStringArray(salud.medicamentosActuales, `${petId}.salud.medicamentosActuales`, errors);
    expectString(salud.dietaEspecial, `${petId}.salud.dietaEspecial`, errors);
    expectString(salud.comportamiento, `${petId}.salud.comportamiento`, errors);
  }

  const veterinario = entry.veterinario;
  if (expectRecord(veterinario, `${petId}.veterinario`, errors)) {
    expectNonEmptyString(veterinario.nombre, `${petId}.veterinario.nombre`, errors);
    expectNonEmptyString(veterinario.clinica, `${petId}.veterinario.clinica`, errors);
    expectNonEmptyString(veterinario.telefono, `${petId}.veterinario.telefono`, errors);
    expectNonEmptyString(veterinario.direccion, `${petId}.veterinario.direccion`, errors);
    expectString(veterinario.horario, `${petId}.veterinario.horario`, errors);
  }

  validateVaccines(entry.vacunas, petId, errors);
  validateDocuments(entry.documentos, petId, errors);

  const configuracionPublica = entry.configuracionPublica;
  if (expectRecord(configuracionPublica, `${petId}.configuracionPublica`, errors)) {
    expectBoolean(configuracionPublica.mostrarEmail, `${petId}.configuracionPublica.mostrarEmail`, errors);
    expectBoolean(configuracionPublica.mostrarTelefonoSecundario, `${petId}.configuracionPublica.mostrarTelefonoSecundario`, errors);
    expectBoolean(configuracionPublica.mostrarDireccionVet, `${petId}.configuracionPublica.mostrarDireccionVet`, errors);
    expectBoolean(configuracionPublica.mostrarDocumentosPrivados, `${petId}.configuracionPublica.mostrarDocumentosPrivados`, errors);
  }
}

export function collectValidationErrors(data: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    return ["mascotas.json debe ser un array de perfiles."];
  }
  if (data.length === 0) {
    add(errors, "mascotas.json no debe estar vacío.");
  }

  const ids = new Set<string>();
  const publicCodes = new Set<string>();

  data.forEach((entry, index) => {
    const petId = isRecord(entry) && typeof entry.id === "string" && entry.id.trim() !== "" ? entry.id : `perfil[${index}]`;

    if (!isRecord(entry)) {
      add(errors, `${petId} debe ser un objeto.`);
      return;
    }

    if (typeof entry.id === "string") {
      if (ids.has(entry.id)) {
        add(errors, `id duplicado: ${entry.id}.`);
      }
      ids.add(entry.id);
    }

    validatePet(entry, petId, publicCodes, errors);
  });

  return errors;
}

export function isPetProfileArray(data: unknown): data is PetProfile[] {
  return collectValidationErrors(data).length === 0;
}

export function assertValidPetProfiles(data: unknown): asserts data is PetProfile[] {
  const errors = collectValidationErrors(data);
  if (errors.length > 0) {
    throw new Error(`Datos de mascotas inválidos:\n  - ${errors.join("\n  - ")}`);
  }
}

export function collectDataWarnings(data: unknown): string[] {
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    return warnings;
  }

  const phoneOwners = new Map<string, string[]>();

  for (const entry of data) {
    if (!isRecord(entry)) continue;
    const petId = typeof entry.id === "string" ? entry.id : "?";

    const identificacion = entry.identificacion;
    if (isRecord(identificacion) && typeof identificacion.notas === "string" && identificacion.notas.trim() === "") {
      warnings.push(`${petId}: identificación.notas está vacío.`);
    }

    const salud = entry.salud;
    if (isRecord(salud)) {
      for (const field of ["alergias", "condicionesMedicas", "medicamentosActuales"] as const) {
        const list = salud[field];
        if (Array.isArray(list)) {
          const sentinel = list.find((item) => typeof item === "string" && SENTINELS.has(item));
          if (sentinel !== undefined) {
            warnings.push(`${petId}: salud.${field} contiene el sentinel "${String(sentinel)}";  reemplazar por [] o un valor real.`);
          }
        }
      }
    }

    const contacto = entry.contacto;
    if (!isRecord(contacto)) continue;

    const principal = typeof contacto.telefonoPrincipal === "string" ? contacto.telefonoPrincipal : "";
    const whatsapp = typeof contacto.whatsapp === "string" ? contacto.whatsapp : "";
    const principalDigits = principal.replace(/\D/g, "");
    const whatsappDigits = whatsapp.replace(/\D/g, "");

    if (principalDigits !== "" && !VALID_PHONE_PATTERN.test(principalDigits)) {
      warnings.push(`${petId}: telefonoPrincipal "${principal}" no parece un número mexicano válido.`);
    }
    if (whatsappDigits !== "" && !VALID_PHONE_PATTERN.test(whatsappDigits)) {
      warnings.push(`${petId}: whatsapp "${whatsapp}" no parece un número mexicano válido.`);
    }
    if (principalDigits !== "" && whatsappDigits !== "" && principalDigits !== whatsappDigits) {
      warnings.push(`${petId}: telefonoPrincipal (${principalDigits}) y whatsapp (${whatsappDigits}) no coinciden.`);
    }
    if (principalDigits !== "") {
      const owners = phoneOwners.get(principalDigits) ?? [];
      owners.push(petId);
      phoneOwners.set(principalDigits, owners);
    }
  }

  for (const [phone, owners] of phoneOwners) {
    if (owners.length >= 3) {
      warnings.push(`Teléfono ${phone} está compartido por ${owners.length} mascotas (${owners.join(", ")}): posible placeholder; verificar en producción.`);
    }
  }

  return warnings;
}