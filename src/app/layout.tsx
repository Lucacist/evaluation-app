// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // ou tes polices actuelles
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Suivi de Compétences",
  description: "Application d'évaluation technique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // AJOUTE : suppressHydrationWarning
    // Cela empêche les warnings liés aux extensions ou au dark mode
    <html lang="fr" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        {children}
      </body>
    </html>
  );
}