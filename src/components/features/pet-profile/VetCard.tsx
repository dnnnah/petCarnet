import { MapPin, Phone, Stethoscope } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { DataList } from "@/components/ui/DataList";

type VetCardProps = {
  vet: {
    clinic: string;
    doctor: string;
    phone: string;
    address: string;
  };
};

export function VetCard({ vet }: VetCardProps) {
  return (
    <Section title="Veterinario" eyebrow="Profesional a cargo" icon={<Stethoscope size={18} />}>
      <p className="font-display text-xl font-semibold text-ink">{vet.doctor}</p>
      <p className="mt-0.5 text-sm text-ink-2">{vet.clinic}</p>

      <DataList
        className="mt-4"
        items={[
          {
            label: "Teléfono",
            icon: <Phone size={13} />,
            value: (
              <a
                href={`tel:${vet.phone.replace(/\D/g, "")}`}
                className="inline-block py-1 font-semibold text-brand underline underline-offset-4 hover:text-brand-hover"
              >
                {vet.phone}
              </a>
            ),
          },
          { label: "Dirección", icon: <MapPin size={13} />, value: vet.address },
        ]}
      />
    </Section>
  );
}
