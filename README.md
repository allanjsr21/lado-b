# LADO ₿ — Área de Membros

Newsletter **LADO ₿ by Vault Capital** — Bitcoin/cripto em português.

Área autenticada de membros com gamificação: streak de leitura, ranking, missões, indicação com OTP, giveaway e cupons.

| Ambiente | URL |
|---|---|
| **Produção (Vercel)** | https://lado-b-khaki.vercel.app |
| **GitHub Pages (demo)** | https://allanjsr21.github.io/lado-b/ |

📄 **Guia completo pro time de tech:** [HANDOFF.md](./HANDOFF.md)

---

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind 4)
- **Clerk** (auth — ClerkProvider ativo, páginas ainda em modo demo)
- **Supabase** (PostgreSQL + RLS — schema rodado, 7 tabelas)
- **Resend** (emails OTP — `sendOtpEmail()` pronto)
- **Beehiiv** (edições no `/streak` ativas • inscrição via `/api/subscribe` • webhook documentado)
- **lucide-react** + **framer-motion** + **three.js** (UI/animações)

---

## Rodar local

```bash
npm install
cp .env.local.example .env.local
# preencher env vars
npm run dev
```

Abre em http://localhost:3000

---

## Rotas

| Rota | Descrição |
|---|---|
| `/login` `/signup` `/forgot-password` | Auth (modo demo — redireciona direto) |
| `/newsletter` | Inscrição na newsletter via Beehiiv |
| `/streak` | Home — calendário de leituras + streak + edição atual |
| `/ranking` | Placar por streak e por indicações |
| `/missions` | Conquistas progressivas com progress bars |
| `/referral` | Fluxo OTP de liberação do link único de indicação |
| `/giveaway` | Sorteios ativos |
| `/coupons` | Cupons de parceiros |

---

## Identidade visual

- **Cor:** `#ffc60a` (dourado Bitcoin)
- **Fundo:** preto puro
- **Logo:** `public/logo-dark.svg`
- **Cards:** liquid glass + backdrop-blur + glow dourado
- **Mobile-first:** sidebar vira drawer

---

## Contato

Allan — allan.junior777@gmail.com
