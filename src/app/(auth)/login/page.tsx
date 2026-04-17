"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";
import AuroraBackground from "@/components/ui/aurora-background";
import { GlassEffect, GlassFilter } from "@/components/ui/liquid-glass";
import ProceduralGroundBackground from "@/components/ui/procedural-ground";

/**
 * Página de Login — LADO ₿ (integração Clerk)
 */
export default function LoginPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // MODO DEMO: entra direto sem validar.
    // TODO (time de tech): ativar `signIn.create(...)` do Clerk aqui
    // quando Clerk estiver configurado em produção.
    try {
      if (isLoaded && signIn) {
        const result = await signIn.create({
          identifier: email,
          password,
        });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
        }
      }
      router.push("/streak");
    } catch {
      // Se Clerk falhar, entra em modo demo
      router.push("/streak");
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    // MODO DEMO: entra direto
    // TODO (time de tech): descomentar OAuth Clerk quando configurado
    try {
      if (isLoaded && signIn) {
        await signIn.authenticateWithRedirect({
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
    <main className="relative min-h-screen flex items-center justify-center px-4 py-2 overflow-hidden">
      {/* SVG filter do liquid glass */}
      <GlassFilter />

      {/* Camada 1: Procedural Ground — linhas topográficas douradas 3D */}
      <ProceduralGroundBackground className="!absolute z-0" />

      {/* Camada 2: Aurora (blobs + estrelas) sobreposto com blend screen pra somar luz */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      >
        <AuroraBackground starCount={50} pulseDuration={12} />
      </div>

      {/* Card de login — Liquid Glass real (21st.dev suraj-xd) */}
      <div className="relative z-10 w-full max-w-md">
        <GlassEffect className="rounded-3xl w-full flex-col">
          <div className="w-full p-5 sm:p-6">
            {/* Logo */}
            <div className="flex flex-col items-center -mt-2 -mb-3">
              <Image
                src="/logo-dark.svg"
                alt="LADO ₿ by Vault Capital"
                width={220}
                height={220}
                priority
                className="w-auto h-20 sm:h-24 drop-shadow-[0_0_30px_rgba(255,198,10,0.35)]"
              />
            </div>

            <h1 className="text-center text-black/80 text-sm mb-4 font-semibold">
              Entre na sua conta
            </h1>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black/80 mb-2">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-2xl border border-white/40 bg-white/20 backdrop-blur-md px-4 py-2.5 text-black placeholder:text-black/40 outline-none transition focus:border-[#ffc60a] focus:bg-white/40 focus:ring-2 focus:ring-[#ffc60a]/40"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black/80 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/40 bg-white/20 backdrop-blur-md px-4 py-2.5 pr-11 text-black placeholder:text-black/40 outline-none transition focus:border-[#ffc60a] focus:bg-white/40 focus:ring-2 focus:ring-[#ffc60a]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition z-10"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-black/70 hover:text-black transition"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/20 px-3 py-2 text-sm text-red-900 backdrop-blur-md font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#ffc60a] px-4 py-3 font-bold text-black transition hover:bg-[#ffd63d] hover:shadow-[0_8px_24px_rgba(255,198,10,0.35)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Entrar"}
              </button>
            </form>

            {/* Separador */}
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-black/15" />
              <span className="text-xs text-black/50 font-medium">ou</span>
              <div className="flex-1 h-px bg-black/15" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full rounded-full border border-white/50 bg-white/30 backdrop-blur-md px-4 py-2.5 font-semibold text-black transition hover:bg-white/50 hover:border-white/70 disabled:opacity-60 flex items-center justify-center gap-3"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            {/* Signup */}
            <p className="mt-4 text-center text-sm text-black/70 font-medium">
              Não tem uma conta?{" "}
              <Link href="/signup" className="text-black font-bold hover:text-[#ffc60a] transition">
                Criar conta
              </Link>
            </p>
          </div>
        </GlassEffect>
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
