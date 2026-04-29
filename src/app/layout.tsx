import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LADO ₿ — by Vault Capital",
  description:
    "Na newsletter LADO ₿ você acessa os fatos que moldam o mercado cripto, explicados de maneira transparente e estratégica.",
  icons: {
    icon: "/logo.svg",
  },
};

/**
 * Layout raiz.
 *
 * ClerkProvider é adicionado pelo time de tech ao migrar pra Vercel.
 * Clerk v7 usa Server Actions internamente — incompatível com static export
 * do GitHub Pages. Por isso ClerkProvider NÃO está aqui no layout.
 *
 * Auth nas páginas client: via fetch('/api/...') — as API routes usam auth()
 * server-side (só funciona no Vercel). No GitHub Pages, as chamadas voltam
 * vazio e as páginas mostram o modo demo com fallback.
 *
 * TODO (time de tech — ao migrar pra Vercel):
 *   import { ClerkProvider } from "@clerk/nextjs";
 *   import { ptBR } from "@clerk/localizations";
 *   Envolver <html> com <ClerkProvider localization={ptBR} appearance={{...}}>
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
