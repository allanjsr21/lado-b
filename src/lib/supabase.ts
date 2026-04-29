import { createClient } from "@supabase/supabase-js";

/**
 * Clientes e queries Supabase — LADO ₿.
 *
 * CLIENTES:
 *  - createSupabaseBrowserClient: client-side, anon key, respeita RLS
 *  - createSupabaseAdminClient: server-side, service_role key, bypass RLS
 *
 * QUERIES (todas usam admin client — chamadas apenas em server components / API routes):
 *  - getOrCreateUser        → sincroniza usuário do Clerk
 *  - getUserStreak          → streak atual + recorde
 *  - getReadingDays         → dias lidos num mês (para o calendário)
 *  - recordReading          → registra leitura + atualiza streak/missions
 *  - getRanking             → top 50 por streak ou indicações
 *  - getUserMissions        → progresso de missões do usuário
 *  - getUserReferral        → link + contadores de indicações
 *  - createOtpCode          → gera e salva OTP
 *  - verifyOtpCode          → valida OTP e libera ref_code
 */

// ===================== Clientes =====================

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase browser env vars ausentes");
  return createClient(url, key);
}

/** ⚠️ Só usar em server-side (API routes, Server Components). NUNCA expor ao client. */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase admin env vars ausentes");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Retorna true se Supabase está configurado (env vars presentes). */
export function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// ===================== Tipos =====================

export interface UserRow {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  referral_email_verified: boolean;
  ref_code: string | null;
  beehiiv_subscription_id: string | null;
  created_at: string;
}

export interface StreakRow {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
}

export interface MissionRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_emoji: string;
  target_days: number;
  sort_order: number;
}

export interface UserMissionRow {
  mission_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
}

export interface RankingRow {
  position: number;
  user_id: string;
  full_name: string;
  value: number;
}

export interface ReferralStats {
  ref_code: string | null;
  email_verified: boolean;
  confirmed: number;
  pending: number;
}

// ===================== Queries =====================

/**
 * Busca ou cria usuário no Supabase a partir do Clerk userId.
 * Chamado no webhook clerk/user.created e como fallback nas rotas.
 */
