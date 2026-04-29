import { NextResponse } from "next/server";
import { subscribe } from "@/lib/beehiiv";

/**
 * POST /api/subscribe
 * Inscreve um email na newsletter LADO ₿ via Beehiiv.
 *
 * Body: { email: string }
 * Usado pelo NewsletterForm quando NEXT_PUBLIC_SUBSCRIBE_ENDPOINT=/api/subscribe
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email obrigatório" }, { status: 400 });
    }

    const result = await subscribe(email, {
      utmSource: "lado-b-app",
      utmMedium: "web",
    });

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao inscrever";
    console.error("[api/subscribe]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
