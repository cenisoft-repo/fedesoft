import type { Metadata } from "next";
import { Montserrat, Lato, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DemoProvider } from "@/lib/demo";
import { IdentidadProvider } from "@/lib/identidad";
import { SesionApiProvider } from "@/lib/api/sesion";
import { Sofi } from "@/components/asistente/Sofi";
import { TemaProvider } from "@/lib/tema";
import { SCRIPT_TEMA } from "@/lib/tema-script";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "600", "700"], variable: "--font-montserrat", display: "swap" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Fedesoft · Colombia, país origen de software",
  description:
    "La Federación Colombiana de la Industria de Software y TI: más de 500 empresas construyendo el software que mueve a Colombia.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* La vista elegida se aplica antes de pintar: sin destello del tema equivocado. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className={`${montserrat.variable} ${lato.variable} ${jetbrains.variable}`}>
        <TemaProvider>
          <DemoProvider>
            <IdentidadProvider>
              <SesionApiProvider>
                {children}
                {/* La asistente acompaña la landing, el acceso y el portal; no la consola. */}
                <Sofi />
              </SesionApiProvider>
            </IdentidadProvider>
          </DemoProvider>
        </TemaProvider>
      </body>
    </html>
  );
}
