import type { Metadata } from "next";
import { Montserrat, Lato, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DemoProvider } from "@/lib/demo";

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
      <body className={`${montserrat.variable} ${lato.variable} ${jetbrains.variable}`}>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
