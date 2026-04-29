"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { asset } from "@/lib/asset";
import AuroraBackground from "@/components/ui/aurora-background";
import { NewsletterForm } from "@/components/newsletter-form";

/**
 * Página pública de inscrição na newsletter LADO ₿.
 *
 * Rota pública (não requer auth). Inscreve direto na Beehiiv via
 * NewsletterForm (em modo demo simula sucesso; em produção chama
 * NEXT_PUBLIC_SUBSCRIBE_ENDPOINT).
 */
export default function NewsletterPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AuroraBackground starCount={60} pulseDuration={10} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition mb-4"
        >
          <ArrowLeft size={14} />
          voltar pro login
        </Link>

        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 198, 10, 0.04) 100%)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(255, 198, 10, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
          }}
        >
          <div
            className="absolute top-0 left-10 right-10 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255, 198, 10, 0.6), transparent)",
            }}
          />

          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col items-center mb-6">
              <Image
                src={asset("/logo-dark.svg")}
                alt="LADO ₿ by Vault Capital"
                width={220}
                height={220}
                priority
                className="w-auto h-28 sm:h-32 drop-shadow-[0_0_30px_rgba(255,198,10,0.35)]"
              />
            </div>

            <h1 className="text-center text-white text-xl font-bold mb-2">
              Receba a LADO ₿ no seu e-mail
            </h1>
            <p className="text-center text-white/60 text-sm mb-6 leading-relaxed">
              Bitcoin e cripto em português, direto da Vault Capital.
              Sem spam, sem hype.
            </p>

            <NewsletterForm />

            <p className="mt-6 text-center text-xs text-white/50 leading-relaxed">
              Já é assinante?{" "}
              <Link
                href="/login"
                className="text-[#ffc60a] font-semibold hover:text-[#ffd63d] transition"
              >
                Entrar na área de membros
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
