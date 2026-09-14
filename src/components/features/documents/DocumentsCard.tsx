import Link from "next/link";
import {
  ChevronRight,
  Download,
  Folder,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DocumentPreview } from "./DocumentPreview";
import { getDocumentCategoryLabel, getDocumentMeta } from "@/lib/petDocuments";
import type { PetDocument } from "@/types/pet";

type DocumentsCardProps = {
  documents: ReadonlyArray<PetDocument>;
  documentsPath: string;
};

export function DocumentsCard({ documents, documentsPath }: DocumentsCardProps) {
  return (
    <GlassCard className="h-full p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex min-w-0 items-center gap-3 text-2xl font-extrabold text-gray-950 dark:text-white">
          <Folder className="text-amber-400" size={28} />
          Documentos
        </h2>
        <Link href={documentsPath} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
          Ver todos
          <ChevronRight size={18} />
        </Link>
      </div>

      {documents.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex min-h-[80px] sm:min-h-[124px] min-w-0 items-center justify-between gap-3 rounded-[1.45rem] border border-gray-100 bg-white p-3 sm:p-4 shadow-[0_10px_24px_rgba(17,24,39,0.05)] dark:border-gray-800 dark:bg-gray-900"
            >
              <a href={document.url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3">
                <DocumentPreview document={document} size="sm" />
                <span className="min-w-0">
                  <span className="block overflow-wrap-anywhere break-words font-extrabold leading-5 text-gray-950 dark:text-white">{document.nombre}</span>
                  <span className="mt-1 block overflow-wrap-anywhere break-words text-sm font-semibold text-gray-500 dark:text-gray-400">{getDocumentMeta(document)}</span>
                  <span className="mt-1 block text-xs font-extrabold uppercase text-gray-400 dark:text-gray-400">
                    {getDocumentCategoryLabel(document.categoria)}
                  </span>
                </span>
              </a>
              <a
                href={document.url}
                download
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-gray-900 shadow-[0_8px_18px_rgba(17,24,39,0.08)] ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800"
                aria-label={`Descargar ${document.nombre}`}
              >
                <Download size={18} />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.45rem] border border-dashed border-emerald-200 bg-emerald-50/55 p-6 text-center dark:bg-emerald-500/15 dark:border-emerald-800">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-emerald-500 shadow-[0_10px_24px_rgba(17,24,39,0.05)] dark:bg-gray-900">
            <Folder size={28} />
          </div>
          <p className="mt-4 text-lg font-extrabold text-gray-950 dark:text-white">Sin documentos públicos</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">
            La familia no tiene documentos visibles para este perfil.
          </p>
        </div>
      )}
    </GlassCard>
  );
}
