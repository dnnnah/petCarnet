import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SubpageHeader } from "@/components/ui/SubpageHeader";

export const metadata: Metadata = {
  title: "Iniciar sesión | PetCarnet",
  description: "Acceso al panel de PetCarnet.",
};

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        <SubpageHeader
          eyebrow="Cuenta de familia"
          eyebrowTone="text-emerald-600"
          title="Iniciar sesión"
          description="El panel con tus mascotas estará disponible próximamente. Por ahora puedes explorar los perfiles públicos."
          icon={<LogIn size={96} />}
          background="bg-gradient-to-r from-emerald-50 via-white to-amber-50 ring-emerald-100"
        />
      </div>
    </AppShell>
  );
}
