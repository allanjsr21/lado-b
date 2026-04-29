"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Mail } from "lucide-react";

/**
 * Form de inscrição na newsletter LADO ₿ (Beehiiv).
 *
 * MODO DEMO (static export GitHub Pages):
 *  - Sem endpoint real, simula sucesso após 600ms.
 *
 * PRODUÇÃO (time de tech):
 *  - Setar NEXT_PUBLIC_SUBSCRIBE_ENDPOINT="/api/subscribe" no .env
 *  - Criar route handler em src/app/api/subscribe/route.ts que chama
 *    `subscribe(email, { utmSource: "lado-b-app" })` de @/lib/beehiiv
 *  - Migrar deploy pra Vercel (static export do GitHub Pages não suporta
 *    rotas de API).
 */

const ENDPOINT = process.env.NEXT_PUBLIC_SUBSCRIBE_ENDPOINT;

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          throw new Error(`Falha ao inscrever (${res.status})`);
        }
      } else {
        // MODO DEMO
        await new Promise((r) => setTimeout(r, 600));
      }
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível inscrever agora. Tenta de novo.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#ffc60a]/10 border border-[#ffc60a]/30">
        <CheckCircle2 size={20} className="text-[#ffc60a] flex-shrink-0" />
        <div>
          <div className="font-semibold text-white text-sm">
            Inscrição confirmada!
          </div>
          <div className="text-xs text-white/60 mt-0.5">
            Confere seu e-mail{email ? ` (${email})` : ""} pra começar a
            receber a LADO ₿.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
        <Mail size={16} className="text-[#ffc60a]" />
        Inscreva-se na newsletter LADO ₿
      </div>
      <p className="text-xs text-white/60 leading-relaxed">
        Bitcoin/cripto em português, direto no seu e-mail. Grátis.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          disabled={loading}
          className="flex-1 rounded-xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#ffc60a]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#ffc60a]/25 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="rounded-xl bg-[#ffc60a] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#ffd63d] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Inscrever"}
        </button>
      </div>
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 font-medium">
          {error}
        </div>
      )}
    </form>
  );
}
