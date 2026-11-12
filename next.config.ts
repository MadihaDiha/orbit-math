import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=true  → situs statis untuk GitHub Pages (Mode Demo, tanpa server).
 * PAGES_BASE_PATH     → sub-path repositori, mis. "/orbit-math".
 * Tanpa variabel ini → aplikasi Next.js biasa (Vercel / server) dengan Supabase.
 */
const isStatic = process.env.STATIC_EXPORT === "true";
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isStatic
    ? {
        output: "export",
        trailingSlash: true,
        basePath,
        assetPrefix: basePath || undefined,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
