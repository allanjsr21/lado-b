import { redirect } from "next/navigation";

/**
 * Root page — redireciona conforme autenticação.
 *
 * TODO (time de tech):
 *  - Usar auth() do Clerk pra checar sessão
 *  - Se autenticado → /streak (dashboard)
 *  - Se não → /login
 *
 * Por enquanto redireciona sempre pro login (fluxo padrão).
 */
export default function RootPage() {
  redirect("/login");
}
