/**
 * Cliente Beehiiv — integração com a API da plataforma de newsletter.
 *
 * Docs: https://developers.beehiiv.com/docs
 *
 * Endpoints implementados:
 *  - listPosts: lista edições publicadas (com paginação + ordenação)
 *  - getSubscriptionByEmail: busca assinante por email
 *  - subscribe: inscreve email novo na newsletter
 */

const BEEHIIV_API_BASE = "https://api.beehiiv.com/v2";

function getBeehiivCredentials() {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    throw new Error(
      "Beehiiv env vars ausentes: BEEHIIV_API_KEY / BEEHIIV_PUBLICATION_ID",
    );
  }

  return { apiKey, publicationId };
}

async function beehiivFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { apiKey } = getBeehiivCredentials();

  const res = await fetch(`${BEEHIIV_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Beehiiv API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

// ===================== Tipos =====================

export interface BeehiivPost {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  /** UNIX timestamp em segundos */
  publish_date: number;
  /** UNIX timestamp em segundos */
  created: number;
  preview_text?: string;
  thumbnail_url?: string;
  web_url: string;
  audience: "free" | "premium" | "all";
  status: "draft" | "confirmed" | "archived";
  authors?: string[];
}

export interface BeehiivPostsResponse {
  data: BeehiivPost[];
  page: number;
  limit: number;
  total_results: number;
  total_pages: number;
}

export interface BeehiivSubscription {
  id: string;
  email: string;
  status: "active" | "validating" | "invalid" | "pending" | "unsubscribed";
  created: number;
  subscription_tier: "free" | "premium";
}

// ===================== Funções =====================

/**
 * Lista as edições publicadas (mais recentes primeiro por padrão).
 */
export async function listPosts(options?: {
  limit?: number;
  page?: number;
  status?: "draft" | "confirmed" | "archived";
}): Promise<BeehiivPostsResponse> {
  const { publicationId } = getBeehiivCredentials();
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 10));
  params.set("page", String(options?.page ?? 1));
  params.set("order_by", "publish_date");
  params.set("direction", "desc");
  params.set("status", options?.status ?? "confirmed");

  return beehiivFetch<BeehiivPostsResponse>(
    `/publications/${publicationId}/posts?${params.toString()}`,
  );
}

/**
 * Busca assinante Beehiiv por email.
 */
export async function getSubscriptionByEmail(
  email: string,
): Promise<{ data: BeehiivSubscription } | null> {
  const { publicationId } = getBeehiivCredentials();
  const encoded = encodeURIComponent(email);
  try {
    return await beehiivFetch<{ data: BeehiivSubscription }>(
      `/publications/${publicationId}/subscriptions/by_email/${encoded}`,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) return null;
    throw err;
  }
}

/**
 * Inscreve um email novo na newsletter.
 *
 * @param email Email a ser inscrito
 * @param utmSource Opcional, identifica de onde veio o subscriber (ex: "lado-b-app")
 */
export async function subscribe(
  email: string,
  options?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    referringSite?: string;
    sendWelcomeEmail?: boolean;
  },
): Promise<{ data: BeehiivSubscription }> {
  const { publicationId } = getBeehiivCredentials();

  return beehiivFetch<{ data: BeehiivSubscription }>(
    `/publications/${publicationId}/subscriptions`,
    {
      method: "POST",
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: options?.sendWelcomeEmail ?? true,
        utm_source: options?.utmSource ?? "lado-b-app",
        utm_medium: options?.utmMedium ?? "web",
        utm_campaign: options?.utmCampaign,
        referring_site: options?.referringSite,
      }),
    },
  );
}

/**
 * Helper: formata UNIX timestamp da Beehiiv pra Date.
 */
export function beehiivDate(unix: number): Date {
  return new Date(unix * 1000);
}
