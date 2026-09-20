/**
 * Core del Carnet Físico / Kit con Causa (FASE 6).
 *
 * Capa: domain. No depende de React, Next.js, Supabase, componentes ni de la
 * capa de presentación. Únicamente construye/normaliza el contrato
 * `PhysicalPetCard` a partir de un `PetProfile`.
 *
 * Reutiliza las reglas existentes y NO las duplica:
 *   - URL pública estable (base del QR): `getPublicProfileUrl`.
 *   - Estado efectivo (perdido / terminal): `resolveEffectivePetState` +
 *     `resolveLostState`.
 *   - Resumen sanitario (FASE 5): `buildHealthExportSummary`.
 *   - Contacto / WhatsApp: `buildWhatsAppHref`.
 *
 * El carnet NO es una segunda fuente de verdad para estado, salud ni URL
 * pública: si el estado efectivo cambia, el carnet refleja el cambio.
 */

import { buildWhatsAppHref } from "@/lib/phone";
import { getPublicProfileUrl } from "@/lib/services/publicProfileUrl";
import type { PhysicalPetCard, PhysicalPetCardFormato, PhysicalPetCardOrientacion, PhysicalPetCardOptions, PhysicalPetCardPrint } from "@/types/carnet";
import type { PetProfile } from "@/types/pet";
import { todayIsoDate } from "./dateRules.ts";
import { buildHealthExportSummary } from "./health.ts";
import { isTerminalPetStatus, resolveEffectivePetState } from "./petStatus.ts";

const PRINT_SPEC: Record<
  PhysicalPetCardFormato,
  { orientacion: PhysicalPetCardOrientacion; qrMinimoMm: number }
> = {
  tarjeta_imprimible: { orientacion: "vertical", qrMinimoMm: 25 },
  credencial: { orientacion: "horizontal", qrMinimoMm: 25 },
  placa_dije: { orientacion: "vertical", qrMinimoMm: 25 },
};

function textOrNull(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function numberOrNull(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

function buildPrintSpec(formato: PhysicalPetCardFormato): PhysicalPetCardPrint {
  const spec = PRINT_SPEC[formato];
  return { formato, orientacion: spec.orientacion, qrMinimoMm: spec.qrMinimoMm };
}

/**
 * Construye el modelo del carnet físico a partir de un perfil existente.
 *
 * Tolerante a información opcional ausente (teléfono, WhatsApp, veterinario,
 * vacunas, historial, documentos, foto): los datos faltantes se normalizan a
 * `null` o arrays vacíos y nunca rompen la construcción.
 */
export function buildPhysicalPetCard(
  pet: PetProfile,
  options: PhysicalPetCardOptions = {},
): PhysicalPetCard {
  const formato = options.formato ?? "tarjeta_imprimible";

  const effective = resolveEffectivePetState({
    estado: pet.estado,
    emergencia: pet.emergencia,
    alert: options.alert ?? null,
  });
  const esTerminal = isTerminalPetStatus(effective.status);
  const perdiendo = effective.isLost;

  const summary = buildHealthExportSummary(pet, options.today);

  const qrUrl = getPublicProfileUrl(pet);

  const whatsappHref = buildWhatsAppHref(pet.contacto.whatsapp, pet.contacto.mensajeWhatsapp);

  return {
    mascota: {
      nombre: textOrNull(pet.mascota.nombre),
      especie: pet.mascota.especie,
      raza: textOrNull(pet.mascota.raza),
      fotoUrl: textOrNull(pet.mascota.fotoPerfilUrl),
      genero: textOrNull(pet.mascota.genero),
      talla: textOrNull(pet.mascota.talla),
      color: textOrNull(pet.mascota.color),
      pesoKg: numberOrNull(pet.mascota.pesoKg),
      fechaNacimiento: textOrNull(pet.mascota.fechaNacimiento),
      rasgosDistintivos: pet.mascota.rasgosDistintivos,
      esterilizado: pet.mascota.esterilizado,
      verificado: pet.verificado,
    },
    identificacion: {
      codigoPublico: pet.identificacion.codigoPublico,
      microchip: textOrNull(pet.identificacion.microchip),
    },
    qr: {
      url: qrUrl,
      disponible: qrUrl !== null,
    },
    estado: {
      status: effective.status,
      esTerminal,
      perdido: perdiendo,
    },
    contacto: {
      nombrePublico: textOrNull(pet.contacto.nombrePublico),
      telefono: textOrNull(pet.contacto.telefonoPrincipal),
      telefonoSecundario: pet.configuracionPublica.mostrarTelefonoSecundario
        ? textOrNull(pet.contacto.telefonoSecundario)
        : null,
      email: pet.configuracionPublica.mostrarEmail ? textOrNull(pet.contacto.email) : null,
      whatsapp: textOrNull(pet.contacto.whatsapp),
      whatsappUrl: whatsappHref === "" ? null : whatsappHref,
      zonaSegura: textOrNull(pet.contacto.zonaSegura),
      zonaHabitual: textOrNull(pet.contacto.zonaHabitual),
    },
    emergencia: {
      activo: perdiendo,
      zonaPerdida: perdiendo ? effective.zonaPerdida : null,
      fechaPerdida: perdiendo ? effective.fechaPerdida : null,
      mensaje: perdiendo ? effective.mensaje : null,
      recompensa: perdiendo ? effective.recompensa : null,
      instrucciones: perdiendo ? pet.emergencia.instrucciones : [],
    },
    salud: {
      alergias: summary.alergias,
      condicionesMedicas: summary.condicionesMedicas,
      medicamentosActuales: summary.medicamentosActuales,
      vacunas: summary.vacunas.map((vaccine) => ({
        nombre: vaccine.nombre,
        estatus: vaccine.estatus,
      })),
      veterinario: summary.veterinario,
    },
    print: buildPrintSpec(formato),
    generadoEn: todayIsoDate(options.today),
  };
}