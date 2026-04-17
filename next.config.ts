import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const isPages = process.env.GITHUB_PAGES === "true";

/**
 * Configuração do Next.js
 *
 * MODO GITHUB PAGES:
 *  - Static export (gera HTML puro em /out)
 *  - basePath e assetPrefix `/lado-b` porque o Pages serve em
 *    https://allanjsr21.github.io/lado-b/
 *  - images.unoptimized pois Pages não tem Image Optimization server
 *
 * Para desenvolvimento local continua usando SSR normal — só ativa o
 * export quando a env var GITHUB_PAGES === "true".
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
    // Expõe o basePath em runtime pro helper asset() prefixar corretamente
    env: {
      NEXT_PUBLIC_BASE_PATH: "/lado-b",
    },
  }),
};

export default nextConfig;
