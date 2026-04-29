import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
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
 * Layout raiz com ClerkProvider.
 *
 * ClerkProvider é client-side e compatível com static export (GitHub Pages).
 * O que NÃO é compatível com static export:
 *  - auth() server-side (usado só em Vercel/produção)
 *  - API routes (removidas pelo workflow antes do build estático)
 *  - Middleware (já removido anteriormente)
 *
 * TODO (time de tech):
 *  - Adicionar appearance theme quando tiver design system finalizado
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={ptBR}
      appearance={{
        variables: {
          colorPrimary: "#ffc60a",
          colorBackground: "#000000",
          colorText: "#ffffff",
          colorInputBackground: "rgba(255,255,255,0.05)",
          colorInputText: "#ffffff",
          borderRadius: "12px",
        },
      }}
    >
      <html
        lang="pt-BR"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
