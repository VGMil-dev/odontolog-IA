import "../src/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OdontoCare IA",
  description: "Dashboard Administrativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}