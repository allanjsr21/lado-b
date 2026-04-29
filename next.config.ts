import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";

/**
 * Configuração do Next.js
 *
 * MODO GITHUB PAGES (GITHUB_PAGES=true):
 *  - Static export (gera HTML puro em /out)
 *  - basePath e assetPrefix `/lado-b` (serve em allanjsr21.github.io/lado-b/)
 *  - images.unoptimized pois Pages não tem Image Optimization server
 *  - @clerk/nextjs marcado como external: evita que o Next.js processe as
 *    Server Actions internas do Clerk v7 (incompatíveis com static export)
 *
 * MODO VERCEL / PRODUÇÃO:
 *  - SSR + API routes normais
 *  - ClerkProvider + auth() funcionam normalmente
 */
const nextConfig: NextConfig = {
  ...(isPages && {
    output: "export",
    basePath: "/lado-b",
    assetPrefix: "/lado-b/",
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    env: {
      NEXT_PUBLIC_BASE_PATH: "/lado-b",
    },
  }),
};

export default nextConfig;
