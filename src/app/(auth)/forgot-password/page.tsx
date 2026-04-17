"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import AuroraBackground from "@/components/ui/aurora-background";

/**
 * Página Esqueci a Senha — LADO ₿
 *
 * MODO DEMO: só simula envio.
 * TODO (time de tech): ativar Clerk signIn.create({ strategy: 'reset_password_email_code' })
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // MODO DEMO
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
    // Remove warning de unused
    void error;
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AuroraBackground starCount={60} pulseDuration={10} />
      </div>

      <div className="relative z-10 w-full max-w-md">
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
            <div className="flex flex-col items-center mb-4">
              <Image
                src="/logo-dark.svg"
                alt="LADO ₿ by Vault Capital"
                width={220}
                height={220}
                priority
                className="w-auto h-32 sm:h-36 drop-shadow-[0_0_30px_rgba(255,198,10,0.35)]"
              />
            </div>

            {!sent ? (
              <>
                <h1 className="text-center text-white text-lg font-bold mb-1">
                  Esqueceu a senha?
                </h1>
                <p className="text-center text-white/60 text-sm mb-6">
                  Informe seu e-mail e enviaremos um link para redefinir.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-[#ffc60a]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#ffc60a]/25"
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 backdrop-blur-md font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[#ffc60a] px-4 py-3.5 font-bold text-black transition hover:bg-[#ffd63d] hover:shadow-[0_8px_24px_rgba(255,198,10,0.35)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Enviar link de redefinição"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#ffc60a]/15 border border-[#ffc60a]/30 flex items-center justify-center mb-4">
                  <Mail className="text-[#ffc60a]" size={22} />
                </div>
                <h1 className="text-white text-lg font-bold mb-2">
                  E-mail enviado!
                </h1>
                <p className="text-white/70 text-sm">
                  Confira sua caixa de entrada em{" "}
                  <strong className="text-white">{email}</strong> para redefinir
                  sua senha.
                </p>
              </div>
            )}

            <Link
              href="/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-white/70 hover:text-white transition"
            >
              <ArrowLeft size={14} />
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
