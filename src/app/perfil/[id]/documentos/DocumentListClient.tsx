"use client";

import { useState } from "react";
import {
  Download,
  ExternalLink,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DocumentFilters, type DocumentFilter } from "@/components/features/pet-profile/DocumentFilters";
import { DocumentPreview } from "@/components/features/pet-profile/DocumentPreview";
import { formatMexicanDate } from "@/lib/dateFormat";
import { getDocumentCategoryLabel, getDocumentMeta } from "@/lib/petDocuments";
import type { PetDocument, PetDocumentCategory } from "@/types/pet";

type DocumentListClientProps = {
  documents: PetDocument[];
};

export function DocumentListClient({ documents }: DocumentListClientProps) {
  const [activeFilter, setActiveFilter] = useState<DocumentFilter>("todos");

  const counts: Record<DocumentFilter, number> = {
    todos: documents.length,
    vacunas: 0,
    veterinario: 0,
    identificacion: 0,
    salud: 0,
    foto: 0,
    otro: 0,
  };

  for (const doc of documents) {
    if (doc.categoria in counts) {
      counts[doc.categoria as PetDocumentCategory] += 1;
    }
  }

  const filtered = activeFilter === "todos"
    ? documents
    : documents.filter((doc) => doc.categoria === activeFilter);

  return (
    <>
      <DocumentFilters counts={counts} active={activeFilter} onChange={setActiveFilter} />

      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((document) => (
            <DocumentItem key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <p className="text-lg font-extrabold text-gray-950">
            No hay documentos en esta categoría
          </p>
          <p className="mt-2 font-semibold text-gray-600">
            Prueba con otro filtro o revisa todos los documentos.
          </p>
        </GlassCard>
      )}
    </>
  );
}

function DocumentItem({ document }: { document: PetDocument }) {
  return (
    <GlassCard className="p-5 lg:p-6">
      <div className="flex items-start gap-4">
        <DocumentPreview document={document} />
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
            Fecha: {formatMexicanDate(document.fecha) ?? "Fecha pendiente"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
        >
          <ExternalLink className="shrink-0" size={18} />
          <span className="min-w-0 overflow-wrap-anywhere break-words">Abrir</span>
        </a>
        <a
          href={document.url}
          download
          className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-extrabold text-gray-900 shadow-[0_10px_22px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 transition hover:-translate-y-0.5"
        >
          <Download className="shrink-0" size={18} />
          <span className="min-w-0 overflow-wrap-anywhere break-words">Descargar</span>
        </a>
      </div>
    </GlassCard>
  );
}
