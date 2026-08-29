import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";

export const metadata: Metadata = {
  title: "PetCarnet | Pasaporte Digital",
  description: "Pasaporte digital publico para mascotas con QR de emergencia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
