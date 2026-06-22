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

const pets = {
  lucca: {
    name: "Lucca",
    species: "Perro",
    breed: "Golden mix",
    age: "3 años",
    gender: "Macho",
    size: "Mediano",
    id: "PC-LUCCA-001",
    image: "/pets/lucca.svg",
    status: {
      vaccines: "Al día",
      sterilized: "Sí",
      microchip: "No cuenta",
    },
    contact: {
      name: "Familia de Lucca",
      phone: "+525512345678",
      whatsapp: "https://wa.me/525512345678?text=Hola,%20encontre%20a%20Lucca",
      locationUrl: "https://maps.google.com",
      neighborhood: "Zona segura: cerca de casa",
    },
    info: {
      species: "Perro",
      breed: "Golden mix",
      color: "Dorado",
      weight: "24 kg",
      birthDate: "10 Mayo 2022",
      distinctive: ["Mancha blanca en el pecho", "Oreja izquierda caída"],
    },
    health: {
      allergies: ["Pollo", "Polen"],
      conditions: ["Propenso a problemas de cadera"],
      behavior: "Amigable, puede asustarse con ruidos fuertes.",
    },
    vet: {
      clinic: "Veterinaria Roma",
      doctor: "Dr. López",
      phone: "55 4433 2211",
      address: "Roma Norte, CDMX",
    },
    vaccines: [
      { name: "Rabia", date: "15 Ene 2025", status: "Al día" },
      { name: "Parvovirus", date: "20 Feb 2025", status: "Al día" },
      { name: "Triple Canina", date: "15 Ene 2026", status: "Próxima dosis" },
    ],
    documents: [
      { name: "Cartilla de Vacunación", meta: "PDF · 2.4 MB", tone: "pink" },
      { name: "Certificado Veterinario", meta: "PDF · 1.1 MB", tone: "mint" },
      { name: "Estudios Médicos", meta: "PDF · 3.2 MB", tone: "purple" },
    ],
  },
} as const;

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return Object.keys(pets).map((id) => ({ id }));
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const pet = pets[id as keyof typeof pets];

  if (!pet) {
    notFound();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-7">
          <PetHeader pet={pet} />
          <EmergencyContact contact={pet.contact} species={pet.species} />
          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCard petName={pet.name} info={pet.info} />
            <HealthCard health={pet.health} />
            <VetCard vet={pet.vet} species={pet.species} />
          </div>
          <VaccineTimeline vaccines={pet.vaccines} />
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <DocumentsCard documents={pet.documents} />
            <QRShareCard petName={pet.name} profilePath={`/perfil/${id}`} />
          </div>
          <ThankYouBanner petName={pet.name} species={pet.species} />
          <p className="text-center text-sm font-bold text-gray-400">
            PetCarnet © 2026 · Pasaporte Digital para Mascotas
          </p>
        </div>
      </div>
    </AppShell>
  );
}
