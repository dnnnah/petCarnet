export type PetId = string;

export type PetSpecies = "Perro" | "Gato";

export type PetStatus = "en_casa" | "perdido";

export type PetGender = "Macho" | "Hembra";

export type PetSize = "Pequeño" | "Mediano" | "Grande" | "Miniatura";

export type VaccineStatus = "al_dia" | "proxima_dosis" | "vencida";

export type PetDocumentType = "pdf" | "imagen" | "otro";

export type PetDocumentCategory =
  | "vacunas"
  | "veterinario"
  | "identificacion"
  | "salud"
  | "foto"
  | "otro";

export interface PetProfile {
  id: PetId;
  estado: PetStatus;
  verificado: boolean;
  mascota: {
    nombre: string;
    especie: PetSpecies;
    raza: string;
    fotoPerfilUrl: string;
    genero: PetGender;
    talla: PetSize;
    color: string;
    pesoKg: number;
    fechaNacimiento: string;
    rasgosDistintivos: string[];
    esterilizado: boolean;
  };
  identificacion: {
    codigoPublico: string;
    microchip: string | null;
    notas: string;
  };
  contacto: {
    nombrePublico: string;
    telefonoPrincipal: string;
    whatsapp: string;
    telefonoSecundario: string;
    email: string;
    zonaSegura: string;
    zonaHabitual: string;
    mensajeWhatsapp: string;
  };
  emergencia: {
    perdido: boolean;
    fechaPerdida: string | null;
    zonaPerdida: string | null;
    mensajeEmergencia: string | null;
    recompensa: number | null;
    instrucciones: string[];
  };
  salud: {
    alergias: string[];
    condicionesMedicas: string[];
    medicamentosActuales: string[];
    dietaEspecial: string;
    comportamiento: string;
  };
  veterinario: {
    nombre: string;
    clinica: string;
    telefono: string;
    direccion: string;
    horario: string;
  };
  vacunas: PetVaccine[];
  documentos: PetDocument[];
  qr: {
    urlPublica: string;
    texto: string;
  };
  configuracionPublica: {
    mostrarEmail: boolean;
    mostrarTelefonoSecundario: boolean;
    mostrarDireccionVet: boolean;
    mostrarDocumentosPrivados: boolean;
  };
}

export interface PetVaccine {
  id: string;
  nombre: string;
  fechaAplicacion: string;
  proximaDosis: string;
  estatus: VaccineStatus;
  lote: string;
  veterinario: string;
  documentoUrl: string;
}

export interface PetDocument {
  id: string;
  nombre: string;
  tipo: PetDocumentType;
  categoria: PetDocumentCategory;
  url: string;
  fecha: string;
  tamano?: string;
  visiblePublico: boolean;
  estado?: string;
  descripcion?: string;
}
