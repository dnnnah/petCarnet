import { CheckCircle2, HeartHandshake } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

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
    <GlassCard className="relative overflow-hidden border-rose-100 bg-rose-50/70 p-6 lg:p-7">
      <div className="absolute -right-2 -top-4 text-rose-100">
        <HeartHandshake size={74} />
      </div>
      <h2 className="relative flex items-center gap-3 text-2xl font-extrabold text-gray-950">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-rose-500 ring-1 ring-rose-100">
          <HeartHandshake size={21} />
        </span>
        Qué hacer si encontraste a {petName}
      </h2>

      <div className="relative mt-5 grid gap-3 md:grid-cols-2">
        {instructions.map((instruction) => (
          <div
            key={instruction}
            className="flex items-start gap-3 rounded-[1.35rem] border border-rose-100 bg-white/88 p-4 shadow-[0_10px_24px_rgba(17,24,39,0.05)]"
          >
            <CheckCircle2 className="mt-0.5 shrink-0 text-rose-500" size={21} />
            <p className="font-semibold leading-6 text-gray-800">{instruction}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
