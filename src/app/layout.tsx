import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kronexa Store — Dashboard",
  description: "Sistema de gestão inteligente para lojas de varejo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
