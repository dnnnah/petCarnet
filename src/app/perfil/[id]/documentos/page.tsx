import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Folder } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { DocumentListClient } from "./DocumentListClient";
import { getAllPets } from "@/lib/getAllPets";
import { getPetById } from "@/lib/getPetById";
import { getPublicDocuments } from "@/lib/petDocuments";

type DocumentsPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllPets().map((pet) => ({ id: pet.id }));
}

export async function generateMetadata({ params }: DocumentsPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetById(id);

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
  const pet = getPetById(id);

  if (!pet) {
    notFound();
  }

  const documents = getPublicDocuments(pet);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Link
            href={`/perfil/${pet.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-[0_10px_24px_rgba(17,24,39,0.06)] ring-1 ring-gray-100"
          >
            <ArrowLeft size={18} />
            Volver al perfil
          </Link>

          <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-6 shadow-[0_16px_38px_rgba(16,185,129,0.09)] ring-1 ring-emerald-100 sm:p-8">
            <div className="absolute -right-4 -top-6 text-amber-100">
              <Folder size={96} />
            </div>
            <div className="relative">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-600">
                Documentos públicos
              </p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
                Documentos de {pet.mascota.nombre}
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-gray-600">
                Archivos compartidos por su familia para consulta rápida.
              </p>
            </div>
          </section>

          {documents.length > 0 ? (
            <DocumentListClient documents={documents} />
          ) : (
            <GlassCard className="p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100">
                <Folder size={32} />
              </div>
              <p className="mt-5 text-2xl font-extrabold text-gray-950">
                No hay documentos públicos
              </p>
              <p className="mx-auto mt-2 max-w-md font-semibold leading-7 text-gray-600">
                Los documentos privados no se muestran en el perfil público.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
