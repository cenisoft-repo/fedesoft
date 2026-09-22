import type { Metadata } from "next";
import { Nunito, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DemoProvider } from "@/lib/demo";
import { AppShell } from "@/components/AppShell";

const nunito = Nunito({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-nunito", display: "swap" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-source-sans", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Portal del Afiliado · Fedesoft",
  description:
    "Prototipo del Portal Único del Afiliado de Fedesoft: afiliación, pagos con factura electrónica, certificado, formación, directorio y cuenta estratégica.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${nunito.variable} ${sourceSans.variable} ${jetbrains.variable}`}>
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
