import { PawPrint, Sparkles, Star } from "lucide-react";
import { cx } from "@/lib/ui/tone";

type PetMarksProps = {
  className?: string;
};

/**
 * Marcas de la mascota: huellitas y destellos en el espacio negativo.
 *
 * No son ilustracion ni adorno scattering: son cuatro vectores del mismo trazo
 * que el resto de iconos, con una jerarquia clara (una huella que manda y tres
 * acentos que la acompañan) y una sola funcion, ocupando la esquina que el
 * texto no usa. `aria-hidden` y `pointer-events-none` porque no aportan
 * informacion, y `print:hidden` porque la impresion es parte del producto: un
 * perfil impreso no lleva decoracion.
 *
 * El llamador decide donde y cuanto pesan; aqui solo la composicion.
 */
export function PetMarks({ className }: PetMarksProps) {
  return (
    <div
      aria-hidden="true"
      /* La caja lleva tamano explicito a proposito: `globals.css` aplica
         `max-width: 100%` a todo `svg`, y un contenedor `absolute` sin ancho
         colapsa los iconos a cero. Dimensions fijas y ningun reposicionamiento
         por viewport. */
      className={cx(
        "pointer-events-none absolute h-40 w-36 select-none text-brand print:hidden",
        className
      )}
    >
      <PawPrint
        strokeWidth={1.5}
        className="absolute left-0 top-0 size-14 -rotate-12 opacity-[0.13]"
      />
      <Sparkles
        strokeWidth={1.5}
        className="absolute left-[4.75rem] top-1 size-7 rotate-[8deg] opacity-[0.10]"
      />
      <Star
        strokeWidth={1.5}
        className="absolute left-3 top-[5.25rem] size-5 -rotate-[8deg] opacity-[0.10]"
      />
      <PawPrint
        strokeWidth={1.5}
        className="absolute left-[5.5rem] top-[6.5rem] size-8 rotate-[20deg] opacity-[0.07]"
      />
    </div>
  );
}
