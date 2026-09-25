"use client";

import { useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { DocumentFilters, type DocumentFilter } from "@/components/features/documents/DocumentFilters";
import { DocumentPreview } from "@/components/features/documents/DocumentPreview";
import { Pill } from "@/components/ui/Pill";
import { Surface } from "@/components/ui/Surface";
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

  const filtered =
    activeFilter === "todos"
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
        <Surface className="p-8 text-center">
          <p className="font-display text-lg text-ink">No hay documentos en esta categoría</p>
          <p className="mt-1.5 text-sm text-ink-2">
            Prueba con otro filtro o revisa todos los documentos.
          </p>
        </Surface>
      )}
    </>
  );
}

function DocumentItem({ document }: { document: PetDocument }) {
  return (
    <Surface className="flex flex-col p-5">
      <div className="flex items-start gap-4">
        <DocumentPreview document={document} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg leading-snug text-ink">{document.nombre}</h2>
            {document.estado ? (
              <Pill tone="success" size="sm">
                {document.estado}
              </Pill>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm text-ink-2">{getDocumentMeta(document)}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            {getDocumentCategoryLabel(document.categoria)}
          </p>
          {document.descripcion ? (
            <p className="mt-2.5 text-sm leading-6 text-ink-2">{document.descripcion}</p>
          ) : null}
          <p className="mt-2.5 text-xs text-ink-3">
            Fecha: {formatMexicanDate(document.fecha) ?? "Fecha pendiente"}
          </p>
        </div>
      </div>

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
        <a
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-on-solid transition-colors hover:bg-brand-hover"
        >
          <ExternalLink className="shrink-0" size={17} aria-hidden="true" />
          <span className="min-w-0 break-words">Abrir</span>
        </a>
        <a
          href={document.url}
          download
          className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-md border border-rule bg-surface px-4 text-sm font-semibold text-ink-2 transition-colors hover:border-brand-rule hover:text-brand"
        >
          <Download className="shrink-0" size={17} aria-hidden="true" />
          <span className="min-w-0 break-words">Descargar</span>
        </a>
      </div>
    </Surface>
  );
}
