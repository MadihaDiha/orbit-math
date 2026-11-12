import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Nunito, Orbitron } from "next/font/google";
import "./globals.css";
import { Starfield } from "@/components/cosmic/Starfield";

const display = Orbitron({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700", "800", "900"] });
const body = Nunito({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: { default: "ORBIT MATH — Explore the Galaxy, Master Mathematics!", template: "%s · ORBIT MATH" },
  description: "Platform belajar interaktif Keliling Lingkaran untuk siswa SMP kelas VIII bersama BIMO sang astronaut.",
  applicationName: "ORBIT MATH",
};

export const viewport: Viewport = {
  themeColor: "#07152F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <Starfield />
        {children}
      </body>
    </html>
  );
}
