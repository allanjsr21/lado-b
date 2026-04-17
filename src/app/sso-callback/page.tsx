"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

/**
 * SSO Callback — página de fallback do OAuth Clerk (Google, etc).
 * O Clerk redireciona o usuário aqui após login OAuth; este componente
 * completa o fluxo e redireciona pra /streak.
 */
export default function SSOCallbackPage() {
  return (
    <>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/streak"
        signUpForceRedirectUrl="/streak"
      />
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="text-[#ffc60a] animate-spin" size={32} />
      </div>
    </>
  );
}
