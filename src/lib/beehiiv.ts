/**
 * Cliente Beehiiv — integração com a API da plataforma de newsletter.
 *
 * Docs: https://developers.beehiiv.com/docs
 *
 * Funções implementadas:
 *  - getSubscription: busca assinante por email
 *  - listPosts: lista edições publicadas
 *
 * TODO (time de tech):
 *  - Expandir conforme necessidade (criar subscriber, unsubscribe, etc.)
 *  - Configurar webhook no painel Beehiiv apontando para /api/webhooks/beehiiv
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

/**
 * Busca assinante Beehiiv por email.
 * Útil pra vincular Clerk user com beehiiv_subscription_id.
 */
export async function getSubscriptionByEmail(email: string) {
  const { publicationId } = getBeehiivCredentials();
  const encoded = encodeURIComponent(email);
  return beehiivFetch<{
    data: { id: string; email: string; status: string };
  }>(`/publications/${publicationId}/subscriptions/by_email/${encoded}`);
}

/**
 * Lista as edições publicadas da newsletter.
 */
export async function listPosts(options?: { limit?: number }) {
  const { publicationId } = getBeehiivCredentials();
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));

  return beehiivFetch<{
    data: Array<{
      id: string;
      title: string;
      subtitle?: string;
      slug: string;
      published_at: string;
      web_url: string;
    }>;
  }>(`/publications/${publicationId}/posts?${params.toString()}`);
}
