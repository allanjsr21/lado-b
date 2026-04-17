"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root page — redireciona pro dashboard (client-side, compatível com export estático).
 *
 * MODO DEMO: sempre vai pro /streak.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/streak");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-[#ffc60a] text-sm">Redirecionando…</div>
    </div>
  );
}
