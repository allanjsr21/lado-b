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
 * MODO DEMO (GitHub Pages): sem ClerkProvider (incompatível com static export).
 *
 * Quando for pra produção (Vercel), restaurar:
 *   import { ClerkProvider } from "@clerk/nextjs";
 *   import { ptBR } from "@clerk/localizations";
 *   <ClerkProvider localization={ptBR} appearance={{ ... }}>...</ClerkProvider>
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