export async function getOrCreateUser(
  clerkId: string,
  email: string,
  fullName?: string,
  avatarUrl?: string,
): Promise<UserRow> {
  const db = createSupabaseAdminClient();

  // Tenta buscar primeiro
  const { data: existing } = await db
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (existing) return existing as UserRow;

  // Cria novo usuário
  const { data, error } = await db
    .from("users")
    .insert({
      clerk_id: clerkId,
      email,
      full_name: fullName ?? null,
      avatar_url: avatarUrl ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar usuário: ${error.message}`);

  // Cria linha de streak vazia
  await db.from("streaks").upsert({ user_id: data.id }, { onConflict: "user_id" });

  return data as UserRow;
}

/**
 * Busca streak atual e recorde do usuário.
 */
export async function getUserStreak(
  clerkId: string,
): Promise<{ currentStreak: number; longestStreak: number } | null> {
  const db = createSupabaseAdminClient();

  const { data: user } = await db
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return null;

  const { data } = await db
    .from("streaks")
    .select("current_streak, longest_streak")
    .eq("user_id", user.id)
    .single();

  if (!data) return { currentStreak: 0, longestStreak: 0 };

  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
  };
}

/**
 * Retorna os dias do mês em que o usuário leu alguma edição.
 * Ex: [1, 4, 5, 12] = leu nos dias 1, 4, 5 e 12 do mês.
 */
export async function getReadingDays(
  clerkId: string,
  year: number,
  month: number, // 0-indexed (igual JS)
): Promise<number[]> {
  const db = createSupabaseAdminClient();

  const { data: user } = await db
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return [];

  const start = new Date(year, month, 1).toISOString();
  const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const { data } = await db
    .from("readings")
    .select("read_at")
    .eq("user_id", user.id)
    .gte("read_at", start)
    .lte("read_at", end);

  if (!data) return [];

  // Extrai dias únicos
  const days = [...new Set(data.map((r) => new Date(r.read_at).getDate()))];
  return days;
}

/**
 * Registra leitura de uma edição.
 * Chamado pelo webhook Beehiiv quando o usuário abre um post.
 * Também atualiza automaticamente streak e missões via Supabase function.
 */
export async function recordReading(
  clerkId: string,
  beehiivPostId: string,
  postTitle?: string,
): Promise<void> {
  const db = createSupabaseAdminClient();

  const { data: user } = await db
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) throw new Error("Usuário não encontrado");

  // Insere leitura (ignora se já existe — UNIQUE constraint)
  await db.from("readings").upsert(
    {
      user_id: user.id,
      beehiiv_post_id: beehiivPostId,
      post_title: postTitle ?? null,
    },
    { onConflict: "user_id,beehiiv_post_id" },
  );

  // Atualiza streak
  await updateStreak(user.id);
  // Atualiza missões
  await updateMissions(user.id);
}

/** Recalcula streak do usuário baseado nas leituras. */
async function updateStreak(userId: string): Promise<void> {
  const db = createSupabaseAdminClient();

  // Busca datas de leitura distintas, ordenadas desc
  const { data: readings } = await db
    .from("readings")
    .select("read_at")
    .eq("user_id", userId)
    .order("read_at", { ascending: false });

  if (!readings || readings.length === 0) return;

  // Calcula streak consecutivo
  const dates = [
    ...new Set(readings.map((r) => r.read_at.split("T")[0])),
  ].sort((a, b) => (a > b ? -1 : 1));

  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 1) {
      current++;
    } else {
      break;
    }
  }

  // Busca recorde atual
  const { data: streakRow } = await db
    .from("streaks")
    .select("longest_streak")
    .eq("user_id", userId)
    .single();

  const longest = Math.max(current, streakRow?.longest_streak ?? 0);

  await db.from("streaks").upsert(
    {
      user_id: userId,
      current_streak: current,
      longest_streak: longest,
      last_read_date: dates[0],
    },
    { onConflict: "user_id" },
  );
}

/** Atualiza progresso de todas as missões do usuário. */
async function updateMissions(userId: string): Promise<void> {
  const db = createSupabaseAdminClient();

  // Total de dias únicos lidos
  const { count } = await db
    .from("readings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const totalDays = count ?? 0;

  // Busca todas as missões ativas
  const { data: missions } = await db
    .from("missions")
    .select("id, target_days")
    .eq("is_active", true);

  if (!missions) return;

  for (const mission of missions) {
    const progress = Math.min(totalDays, mission.target_days);
    const completed = progress >= mission.target_days;

    await db.from("user_missions").upsert(
      {
        user_id: userId,
        mission_id: mission.id,
        progress,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,mission_id" },
    );
  }
}

/**
 * Ranking top 50 — por streak ou por indicações confirmadas.
 */
export async function getRanking(
  type: "streak" | "referrals",
  limit = 50,
): Promise<RankingRow[]> {
  const db = createSupabaseAdminClient();

  if (type === "streak") {
    const { data } = await db
      .from("streaks")
      .select("user_id, current_streak, users(full_name)")
      .order("current_streak", { ascending: false })
      .limit(limit);

    if (!data) return [];

    return data.map((row, i) => ({
      position: i + 1,
      user_id: row.user_id,
      full_name:
        (row.users as unknown as { full_name: string | null } | null)?.full_name ??
        "Anônimo",
      value: row.current_streak,
    }));
  }

  // Referrals
  const { data } = await db
    .from("referrals")
    .select("referrer_id, users!referrer_id(full_name)")
    .eq("status", "valid");

  if (!data) return [];

  // Agrupa por referrer
  const counts: Record<string, { name: string; count: number }> = {};
  for (const row of data) {
    const id = row.referrer_id;
    const name =
      (row.users as unknown as { full_name: string | null } | null)?.full_name ??
      "Anônimo";
    counts[id] = { name, count: (counts[id]?.count ?? 0) + 1 };
  }

  return Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([id, { name, count }], i) => ({
      position: i + 1,
      user_id: id,
      full_name: name,
      value: count,
    }));
}

/**
 * Missões do usuário com progresso.
 */
export async function getUserMissions(clerkId: string) {
  const db = createSupabaseAdminClient();

  const { data: user } = await db
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return [];

  const { data: missions } = await db
    .from("missions")
    .select("id, slug, name, description, icon_emoji, target_days, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (!missions) return [];

  const { data: userMissions } = await db
    .from("user_missions")
    .select("mission_id, progress, completed, completed_at")
    .eq("user_id", user.id);

  const progressMap = Object.fromEntries(
    (userMissions ?? []).map((um) => [um.mission_id, um]),
  );

  return missions.map((m) => ({
    ...m,
    progress: progressMap[m.id]?.progress ?? 0,
    completed: progressMap[m.id]?.completed ?? false,
    completed_at: progressMap[m.id]?.completed_at ?? null,
  }));
}

/**
 * Dados de indicação do usuário (link, contadores, verificação de email).
 */
export async function getUserReferral(
  clerkId: string,
): Promise<ReferralStats | null> {
  const db = createSupabaseAdminClient();

  const { data: user } = await db
    .from("users")
    .select("id, ref_code, referral_email_verified")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return null;

  const { count: confirmed } = await db
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", user.id)
    .eq("status", "valid");

  const { count: pending } = await db
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", user.id)
    .eq("status", "pending");

  return {
    ref_code: user.ref_code,
    email_verified: user.referral_email_verified,
    confirmed: confirmed ?? 0,
    pending: pending ?? 0,
  };
}

/**
 * Cria código OTP para verificação de email de indicação.
 */
export async function createOtpCode(
  clerkId: string,
  email: string,
): Promise<string> {
  const db = createSupabaseAdminClient();

  const { data: user } = await db
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) throw new Error("Usuário não encontrado");

  // Invalida OTPs anteriores não usados
  await db
    .from("otp_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("used_at", null);

  // Gera código de 6 dígitos
  const code = String(Math.floor(100000 + Math.random() * 900000));

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  const { error } = await db.from("otp_codes").insert({
    user_id: user.id,
    email,
    code,
    purpose: "referral",
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw new Error(`Erro ao criar OTP: ${error.message}`);

  return code;
}

/**
 * Verifica código OTP. Se válido, marca email como verificado.
 * O trigger do Supabase gera o ref_code automaticamente.
 */
export async function verifyOtpCode(
  clerkId: string,
  code: string,
): Promise<boolean> {
  const db = createSupabaseAdminClient();

  const { data: user } = await db
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return false;

  const { data: otp } = await db
    .from("otp_codes")
    .select("id, attempts, expires_at")
    .eq("user_id", user.id)
    .eq("code", code)
    .eq("purpose", "referral")
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!otp) return false;

  // Marca como usado
  await db
    .from("otp_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", otp.id);

  // Libera email verificado (trigger gera ref_code)
  await db
    .from("users")
    .update({ referral_email_verified: true })
    .eq("id", user.id);

  return true;
}
