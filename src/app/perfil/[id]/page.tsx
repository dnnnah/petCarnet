import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentsCard } from "@/components/features/pet-profile/DocumentsCard";
import { EmergencyContact } from "@/components/features/pet-profile/EmergencyContact";
import { HealthCard } from "@/components/features/pet-profile/HealthCard";
import { InfoCard } from "@/components/features/pet-profile/InfoCard";
import { LostPetBanner } from "@/components/features/pet-profile/LostPetBanner";
import { LostPetInstructions } from "@/components/features/pet-profile/LostPetInstructions";
import { PetHeader } from "@/components/features/pet-profile/PetHeader";
import { QRShareCard } from "@/components/features/pet-profile/QRShareCard";
import { ThankYouBanner } from "@/components/features/pet-profile/ThankYouBanner";
import { VaccineTimeline } from "@/components/features/pet-profile/VaccineTimeline";
import { VetCard } from "@/components/features/pet-profile/VetCard";
import { getAllPets } from "@/lib/getAllPets";
import { getPetById } from "@/lib/getPetById";
import { formatMexicanDate, formatOptionalMexicanDate, getPetAgeText } from "@/lib/dateFormat";
import { getPublicDocuments } from "@/lib/petDocuments";
import type { PetProfile, VaccineStatus } from "@/types/pet";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllPets().map((pet) => ({ id: pet.id }));
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetById(id);

  if (!pet) {
    return {
      title: "Mascota no encontrada | PetCarnet",
    };
  }

  return {
    title: pet.emergencia.perdido
      ? `${pet.mascota.nombre} está perdido | PetCarnet`
      : `${pet.mascota.nombre} | PetCarnet`,
    description: `Perfil publico de ${pet.mascota.nombre}, ${pet.mascota.raza} · ${pet.mascota.especie}.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const pet = getPetById(id);

  if (!pet) {
    notFound();
  }

  const profile = toProfileProps(pet);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-7">
          {pet.emergencia.perdido ? (
            <LostPetBanner
              petName={pet.mascota.nombre}
              message={pet.emergencia.mensajeEmergencia}
              lostDate={profile.lost.lostDate}
              lostZone={pet.emergencia.zonaPerdida}
              reward={pet.emergencia.recompensa}
            />
          ) : null}
          <PetHeader pet={profile.header} />
          <EmergencyContact
            contact={profile.contact}
            isLost={pet.emergencia.perdido}
            petName={pet.mascota.nombre}
            species={pet.mascota.especie}
          />
          {pet.emergencia.perdido ? (
            <LostPetInstructions
              petName={pet.mascota.nombre}
              instructions={pet.emergencia.instrucciones}
            />
          ) : null}
          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCard petName={pet.mascota.nombre} info={profile.info} />
            <HealthCard health={profile.health} />
            <VetCard vet={profile.vet} species={pet.mascota.especie} />
          </div>
          <VaccineTimeline petId={pet.id} totalCount={profile.vaccineTotalCount} vaccines={profile.vaccines} />
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <DocumentsCard documents={profile.documents} documentsPath={`/perfil/${pet.id}/documentos`} />
            <QRShareCard petName={pet.mascota.nombre} profilePath={pet.qr.urlPublica} />
          </div>
          <ThankYouBanner isLost={pet.emergencia.perdido} petName={pet.mascota.nombre} species={pet.mascota.especie} />
          <p className="text-center text-sm font-bold text-gray-400">
            PetCarnet © 2026 · Pasaporte Digital para Mascotas
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function toProfileProps(pet: PetProfile) {
  const visibleDocuments = getPublicDocuments(pet);
  const locationText = pet.emergencia.perdido && pet.emergencia.zonaPerdida
    ? `Zona donde se perdió: ${pet.emergencia.zonaPerdida}`
    : `Zona segura: ${pet.contacto.zonaSegura}`;
  const locationQuery = pet.emergencia.perdido && pet.emergencia.zonaPerdida
    ? pet.emergencia.zonaPerdida
    : pet.contacto.zonaHabitual;

  return {
    header: {
      name: pet.mascota.nombre,
      species: pet.mascota.especie,
      breed: pet.mascota.raza,
      age: getPetAgeText(pet.mascota.fechaNacimiento),
      gender: pet.mascota.genero,
      size: pet.mascota.talla,
      id: pet.identificacion.codigoPublico,
      image: pet.mascota.fotoPerfilUrl,
      status: {
        vaccines: pet.vacunas.some((vaccine) => vaccine.estatus === "vencida") ? "Revisar" : "Al día",
        sterilized: pet.mascota.esterilizado ? "Sí" : "No",
        microchip: pet.identificacion.microchip ? "Registrado" : "No cuenta",
      },
    },
    contact: {
      name: pet.contacto.nombrePublico,
      phone: formatPhoneForDisplay(pet.contacto.telefonoPrincipal),
      phoneHref: pet.contacto.telefonoPrincipal,
      whatsapp: `https://wa.me/${pet.contacto.whatsapp}?text=${encodeURIComponent(pet.contacto.mensajeWhatsapp)}`,
      locationUrl: `https://maps.google.com/?q=${encodeURIComponent(locationQuery)}`,
      locationLabel: pet.emergencia.perdido ? "Zona donde se perdió" : "Zona habitual",
      neighborhood: locationText,
    },
    lost: {
      lostDate: formatOptionalMexicanDate(pet.emergencia.fechaPerdida),
    },
    info: {
      species: pet.mascota.especie,
      breed: pet.mascota.raza,
      color: pet.mascota.color,
      weight: `${pet.mascota.pesoKg} kg`,
      birthDate: formatMexicanDate(pet.mascota.fechaNacimiento) ?? pet.mascota.fechaNacimiento,
      distinctive: pet.mascota.rasgosDistintivos,
    },
    health: {
      allergies: pet.salud.alergias,
      conditions: pet.salud.condicionesMedicas,
      behavior: pet.salud.comportamiento,
    },
    vet: {
      clinic: pet.veterinario.clinica,
      doctor: pet.veterinario.nombre,
      phone: formatPhoneForDisplay(pet.veterinario.telefono),
      address: pet.configuracionPublica.mostrarDireccionVet ? pet.veterinario.direccion : "Dirección privada",
    },
    vaccineTotalCount: pet.vacunas.length,
    vaccines: pet.vacunas.map((vaccine) => ({
      name: vaccine.nombre,
      date: formatMexicanDate(vaccine.estatus === "proxima_dosis" ? vaccine.proximaDosis : vaccine.fechaAplicacion, "short") ?? "Fecha pendiente",
      status: toVaccineLabel(vaccine.estatus),
    })),
    documents: visibleDocuments.slice(0, 3),
  };
}

function toVaccineLabel(status: VaccineStatus): "Al día" | "Próxima dosis" {
  return status === "proxima_dosis" ? "Próxima dosis" : "Al día";
}

function formatPhoneForDisplay(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 12) {
    return digits.replace(/^(\d{2})(\d{2})(\d{4})(\d{4})$/, "+$1 $2 $3 $4");
  }

  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "$1 $2 $3");
  }

  return phone;
}
