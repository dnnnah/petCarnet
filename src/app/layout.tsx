import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";

export const metadata: Metadata = {
  title: "PetCarnet | Carnet Digital",
  description: "Pasaporte digital publico para mascotas con QR de emergencia.",
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
