export const PET_IDS = [
  { id: "lucca", name: "Lucca", species: "Perro" },
  { id: "niko", name: "Niko", species: "Perro" },
  { id: "alix", name: "Alix", species: "Perro" },
  { id: "chicarrona", name: "Chicarrona", species: "Gato" },
  { id: "loki", name: "Loki", species: "Gato" },
] as const;

export const TEMP_IMAGE_GUIDE = {
  folder: "/public/pets",
  recommendedNames: ["lucca.jpg", "niko.jpg", "alix.jpg", "chicarrona.jpg", "loki.jpg"],
  dimensions: "1200x1200 px, JPG o PNG, recorte cuadrado centrado en la cara.",
};
