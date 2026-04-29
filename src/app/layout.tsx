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
          colorBackground: "#0a0a0a",
          colorText: "#ffffff",
          colorTextSecondary: "rgba(255,255,255,0.6)",
          colorInputBackground: "#1a1a1a",
          colorInputText: "#ffffff",
          borderRadius: "12px",
        },
        elements: {
          card: "bg-[#0a0a0a] border border-[rgba(255,198,10,0.2)]",
          headerTitle: "text-white",
          headerSubtitle: "text-white/60",
          formButtonPrimary: "bg-[#ffc60a] text-black hover:bg-[#e6b200]",
          footerActionLink: "text-[#ffc60a] hover:text-[#e6b200]",
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
