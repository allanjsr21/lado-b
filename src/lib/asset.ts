/**
 * asset — prefixa o basePath (necessário em static export com subpath,
 * ex: GitHub Pages servindo em /lado-b/).
 *
 * O `<Image>` do Next.js NÃO aplica basePath automaticamente em
 * `output: 'export'`, por isso precisamos prefixar manualmente.
 *
 * Uso:
 *   <Image src={asset("/logo-dark.svg")} ... />
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (!path.startsWith("/")) return `${BASE_PATH}/${path}`;
  return `${BASE_PATH}${path}`;
}
