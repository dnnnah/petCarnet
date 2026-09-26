import { FlaskConical } from "lucide-react";

export function PrototypeNotice() {
  return (
    <aside
      className="flex items-start gap-3 rounded-md border border-dashed border-rule-strong bg-sunken p-4"
      aria-label="Aviso de prototipo"
    >
      <FlaskConical size={18} className="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
      <p className="text-sm leading-6 text-ink-2">
        Página de demostración del prototipo de adopción. Los animales de esta vista son datos
        simulados con fines de diseño; la solicitud de adopción se guarda solo en este navegador y
        no se envía a ningún servidor.
      </p>
    </aside>
  );
}