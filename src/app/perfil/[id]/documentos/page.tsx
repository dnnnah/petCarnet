import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileImage,
  FileText,
  Folder,
  HeartPulse,
  IdCard,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { getAllPets } from "@/lib/getAllPets";
import { getPetById } from "@/lib/getPetById";
import {
  getDocumentCategoryLabel,
  getDocumentMeta,
  getPublicDocuments,
} from "@/lib/petDocuments";
import type { PetDocument } from "@/types/pet";

type DocumentsPageProps = {
  params: Promise<{ id: string }>;
};

const tones = {
  vacunas: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  veterinario: "bg-blue-50 text-blue-600 ring-blue-100",
  identificacion: "bg-violet-50 text-violet-500 ring-violet-100",
  salud: "bg-pink-50 text-pink-500 ring-pink-100",
  foto: "bg-amber-50 text-amber-500 ring-amber-100",
  otro: "bg-gray-50 text-gray-600 ring-gray-100",
};

const icons = {
  vacunas: ShieldCheck,
  veterinario: Stethoscope,
  identificacion: IdCard,
  salud: HeartPulse,
  foto: FileImage,
  otro: FileText,
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
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((document) => (
                <DocumentItem key={document.id} document={document} />
              ))}
            </div>
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

function DocumentItem({ document }: { document: PetDocument }) {
  const Icon = icons[document.categoria];

  return (
    <GlassCard className="p-5 lg:p-6">
      <div className="flex items-start gap-4">
        <span className={["grid h-14 w-14 shrink-0 place-items-center rounded-2xl ring-1", tones[document.categoria]].join(" ")}>
          <Icon size={28} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-extrabold leading-6 text-gray-950">
              {document.nombre}
            </h2>
            {document.estado ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase text-emerald-700 ring-1 ring-emerald-100">
                {document.estado}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-bold text-gray-500">{getDocumentMeta(document)}</p>
          <p className="mt-1 text-sm font-extrabold uppercase text-gray-400">
            {getDocumentCategoryLabel(document.categoria)}
          </p>
          {document.descripcion ? (
            <p className="mt-3 font-semibold leading-7 text-gray-700">{document.descripcion}</p>
          ) : null}
          <p className="mt-3 text-sm font-semibold text-gray-500">
            Fecha: {formatDate(document.fecha)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
        >
          <ExternalLink size={18} />
          Abrir
        </a>
        <a
          href={document.url}
          download
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-extrabold text-gray-900 shadow-[0_10px_22px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 transition hover:-translate-y-0.5"
        >
          <Download size={18} />
          Descargar
        </a>
      </div>
    </GlassCard>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
