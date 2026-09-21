/**
 * Contratos de dominio del Carnet Físico / Kit con Causa (FASE 6).
 *
 * Capa: types / contratos.
 * No dependen de React, Next.js, Supabase ni componentes, ni de ninguna
 * representación visual concreta (preview web, impresión, PNG, SVG o PDF).
 *
 * Backward-compatible: son entidades NUEVAS. No se altera ningún contrato
 * existente (PetProfile, PetStatus, emergencia, salud, publicProfileUrl).
 *
 * El carnet NO es una segunda fuente de verdad: el estado efectivo proviene
 * del dominio de estados, la salud de `buildHealthExportSummary` y la URL
 * pública (base del QR) de `getPublicProfileUrl`.
 */

import type { LostAlert } from "./emergency";
import type { PetSpecies, PetStatus } from "./pet";

export type PhysicalPetCardFormato = "tarjeta_imprimible" | "credencial" | "placa_dije";

export type PhysicalPetCardOrientacion = "vertical" | "horizontal";

/**
 * QR del carnet. NO se codifica `pet.id` ni se construye la URL a mano;
 * la URL es la pública estable derivada del código público
 * (`getPublicProfileUrl`). La generación del código QR propiamente dicho
 * (SVG/PNG) pertenece a la interfaz/exportación posterior: aquí solo se
 * entrega el valor a codificar y si está disponible.
 */
export type PhysicalPetCardQr = {
  /** URL pública estable a codificar (ruta `/perfil/<codigoPublico>` o absoluta si hay base). */
  url: string | null;
  /** true solo si existe una URL pública válida derivada del código público. */
  disponible: boolean;
};

/**
 * Estado representado por el carnet. Derivado del estado efectivo existente
 * (`resolveEffectivePetState`), nunca calculado en el carnet.
 */
export type PhysicalPetCardEstado = {
  /** Estado efectivo (p. ej. `perdido` si hay alerta, respetando el estado terminal). */
  status: PetStatus;
  esTerminal: boolean;
  /** Modo perdido activo derivado (false si el perfil es terminal). */
  perdido: boolean;
};

/**
 * Elementos relevantes de emergencia / instrucciones para encontrar a la
 * mascota. `activo` deriva del estado efectivo; un perfil terminal NUNCA se
 * representa como perdido.
 */
export type PhysicalPetCardEmergencia = {
  activo: boolean;
  zonaPerdida: string | null;
  fechaPerdida: string | null;
  mensaje: string | null;
  recompensa: number | null;
  instrucciones: ReadonlyArray<string>;
};

export type PhysicalPetCardVacuna = {
  nombre: string;
  estatus: string | null;
};

/**
 * Metadata de formato para impresión / exportación. Son especificaciones de
 * formato (datos), NO estilos: no contienen JSX ni CSS. Las dimensiones
 * concretas de la representación pertenecen a la capa de presentación.
 */
export type PhysicalPetCardPrint = {
  formato: PhysicalPetCardFormato;
  orientacion: PhysicalPetCardOrientacion;
  /** Tamaño físico mínimo del módulo QR en milímetros (producto: 2.5 × 2.5 cm). */
  qrMinimoMm: number;
};

/**
 * Carnet Físico / Kit con Causa (FASE 6).
 *
 * Modelo estable y explícito de la identidad física de la mascota, listo
 * para generar después representaciones distintas (preview web, impresión,
 * PNG, SVG, PDF) sin acoplarse a ninguna.
 */
export type PhysicalPetCard = {
  mascota: {
    nombre: string | null;
    especie: PetSpecies;
    raza: string | null;
    fotoUrl: string | null;
    genero: string | null;
    talla: string | null;
    color: string | null;
    pesoKg: number | null;
    fechaNacimiento: string | null;
    rasgosDistintivos: ReadonlyArray<string>;
    esterilizado: boolean;
    verificado: boolean;
  };
  identificacion: {
    codigoPublico: string;
    microchip: string | null;
  };
  qr: PhysicalPetCardQr;
  estado: PhysicalPetCardEstado;
  contacto: {
    nombrePublico: string | null;
    telefono: string | null;
    telefonoSecundario: string | null;
    email: string | null;
    whatsapp: string | null;
    whatsappUrl: string | null;
    zonaSegura: string | null;
    zonaHabitual: string | null;
  };
  emergencia: PhysicalPetCardEmergencia;
  salud: {
    alergias: ReadonlyArray<string>;
    condicionesMedicas: ReadonlyArray<string>;
    medicamentosActuales: ReadonlyArray<string>;
    vacunas: ReadonlyArray<PhysicalPetCardVacuna>;
    /**
     * Vista de desparasitación (FASE 5.2) derivada del resumen sanitario
     * exportable. Sigue siendo el resumen del Core el que ordena/normaliza;
     * aquí solo se proyectan los datos hacia el carnet.
     */
    desparasitaciones: ReadonlyArray<{
      producto: string;
      fecha: string;
      proximaFecha: string | null;
      dosis: string | null;
      veterinario: string | null;
    }>;
    /**
     * Resumen informativo del historial médico (FASE 5.3) derivado del
     * resumen sanitario exportable. No es el expediente completo: sirve al
     * carnet para exponer la información médica relevante sin duplicar reglas.
     */
    historialMedico: ReadonlyArray<{
      fecha: string;
      motivo: string;
      diagnostico: string | null;
      tratamiento: string | null;
      medicamentos: ReadonlyArray<string>;
    }>;
    veterinario: {
      nombre: string;
      clinica: string;
      telefono: string;
    } | null;
  };
  print: PhysicalPetCardPrint;
  /** Fecha de generación del modelo (ISO YYYY-MM-DD). */
  generadoEn: string;
};

export type PhysicalPetCardOptions = {
  /** Alerta de runtime (mascota perdida desde la app). Si no se provee, se usa el estado estático. */
  alert?: LostAlert | null;
  /** Formato objetivo del carnet. Por defecto: tarjeta imprimible. */
  formato?: PhysicalPetCardFormato;
  /** Fecha "de hoy" inyectable para mantener determinismo en pruebas (ISO YYYY-MM-DD). */
  today?: string;
};