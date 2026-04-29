# LADO ₿ — Área de Membros

Newsletter **LADO ₿ by Vault Capital** — Bitcoin/cripto em português.

Este repositório é a **área autenticada de membros** com gamificação (streak de leitura, ranking, missões, indicação com OTP, giveaway e cupons).

🔗 **Demo ao vivo:** https://allanjsr21.github.io/lado-b/
📄 **Guia pro time de tech:** ver [HANDOFF.md](./HANDOFF.md)

---

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind 4)
- **Clerk** (auth — pronto, em stub)
- **Supabase** (PostgreSQL + RLS — schema pronto)
- **Resend** (emails OTP — client pronto)
- **Beehiiv** (fetch de edições no /streak já ativo • form de inscrição em /newsletter • webhook de leituras documentado)
- **lucide-react** + **framer-motion** + **three.js** (UI/animações)

---

## Rodar local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abrir http://localhost:3000

> **Modo demo**: qualquer clique em Entrar vai pro dashboard sem validar nada. Pra ativar auth real, ver [HANDOFF.md](./HANDOFF.md).

---

## Rotas

| Rota | Descrição |
|---|---|
| `/login` `/signup` `/forgot-password` | Auth (form + Google OAuth ready) |
| `/newsletter` | Inscrição pública na newsletter LADO ₿ via Beehiiv |
| `/streak` | Home — calendário de leituras + streak + próxima conquista |
| `/ranking` | Placar por streak e por indicações |
| `/missions` | 5 conquistas progressivas com progress bars |
| `/referral` | Fluxo OTP de liberação do link único de indicação |
| `/giveaway` | Sorteios ativos |
| `/coupons` | Cupons de parceiros (Binance, Ledger, Trezor, Remessa Online) |

---

## Deploy

Hoje está em **GitHub Pages** (static export) só pra review visual do time.

Deploy alvo real: **Vercel + Supabase + Clerk** — passos completos no [HANDOFF.md](./HANDOFF.md).

---

## Identidade visual

- **Cor:** `#ffc60a` (dourado Bitcoin)
- **Fundo:** preto puro
- **Logo:** `public/logo-dark.svg`
- **Cards:** liquid glass + backdrop-blur + glow dourado
- **Mobile-first:** sidebar vira drawer, tudo responsivo

---

## Estrutura

```
src/
├── app/
│   ├── (auth)/              Rotas públicas
│   ├── (dashboard)/         Rotas autenticadas com sidebar
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/sidebar.tsx
│   └── ui/                  Cards, backgrounds, glass effects
└── lib/
    ├── supabase.ts
    ├── resend.ts
    ├── beehiiv.ts
    ├── asset.ts             Helper de basePath p/ GitHub Pages
    └── utils.ts
supabase/schema.sql          Schema completo com RLS + triggers
```

---

## Convenções

- Componentes UI em `src/components/ui/` (estrutura shadcn)
- `"use client"` em tudo que usa hooks (React state, WebGL, framer)
- Todos os pontos de integração marcados com `TODO (time de tech)` no código
- Imports usam path alias `@/` (ver `tsconfig.json`)

---

## Contato

Allan — allan.junior777@gmail.com
