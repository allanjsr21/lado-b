"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Mail, Shield, Loader2, Gift, BookOpen } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";

/**
 * Página Indicar — programa de indicação com verificação OTP por email.
 *
 * Fluxo (Vercel + Supabase + Resend configurados):
 *  1. GET /api/referral/status → verifica se email já foi verificado
 *  2. POST /api/referral/send-otp → gera OTP + envia via Resend
 *  3. POST /api/referral/verify-otp → valida código + libera ref_code
 *
 * Modo demo (GitHub Pages / sem backend):
 *  - Falha silenciosa nas chamadas de API → simula fluxo localmente
 *
 * NOTA: useUser() do Clerk não é usado aqui pois Clerk v7 usa Server Actions
 * internamente, incompatíveis com static export. O email do usuário vem da
 * resposta do /api/referral/send-otp (que usa auth() server-side no Vercel).
 */

type Step = "loading" | "verify-prompt" | "verify-code" | "unlocked";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ladob.com.br";

export default function ReferralPage() {
  const [step, setStep] = useState<Step>("loading");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [refCode, setRefCode] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(0);
  const [pending, setPending] = useState(0);
  const [sentEmail, setSentEmail] = useState<string>("seu e-mail");

  const referralLink = refCode ? `${APP_URL}/?ref=${refCode}` : "";

  // ── Carrega status ao montar ──────────────────────────────────────────
  useEffect(() => {
    fetch("/api/referral/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.email_verified && data?.ref_code) {
          setRefCode(data.ref_code);
          setConfirmed(data.confirmed ?? 0);
          setPending(data.pending ?? 0);
          setStep("unlocked");
        } else {
          setStep("verify-prompt");
        }
      })
      .catch(() => setStep("verify-prompt"));
  }, []);

  // ── Solicita código OTP ───────────────────────────────────────────────
  async function requestCode() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/referral/send-otp", { method: "POST" });

      if (res.ok) {
        const data = await res.json();
        setSentEmail(data.email ?? "seu e-mail");
      } else {
        // Demo mode: API não disponível (GitHub Pages)
        setSentEmail("seu e-mail (demo)");
      }
      setStep("verify-code");
    } catch {
      // Demo: sem conexão com API
      setSentEmail("seu e-mail (demo)");
      setStep("verify-code");
    } finally {
      setLoading(false);
    }
  }

  // ── Verifica código OTP ───────────────────────────────────────────────
  async function confirmCode() {
    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/referral/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        const data = await res.json();
        setRefCode(data.ref_code ?? "demo-ref-code");
      } else {
        const data = await res.json();
        throw new Error(data.error ?? "Código inválido");
      }
      setStep("unlocked");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("fetch") || msg === "") {
        // Demo: aceita qualquer código de 6 dígitos
        setRefCode("demo-ref-code");
        setStep("unlocked");
      } else {
        setError(msg || "Código incorreto ou expirado.");
      }
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

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 size={28} className="text-[#ffc60a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indique o LADO ₿"
        subtitle="Compartilhe com seus amigos e ganhe recompensas"
      />

      {/* ── Estado 1: Verificar email ─────────────────────────────── */}
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
                Por segurança, pedimos a confirmação do seu email antes de
                gerar seu link único de indicação.
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
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </div>
          </div>
        </Card>
      )}

      {/* ── Estado 2: Digitar código ──────────────────────────────── */}
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
              <strong className="text-white/80">{sentEmail}</strong> e digite
              os 6 dígitos abaixo.
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
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Verificar e desbloquear"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("verify-prompt");
                setCode("");
                setError(null);
              }}
              className="mt-3 text-xs text-white/50 hover:text-white transition"
            >
              ← Reenviar código
            </button>
          </div>
        </Card>
      )}

      {/* ── Estado 3: Link desbloqueado ───────────────────────────── */}
      {step === "unlocked" && (
        <>
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Gift size={18} className="text-[#ffc60a]" />
              <h2 className="font-semibold text-white">Seu link de indicação</h2>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="flex-1 text-sm text-white/80 font-mono truncate">
                {referralLink}
              </span>
              <button
                type="button"
                onClick={copyLink}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-[#ffc60a] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#ffd63d]"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <div className="text-2xl font-bold text-[#ffc60a]">
                  {confirmed}
                </div>
                <div className="text-xs text-white/50 mt-1">confirmadas</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <div className="text-2xl font-bold text-white/60">
                  {pending}
                </div>
                <div className="text-xs text-white/50 mt-1">pendentes</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-[#ffc60a]" />
              <h2 className="font-semibold text-white">Como funciona?</h2>
            </div>
            <ol className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ffc60a]/20 text-[#ffc60a] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                Compartilhe seu link único com amigos
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ffc60a]/20 text-[#ffc60a] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Seu amigo se inscreve na newsletter
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ffc60a]/20 text-[#ffc60a] text-xs font-bold flex items-center justify-center">
                  3
                </span>
                Você sobe no ranking e desbloqueia recompensas
              </li>
            </ol>
          </Card>
        </>
      )}
    </div>
  );
}
