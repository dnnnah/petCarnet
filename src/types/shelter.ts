import type { PetId } from "./pet";

export type ShelterId = string;

export type ShelterContact = {
  nombreResponsable: string;
  telefono: string;
  whatsapp: string;
  email: string | null;
};

export type Shelter = {
  id: ShelterId;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  contacto: ShelterContact;
  redes: ReadonlyArray<string>;
  logoUrl: string | null;
  mascotas: ReadonlyArray<PetId>;
  verificado: boolean;
};