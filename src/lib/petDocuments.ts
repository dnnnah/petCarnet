import type { PetDocument, PetProfile } from "@/types/pet";

export function getPublicDocuments(pet: PetProfile) {
  return pet.documentos.filter((document) => document.visiblePublico);
}

export function getDocumentMeta(document: PetDocument) {
  return [getDocumentTypeLabel(document.tipo), document.tamano].filter(Boolean).join(" · ");
}

export function getDocumentCategoryLabel(category: PetDocument["categoria"]) {
  const labels: Record<PetDocument["categoria"], string> = {
    vacunas: "Vacunas",
    veterinario: "Veterinario",
    identificacion: "Identificación",
    salud: "Salud",
    foto: "Foto",
    otro: "Otro",
  };

  return labels[category];
}

export function getDocumentTypeLabel(type: PetDocument["tipo"]) {
  const labels: Record<PetDocument["tipo"], string> = {
    pdf: "PDF",
    imagen: "Imagen",
    otro: "Archivo",
  };

  return labels[type];
}
