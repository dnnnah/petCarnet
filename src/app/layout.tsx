import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { resolvePublicProfileBaseUrl } from "@/lib/services/publicProfileUrl";

const siteUrl = (() => {
  const baseUrl = resolvePublicProfileBaseUrl();
  if (!baseUrl) {
    return new URL("http://localhost:3000");
  }
  try {
    return new URL(baseUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
})();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "PetCarnet | Carnet Digital",
  description: "Pasaporte digital público para mascotas con QR de emergencia.",
  openGraph: {
    type: "website",
    siteName: "PetCarnet",
    locale: "es_MX",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='petcarnet-theme:v1',v=localStorage.getItem(k)||localStorage.getItem('petcarnet-theme');var dark=v? v==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;var d=document.documentElement;d.classList.toggle('dark',dark);d.style.colorScheme=dark?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
