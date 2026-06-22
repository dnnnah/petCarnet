import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
