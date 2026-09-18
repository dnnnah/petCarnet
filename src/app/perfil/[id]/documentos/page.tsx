import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Folder } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SubpageHeader } from "@/components/ui/SubpageHeader";
import { DocumentListClient } from "./DocumentListClient";
import { getPetByIdAny, getAllProfilePets } from "@/lib/getPetByIdAny";
import { getPublicDocuments } from "@/lib/petDocuments";
import { notFound } from "next/navigation";

type DocumentsPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllProfilePets().flatMap((pet) => [{ id: pet.id }, { id: pet.identificacion.codigoPublico }]);
}

export async function generateMetadata({ params }: DocumentsPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    return {
      title: "Documentos no encontrados | PetCarnet",
    };
  }

  return {
    title: `Documentos de ${pet.mascota.nombre} | PetCarnet`,
    description: `Documentos públicos de ${pet.mascota.nombre}.`,
  };
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const { id } = await params;
  const pet = getPetByIdAny(id);

  if (!pet) {
    notFound();
  }

  const documents = getPublicDocuments(pet).filter(
    (document) => document.categoria !== "foto"
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Link
            href={`/perfil/${pet.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-[0_10px_24px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800"
          >
            <ArrowLeft size={18} />
            Volver al perfil
          </Link>

          <SubpageHeader
            eyebrow="Documentos públicos"
            eyebrowTone="text-emerald-600"
            title={`Documentos de ${pet.mascota.nombre}`}
            description="Archivos compartidos por su familia para consulta rápida."
            icon={<Folder size={96} />}
            background="bg-gradient-to-r from-emerald-50 via-white to-amber-50 ring-emerald-100"
          />

          {documents.length > 0 ? (
            <DocumentListClient documents={documents} />
          ) : (
            <GlassCard className="p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-800">
                <Folder size={32} />
              </div>
              <p className="mt-5 text-2xl font-extrabold text-gray-950 dark:text-white">
                No hay documentos públicos
              </p>
              <p className="mx-auto mt-2 max-w-md font-semibold leading-7 text-gray-600 dark:text-gray-300">
                Los documentos privados no se muestran en el perfil público.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
