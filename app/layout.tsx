import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mpox Monitor Brasil",
  description: "Painel público de acompanhamento de mpox no Brasil.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
