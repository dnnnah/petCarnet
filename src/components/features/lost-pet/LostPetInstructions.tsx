import { Section } from "@/components/ui/Section";
import { HeartHandshake } from "lucide-react";

type LostPetInstructionsProps = {
  petName: string;
  instructions: ReadonlyArray<string>;
};

export function LostPetInstructions({
  petName,
  instructions,
}: LostPetInstructionsProps) {
  if (instructions.length === 0) {
    return null;
  }

  return (
    <Section
      title={`Qué hacer si encontraste a ${petName}`}
      eyebrow="Instrucciones de la familia"
      icon={<HeartHandshake size={18} />}
    >
      <ol className="space-y-3">
        {instructions.map((instruction, index) => (
          <li key={instruction} className="flex gap-3.5 border-b border-rule pb-3 last:border-0 last:pb-0">
            <span
              aria-hidden="true"
              className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-full bg-danger-soft text-xs font-semibold text-danger"
            >
              {index + 1}
            </span>
            <p className="min-w-0 text-sm leading-6 text-ink">{instruction}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
