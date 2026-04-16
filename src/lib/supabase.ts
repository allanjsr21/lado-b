import { createClient } from "@supabase/supabase-js";

/**
 * Clientes Supabase.
 *
 * - createSupabaseBrowserClient: uso no client-side com anon key
 *   (respeita Row Level Security do usuário logado)
 *
 * - createSupabaseAdminClient: uso no server-side com service_role key
 *   (BYPASS RLS — NUNCA expor ao client, só usar em rotas de API / webhooks)
 */

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase env vars ausentes: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createClient(url, key);
}

/**
 * ⚠️ Só pode ser importado em código server-side (rotas de API, Server Actions,
 * Server Components). NUNCA em código client ou exposição ao browser.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin env vars ausentes: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
