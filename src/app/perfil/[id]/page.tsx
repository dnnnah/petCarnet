import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentsCard } from "@/components/features/pet-profile/DocumentsCard";
import { EmergencyContact } from "@/components/features/pet-profile/EmergencyContact";
import { HealthCard } from "@/components/features/pet-profile/HealthCard";
import { InfoCard } from "@/components/features/pet-profile/InfoCard";
import { PetHeader } from "@/components/features/pet-profile/PetHeader";
import { QRShareCard } from "@/components/features/pet-profile/QRShareCard";
import { ThankYouBanner } from "@/components/features/pet-profile/ThankYouBanner";
import { VaccineTimeline } from "@/components/features/pet-profile/VaccineTimeline";
import { VetCard } from "@/components/features/pet-profile/VetCard";
import { getAllPets } from "@/lib/getAllPets";
import { getPetById } from "@/lib/getPetById";
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
    title: `${pet.mascota.nombre} | PetCarnet`,
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
          <PetHeader pet={profile.header} />
          <EmergencyContact contact={profile.contact} petName={pet.mascota.nombre} species={pet.mascota.especie} />
          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCard petName={pet.mascota.nombre} info={profile.info} />
            <HealthCard health={profile.health} />
            <VetCard vet={profile.vet} species={pet.mascota.especie} />
          </div>
          <VaccineTimeline vaccines={profile.vaccines} />
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <DocumentsCard documents={profile.documents} />
            <QRShareCard petName={pet.mascota.nombre} profilePath={pet.qr.urlPublica} />
          </div>
          <ThankYouBanner petName={pet.mascota.nombre} species={pet.mascota.especie} />
          <p className="text-center text-sm font-bold text-gray-400">
            PetCarnet © 2026 · Pasaporte Digital para Mascotas
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function toProfileProps(pet: PetProfile) {
  const visibleDocuments = pet.configuracionPublica.mostrarDocumentosPrivados
    ? pet.documentos
    : pet.documentos.filter((document) => document.visiblePublico);

  return {
    header: {
      name: pet.mascota.nombre,
      species: pet.mascota.especie,
      breed: pet.mascota.raza,
      age: pet.mascota.edadTexto,
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
      locationUrl: `https://maps.google.com/?q=${encodeURIComponent(pet.contacto.zonaHabitual)}`,
      neighborhood: `Zona segura: ${pet.contacto.zonaSegura}`,
    },
    info: {
      species: pet.mascota.especie,
      breed: pet.mascota.raza,
      color: pet.mascota.color,
      weight: `${pet.mascota.pesoKg} kg`,
      birthDate: formatDate(pet.mascota.fechaNacimiento),
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
    vaccines: pet.vacunas.slice(0, 3).map((vaccine) => ({
      name: vaccine.nombre,
      date: formatDate(vaccine.estatus === "proxima_dosis" ? vaccine.proximaDosis : vaccine.fechaAplicacion),
      status: toVaccineLabel(vaccine.estatus),
    })),
    documents: visibleDocuments.slice(0, 3).map((document, index) => ({
      name: document.nombre,
      meta: `${document.tipo} · ${document.tamano}`,
      url: document.url,
      tone: (["pink", "mint", "purple"] as const)[index % 3],
    })),
  };
}

function toVaccineLabel(status: VaccineStatus): "Al día" | "Próxima dosis" {
  return status === "proxima_dosis" ? "Próxima dosis" : "Al día";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

function formatPhoneForDisplay(phone: string) {
  return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, "$1 $2 $3");
}
