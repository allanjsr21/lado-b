"use client";

import { useState } from "react";
import { Copy, Check, Mail, Shield, Loader2, Gift } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Página Indicar — programa de indicação com verificação OTP por email.
 *
 * Fluxo de segurança:
 *  1. Usuário entra na página → verifica se email já foi verificado
 *  2. Se NÃO: exibe form pra solicitar código OTP (6 dígitos)
 *  3. Backend (POST /api/referral/verify-email):
 *     - Gera código aleatório
 *     - Salva em otp_codes (user_id, code, expires_at)
 *     - Envia via Resend pro email do usuário
 *  4. Usuário digita o código → POST /api/referral/confirm-otp:
 *     - Valida código + expiração
 *     - Marca users.referral_email_verified = TRUE
 *     - Trigger do Supabase gera ref_code único
 *  5. Página atualiza pra mostrar o link de indicação único
 *
 * TODO (time de tech):
 *  - Conectar com rotas /api/referral/verify-email e /api/referral/confirm-otp
 *  - Buscar status do user (referral_email_verified, ref_code) via Supabase
 *  - Rate limiting: 1 código a cada 60s por email
 */

type Step = "verify-prompt" | "verify-code" | "unlocked";

export default function ReferralPage() {
  // Mock: troque isso pelo estado real do user no Supabase
  const [step, setStep] = useState<Step>("verify-prompt");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Mock do user (substituir por useUser do Clerk)
  const userEmail = "voce@example.com";
  const refCode = "yz222k4l4r"; // vem do Supabase quando verified
  const referralLink = `https://ladob.com.br/?ref=${refCode}`;
  const confirmed = 0;
  const pending = 0;

  async function requestCode() {
    setLoading(true);
    setError(null);
    try {
      // TODO: fetch('/api/referral/verify-email', { method: 'POST' })
      await new Promise((r) => setTimeout(r, 800));
      setStep("verify-code");
    } catch {
      setError("Erro ao enviar código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode() {
    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // TODO: fetch('/api/referral/confirm-otp', { method: 'POST', body: { code } })
      await new Promise((r) => setTimeout(r, 800));
      // Simulação: aceita qualquer código de 6 dígitos
      setStep("unlocked");
    } catch {
      setError("Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indique o LADO ₿"
        subtitle="Compartilhe com seus amigos e ganhe recompensas"
      />

      {/* Estado 1: Verificar email */}
      {step === "verify-prompt" && (
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#ffc60a]/15 border border-[#ffc60a]/25 flex items-center justify-center">
              <Shield className="text-[#ffc60a]" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white text-base">
                Verifique seu email pra desbloquear
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Por segurança, pedimos a confirmação do seu email antes de gerar
                seu link único de indicação.
              </p>
              <p className="text-xs text-white/40 mt-2">
                Enviaremos um código de 6 dígitos para{" "}
                <strong className="text-white/70">{userEmail}</strong>
              </p>
              <button
                type="button"
                onClick={requestCode}
                disabled={loading}
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#ffc60a] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#ffd63d] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Mail size={16} />
                )}
                Enviar código
              </button>
              {error && (
                <p className="mt-3 text-sm text-red-400">{error}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Estado 2: Digitar código */}
      {step === "verify-code" && (
        <Card>
          <div className="max-w-md mx-auto text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ffc60a]/15 border border-[#ffc60a]/25 flex items-center justify-center mb-4">
              <Mail className="text-[#ffc60a]" size={24} />
            </div>
            <h2 className="font-semibold text-white text-lg">
              Enviamos um código para você
            </h2>
            <p className="text-sm text-white/60 mt-2">
              Confira sua caixa de entrada em{" "}
              <strong className="text-white/80">{userEmail}</strong> e digite os
              6 dígitos abaixo.
            </p>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="mt-6 w-full text-center text-2xl font-mono tracking-[0.5em] rounded-xl bg-white/5 border border-white/15 backdrop-blur-md px-4 py-4 text-white placeholder:text-white/20 outline-none focus:border-[#ffc60a]/50 focus:bg-white/10 focus:ring-2 focus:ring-[#ffc60a]/20"
            />
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <button
              type="button"
              onClick={confirmCode}
              disabled={loading || code.length !== 6}
              className="mt-4 w-full rounded-xl bg-[#ffc60a] px-4 py-3 font-bold text-black transition hover:bg-[#ffd63d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Confirmar"
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep("verify-prompt")}
              className="mt-3 text-xs text-white/50 hover:text-white transition"
            >
              ← Enviar para outro email
            </button>
          </div>
        </Card>
      )}

      {/* Estado 3: Link desbloqueado */}
      {step === "unlocked" && (
        <>
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Gift size={18} className="text-[#ffc60a]" />
              <h2 className="font-semibold text-white">Seu link de indicação</h2>
            </div>
            <p className="text-sm text-white/60 mb-4">
              Compartilhe com amigos, colegas e familiares para acumular
              indicações e ganhar recompensas.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="flex-1 rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white/80 text-sm font-mono truncate">
                {referralLink}
              </div>
              <button
                type="button"
                onClick={copyLink}
                className="rounded-xl bg-[#ffc60a] px-4 py-3 font-bold text-black transition hover:bg-[#ffd63d] flex items-center justify-center gap-2 text-sm"
              >
                {copied ? (
                  <>
                    <Check size={16} /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copiar
                  </>
                )}
              </button>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                Confirmadas
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#ffc60a]">
                {confirmed}
              </div>
              <div className="text-xs text-white/50 mt-1">
                pessoas que verificaram email
              </div>
            </Card>
            <Card>
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                Pendentes
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white/80">
                {pending}
              </div>
              <div className="text-xs text-white/50 mt-1">
                cadastros sem verificação
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="font-semibold text-white mb-3">
              📖 Como funciona uma indicação válida
            </h2>
            <ol className="space-y-2 text-sm text-white/70 list-decimal list-inside">
              <li>Você compartilha seu link único</li>
              <li>A pessoa clica e se cadastra no LADO ₿</li>
              <li>
                Ela <strong className="text-[#ffc60a]">confirma o email</strong>{" "}
                enviado pelo sistema
              </li>
              <li>A indicação conta automaticamente pro seu placar</li>
            </ol>
          </Card>
        </>
      )}
    </div>
  );
}
