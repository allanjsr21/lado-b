"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Trophy,
  Target,
  Gift,
  Ticket,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";

/**
 * Sidebar — navegação lateral da área autenticada LADO ₿.
 *
 * Responsivo:
 *  - Desktop (≥ lg): sidebar fixa à esquerda (240px) sempre visível
 *  - Mobile (< lg): drawer que desliza da esquerda, acionado por hamburger
 *
 * Fecha automaticamente ao mudar de rota no mobile.
 */

const navItems = [
  { href: "/streak", label: "Home", icon: Home },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/missions", label: "Missões", icon: Target },
  { href: "/referral", label: "Indicar", icon: Gift },
  { href: "/coupons", label: "Cupons", icon: Ticket },
];

const glassStyle: React.CSSProperties = {
  background: `linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 198, 10, 0.02) 100%)`,
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  borderRight: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow:
    "inset 1px 0 0 rgba(255, 255, 255, 0.05), inset -1px 0 0 rgba(0, 0, 0, 0.3)",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    // MODO DEMO — só redireciona.
    // TODO (time de tech): usar useClerk().signOut() aqui
    router.push("/login");
  };

  // Fecha drawer ao mudar de rota (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Botão hamburger — só no mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Overlay (só aparece quando drawer aberto no mobile) */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-60 flex flex-col z-50 overflow-hidden transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={glassStyle}
      >
        {/* Highlight no topo */}
        <div
          className="absolute top-0 left-4 right-4 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 198, 10, 0.4), transparent)",
          }}
        />

        {/* Botão fechar — só mobile */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center py-8 px-4">
          <Link href="/streak" className="flex items-center justify-center">
            <Image
              src={asset("/logo-dark.svg")}
              alt="LADO ₿"
              width={100}
              height={100}
              priority
              className="w-auto h-14"
            />
          </Link>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#ffc60a]/10 text-[#ffc60a] border border-[#ffc60a]/20"
                        : "text-white/70 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer — Sair */}
        <div className="p-3 space-y-1 border-t border-white/5">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
