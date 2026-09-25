import { Info } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { DataList } from "@/components/ui/DataList";

type InfoCardProps = {
  petName: string;
  info: {
    species: string;
    breed: string;
    color: string;
    weight: string;
    birthDate: string;
    distinctive: ReadonlyArray<string>;
  };
};

export function InfoCard({ petName, info }: InfoCardProps) {
  return (
    <Section
      title="Ficha de identificación"
      eyebrow={`Datos de ${petName}`}
      icon={<Info size={18} />}
    >
      <DataList
        items={[
          { label: "Especie", value: info.species },
          { label: "Raza", value: info.breed },
          { label: "Color", value: info.color },
          { label: "Peso", value: info.weight },
          { label: "Nacimiento", value: info.birthDate },
          {
            label: "Rasgos distintivos",
            value:
              info.distinctive.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5">
                  {info.distinctive.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                "Sin registrar"
              ),
          },
        ]}
      />
    </Section>
  );
}
