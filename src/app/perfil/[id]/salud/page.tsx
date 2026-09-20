import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SubpageHeader } from "@/components/ui/SubpageHeader";
import { DewormingSection } from "@/components/features/pet-profile/health/DewormingSection";
import { HealthCompletenessCard } from "@/components/features/pet-profile/health/HealthCompletenessCard";
import { MedicalHistorySection } from "@/components/features/pet-profile/health/MedicalHistorySection";
import { VaccineTimeline } from "@/components/features/pet-profile/VaccineTimeline";
import { sortVaccinesByDate } from "@/lib/domain/vaccine";
import { buildHealthExportSummary } from "@/lib/domain/health";
import { isTerminalPetStatus } from "@/lib/domain/petStatus";
import { getPetByIdAny, getAllProfilePets } from "@/lib/getPetByIdAny";
import {
  toCompletenessViewModel,
  toDewormingSectionViewModel,
  toMedicalHistoryViewModel,
  toVaccineItemViewModel,
} from "@/lib/mapping/health";
import { notFound } from "next/navigation";
import { ExportSummaryClient } from "./ExportSummaryClient";

type HealthPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllProfilePets().flatMap((pet) => [{ id: pet.id }, { id: pet.identificacion.codigoPublico }]);
}

export async function generateMetadata({ params }: HealthPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    return {
      title: "Expediente de salud no encontrado | PetCarnet",
    };
  }

  return {
    title: `Salud de ${pet.mascota.nombre} | PetCarnet`,
    description: `Expediente de salud de ${pet.mascota.nombre}: vacunas, desparasitación e historial médico.`,
  };
}

export default async function SaludPage({ params }: HealthPageProps) {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    notFound();
  }

  const isTerminal = isTerminalPetStatus(pet.estado);
  const completeness = toCompletenessViewModel(pet);
  const deworming = toDewormingSectionViewModel(pet.desparasitaciones ?? [], undefined, {
    suppressDue: isTerminal,
  });
  const history = toMedicalHistoryViewModel(pet.historialMedico ?? []);
  const summary = buildHealthExportSummary(pet);
  const timelineVaccines = sortVaccinesByDate(pet.vacunas, "reverso")
    .slice(0, 3)
    .map((vaccine) =>
      toVaccineItemViewModel(vaccine, pet.documentos, undefined, {
        suppressAlerts: isTerminal,
      }),
    );

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Link
            href={`/perfil/${pet.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-[0_10px_24px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800"
          >
            <ArrowLeft size={18} />
            Volver al perfil
          </Link>

          <SubpageHeader
            eyebrow="Expediente de salud"
            eyebrowTone="text-emerald-600"
            title={`Salud de ${pet.mascota.nombre}`}
            description="Vacunas, desparasitación e historial médico en un solo lugar."
            icon={<HeartPulse size={96} />}
            background="bg-gradient-to-r from-emerald-50 via-white to-sky-50 ring-emerald-100"
          />

          <HealthCompletenessCard petName={pet.mascota.nombre} viewModel={completeness} />

          <div className="grid gap-6 lg:grid-cols-2">
            <DewormingSection petName={pet.mascota.nombre} viewModel={deworming} />
            <MedicalHistorySection petName={pet.mascota.nombre} viewModel={history} />
          </div>

          <VaccineTimeline
            petId={pet.id}
            petName={pet.mascota.nombre}
            totalCount={pet.vacunas.length}
            vaccines={timelineVaccines}
          />

          <ExportSummaryClient petName={pet.mascota.nombre} summary={summary} />
        </div>
      </div>
    </AppShell>
  );
}