"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Ticket } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";

/**
 * Página Cupons — cupons exclusivos de parceiros pros leitores do LADO ₿.
 *
 * TODO (time de tech):
 *  - Buscar cupons do Supabase WHERE is_active = TRUE AND (ends_at IS NULL OR ends_at > NOW())
 *  - Registrar clique no cupom pra métricas (analytics)
 */

// Mock (substituir por fetch do Supabase)
const COUPONS = [
  {
    id: "1",
    partner: "Binance",
    title: "15% off vitalício em taxas",
    description: "Crie sua conta pelo link e ganhe 15% de desconto vitalício em taxas de transação.",
    code: "LADOB",
    link: "https://accounts.binance.com/register?ref=LADOB",
    color: "#F0B90B",
  },
  {
    id: "2",
    partner: "Ledger",
    title: "R$ 100 off em hardware wallets",
    description: "Desconto exclusivo para leitores do LADO ₿ na compra de Ledger Nano S/X.",
    code: "LADOB100",
    link: "https://shop.ledger.com",
    color: "#000000",
  },
  {
    id: "3",
    partner: "Trezor",
    title: "10% off em produtos",
    description: "Válido para toda a linha Trezor no site oficial.",
    code: "LADOB10",
    link: "https://trezor.io/store",
    color: "#00854D",
  },
  {
    id: "4",
    partner: "Remessa Online",
    title: "15% off na primeira remessa",
    description: "Envie dólares para o Brasil com taxa reduzida.",
    code: "LADOB15",
    link: "https://remessaonline.com.br",
    color: "#2E75FF",
  },
];

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cupons exclusivos"
        subtitle="Descontos de parceiros para quem é leitor fiel do LADO ₿"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COUPONS.map((c) => (
          <CouponCard key={c.id} coupon={c} />
        ))}
      </div>
    </div>
  );
}

function CouponCard({
  coupon,
}: {
  coupon: (typeof COUPONS)[number];
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            background: `${coupon.color}20`,
            border: `1px solid ${coupon.color}40`,
          }}
        >
          <Ticket size={22} style={{ color: coupon.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            {coupon.partner}
          </div>
          <h3 className="font-semibold text-white text-base mb-1.5">
            {coupon.title}
          </h3>
          <p className="text-sm text-white/60 mb-4 leading-relaxed">
            {coupon.description}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <button
              type="button"
              onClick={copyCode}
              className="flex-1 flex items-center justify-between gap-2 rounded-lg bg-white/5 border border-dashed border-[#ffc60a]/40 px-3 py-2 text-sm font-mono text-[#ffc60a] hover:bg-white/10 transition"
            >
              <span className="font-bold">{coupon.code}</span>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <a
              href={coupon.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#ffc60a] px-4 py-2 text-sm font-bold text-black hover:bg-[#ffd63d] transition whitespace-nowrap"
            >
              Ir à loja
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
