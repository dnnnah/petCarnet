import { getDocumentCategoryMeta } from "@/lib/domain/documentCategory";
import type { PetDocument, PetDocumentType } from "@/types/pet";

type DocumentPreviewProps = {
  document: PetDocument;
  size?: "sm" | "md";
};

const typeBadge: Record<PetDocumentType, { label: string; tones: string }> = {
  pdf: { label: "PDF", tones: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300" },
  imagen: { label: "IMG", tones: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300" },
  otro: { label: "Archivo", tones: "bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:text-gray-300" },
};

export function DocumentPreview({ document, size = "md" }: DocumentPreviewProps) {
  const category = getDocumentCategoryMeta(document.categoria);
  const Icon = category.icon;
  const badge = typeBadge[document.tipo];
  const isImage = document.tipo === "imagen";
  const iconSize = size === "sm" ? 20 : 28;
  const boxSize = size === "sm" ? "h-10 w-10" : "h-14 w-14";

  return (
    <div className="flex items-center gap-3">
      {isImage ? (
        <div className="relative shrink-0 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={document.url}
            alt={document.nombre}
            className={[
              "object-cover",
              size === "sm" ? "h-10 w-10" : "h-14 w-14",
            ].join(" ")}
          />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-gray-600 shadow ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-800">
            {badge.label}
          </span>
        </div>
      ) : (
        <span className={["relative grid shrink-0 place-items-center rounded-2xl ring-1", boxSize, category.chipTones].join(" ")}>
          <Icon size={iconSize} />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-gray-600 shadow ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-800">
            {badge.label}
          </span>
        </span>
      )}
    </div>
  );
}
