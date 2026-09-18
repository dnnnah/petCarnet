import { FlaskConical } from "lucide-react";

export function PrototypeNotice() {
  return (
    <aside
      className="flex items-start gap-3 rounded-2xl border border-dashed border-violet-300 bg-violet-50/70 p-4 text-violet-800 dark:border-violet-700/60 dark:bg-violet-500/10 dark:text-violet-200"
      aria-label="Aviso de prototipo"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
        <FlaskConical size={18} />
      </span>
      <p className="text-sm font-bold leading-6">
        Página de demostración del prototipo de adopción. Los animales de esta vista son datos
        simulados con fines de diseño; la solicitud de adopción se guarda solo en este navegador y
        no se envía a ningún servidor.
      </p>
    </aside>
  );
}