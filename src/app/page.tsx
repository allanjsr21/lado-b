import { redirect } from "next/navigation";

/**
 * Root page — redireciona pro dashboard.
 *
 * MODO DEMO: sempre vai pro /streak.
 * Quando Clerk estiver 100% conectado, restaurar:
 *   const { userId } = await auth();
 *   if (userId) redirect("/streak");
 *   redirect("/login");
 */
export default function RootPage() {
  redirect("/streak");
}
