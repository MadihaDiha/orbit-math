import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Starfield } from "@/components/cosmic/Starfield";
import { GalaxyDecoration } from "@/components/cosmic/GalaxyDecoration";

// Font yang sama dengan Google Fonts (Orbitron & Nunito, variable font subset latin), disimpan di proyek
// agar build tidak bergantung pada unduhan Google Fonts (lihat src/app/fonts/README.md).
const display = localFont({ src: "./fonts/orbitron-latin-variable.woff2", variable: "--font-display", weight: "400 900", display: "swap" });
const body = localFont({ src: "./fonts/nunito-latin-variable.woff2", variable: "--font-body", weight: "200 1000", display: "swap" });

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
        <GalaxyDecoration />
        {children}
      </body>
    </html>
  );
}
