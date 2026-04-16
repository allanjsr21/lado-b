"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuroraBackground from "@/components/ui/aurora-background";
import { GlassEffect, GlassFilter } from "@/components/ui/glass-effect";

/**
 * Página de Login — LADO ₿
 *
 * Liquid glass REAL (macOS Tahoe style):
 *  - Background: WebGL animado com ondas fluidas em amarelo + preto
 *  - Card: SVG filter distortion + backdrop-blur + highlights inset
 *
 * TODO (time de tech):
 *  - Substituir handleSubmit pela chamada real do Clerk (signIn.create)
 *  - Substituir handleGoogleLogin pela integração OAuth Clerk
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // TODO: Integrar com Clerk
      console.log("Login:", { email, password });
      await new Promise((r) => setTimeout(r, 800));
    } catch {
      setError("Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      // TODO: Integrar com Clerk OAuth
      console.log("Google login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Filter SVG para distorção líquida (fica oculto) */}
      <GlassFilter />

      {/* Aurora background premium (Aceternity UI style) — blobs + stars + gradients */}
      <div className="absolute inset-0 z-0">
        <AuroraBackground starCount={60} pulseDuration={10} />
      </div>

      {/* Card de login com liquid glass REAL */}
      <div className="relative z-10 w-full max-w-md">
        <GlassEffect
          className="rounded-3xl"
          overlayColor="rgba(255, 255, 255, 0.08)"
          highlightColor="rgba(255, 198, 10, 0.25)"
        >
          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <Image
                src="/logo-dark.svg"
                alt="LADO ₿ by Vault Capital"
                width={220}
                height={220}
                priority
                className="w-auto h-32 sm:h-36 drop-shadow-[0_0_30px_rgba(255,198,10,0.3)]"
              />
            </div>

            <h1 className="text-center text-white/80 text-sm mb-8 font-medium">
              Entre na sua conta
            </h1>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-[#ffc60a]/50 focus:bg-white/15 focus:ring-2 focus:ring-[#ffc60a]/20"
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
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-3 pr-11 text-white placeholder:text-white/40 outline-none transition focus:border-[#ffc60a]/50 focus:bg-white/15 focus:ring-2 focus:ring-[#ffc60a]/20"
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
                <div className="mt-2 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#ffc60a]/90 hover:text-[#ffc60a] transition"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 backdrop-blur-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-[#ffc60a] px-4 py-3 font-bold text-black transition hover:shadow-[0_0_30px_rgba(255,198,10,0.5)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Entrar"}
              </button>
            </form>

            {/* Separador */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-xs text-white/50">ou</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-3 font-medium text-white transition hover:bg-white/15 hover:border-white/25 disabled:opacity-60 flex items-center justify-center gap-3"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            {/* Signup */}
            <p className="mt-6 text-center text-sm text-white/70">
              Não tem uma conta?{" "}
              <Link href="/signup" className="text-[#ffc60a] hover:text-[#ffd63d] font-semibold transition">
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
