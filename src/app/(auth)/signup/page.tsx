"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSignUp } from "@clerk/nextjs";
import AuroraBackground from "@/components/ui/aurora-background";

/**
 * Página de Criar Conta — LADO ₿ (integração Clerk)
 */
export default function SignupPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado de verificação de email
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    if (password.length < 8) {
      setError("A senha precisa ter no mínimo 8 caracteres");
      return;
    }

    setLoading(true);
    // MODO DEMO: vai direto pro dashboard (sem verificar email).
    // TODO (time de tech): reativar Clerk signUp.create + verificação de email
    try {
      if (isLoaded && signUp) {
        const [firstName, ...rest] = name.trim().split(" ");
        const lastName = rest.join(" ") || undefined;
        await signUp.create({
          emailAddress: email,
          password,
          firstName,
          lastName,
        });
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setPendingVerification(true);
        return;
      }
      router.push("/streak");
    } catch {
      router.push("/streak");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;

    setError(null);
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/streak");
      } else {
        setError("Verifique o código e tente novamente.");
      }
    } catch (err: unknown) {
      const e = err as { errors?: Array<{ message?: string }> };
      setError(e.errors?.[0]?.message ?? "Código inválido.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    try {
      if (isLoaded && signUp) {
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/streak",
        });
      } else {
        router.push("/streak");
      }
    } catch {
      router.push("/streak");
    }
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

            <h1 className="text-center text-white/80 text-sm mb-6 font-medium">
              {pendingVerification ? "Confirme seu e-mail" : "Crie sua conta"}
            </h1>

            {pendingVerification ? (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-center text-white/70 text-sm">
                  Enviamos um código de 6 dígitos para{" "}
                  <strong className="text-white">{email}</strong>
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
                  className="w-full text-center text-2xl font-mono tracking-[0.5em] rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-4 text-white placeholder:text-white/20 outline-none focus:border-[#ffc60a]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#ffc60a]/25"
                />
                {error && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 backdrop-blur-md font-medium">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full rounded-full bg-[#ffc60a] px-4 py-3 font-bold text-black transition hover:bg-[#ffd63d] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Confirmar e entrar"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingVerification(false)}
                  className="w-full text-xs text-white/60 hover:text-white transition"
                >
                  ← Voltar
                </button>
              </form>
            ) : (
            <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-[#ffc60a]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#ffc60a]/25"
                />
              </div>

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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-3 pr-11 text-white placeholder:text-white/40 outline-none transition focus:border-[#ffc60a]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#ffc60a]/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition z-10"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-white/90 mb-2">
                  Confirmar senha
                </label>
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Digite novamente"
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
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Criar conta"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/50 font-medium">ou</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-4 py-3 font-medium text-white transition hover:bg-white/10 hover:border-white/25 disabled:opacity-60 flex items-center justify-center gap-3"
            >
              <GoogleIcon />
              Criar conta com Google
            </button>

            <p className="mt-6 text-center text-sm text-white/70 font-medium">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-[#ffc60a] font-semibold hover:text-[#ffd63d] transition">
                Entrar
              </Link>
            </p>

            <p className="mt-4 text-center text-[11px] text-white/50 leading-relaxed">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link href="/terms" className="underline hover:text-white/80">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link href="/privacy" className="underline hover:text-white/80">
                Política de Privacidade
              </Link>
              .
            </p>
            </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-0.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
