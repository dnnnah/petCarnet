import { Cat, Dog } from "lucide-react";
import type { LucideProps } from "lucide-react";

type PetSpeciesIconProps = LucideProps & {
  species: string;
};

export function PetSpeciesIcon({ species, ...iconProps }: PetSpeciesIconProps) {
  return species.toLowerCase().includes("gato") ? <Cat {...iconProps} /> : <Dog {...iconProps} />;
}
