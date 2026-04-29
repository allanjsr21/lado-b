# 🚀 LADO ₿ — Handoff para o time de tech

Guia completo pra quem vai colocar em produção. Tudo que precisa saber em um só arquivo.

> **Site ao vivo (modo demo):** https://allanjsr21.github.io/lado-b/
> **Repositório:** https://github.com/allanjsr21/lado-b

---

## 🎯 TL;DR

1. **Frontend 100% pronto** — 11 rotas, responsive, dark mode com identidade dourada, backgrounds WebGL.
2. **Modo demo ativo no GitHub Pages** — qualquer clique em "Entrar" vai pro dashboard. Auth desabilitada temporariamente pro review visual.
3. **Integração Clerk/Supabase/Resend/Beehiiv pronta pra ligar** — arquivos, libs, schema SQL, hooks, webhooks, middleware, tudo em `TODO (time de tech)` no código.
4. **Deploy alvo real = Vercel + Supabase + Clerk** (GitHub Pages é só pra review estático).

---

## 📊 Estado das páginas

### Públicas (auth)

| Rota | Status | Observação |
|---|---|---|
| `/` | ✅ | Redireciona pra `/streak` (client-side, compatível com export) |
| `/login` | ✅ | Form completo + Google OAuth ready; hoje só redireciona |
| `/signup` | ✅ | Form com nome/email/senha/confirmar + verificação OTP stub |
| `/forgot-password` | ✅ | Solicita email → mostra tela de confirmação |

### Autenticadas (dashboard)

| Rota | Status | Dados |
|---|---|---|
| `/streak` | ✅ | Saudação + streak atual/record + calendário (semanal/mensal) + última edição + próxima conquista |
| `/ranking` | ✅ | Tabs Streak + Indicações, usuário atual destacado, pódio dourado |
| `/missions` | ✅ | 5 missões com progress bars + badges conquistadas |
| `/referral` | ✅ | Fluxo OTP (verify-prompt → verify-code → unlocked) + estatísticas |
| `/giveaway` | ✅ | Banner ativo + regras + inscrições |
| `/coupons` | ✅ | 4 parceiros (Binance, Ledger, Trezor, Remessa Online) com copy + CTA |

Todas usam a **Sidebar** compartilhada (`src/components/layout/sidebar.tsx`) com:
- Drawer no mobile (hamburger)
- Ícones lucide-react
- Active state dourado
- Logout (hoje só redireciona; TODO Clerk `useClerk().signOut()`)

---

## 🎨 Identidade visual

| Token | Valor |
|---|---|
| Cor primária | `#ffc60a` (dourado Bitcoin) |
| Cor de fundo | Preto puro (`#000000`) |
| Logo | `public/logo-dark.svg` (versão sem fundo branco) |
| Fontes | Geist Sans + Geist Mono (Next.js) |
| Cards | Liquid glass com `backdrop-blur-xl` + borda sutil + glow dourado |
| Backgrounds | Aurora (blobs) em `/login`, sólido em dashboard |

---

## 🏗️ Stack

- **Next.js 16** (App Router + Turbopack)
- **TypeScript + Tailwind CSS 4**
- **lucide-react** (ícones)
- **framer-motion** (animações)
- **three.js + ogl** (backgrounds WebGL)
- **@clerk/nextjs** + `@clerk/localizations` (auth ready, em stub)
- **@supabase/supabase-js** (client instalado)
- **resend** (client instalado)

---

## 🔧 Pra colocar em produção

### 1. Voltar autenticação (Clerk)

Reverter o modo demo — ativar hooks reais nas 3 páginas auth:

- `src/app/(auth)/login/page.tsx` → descomentar `useSignIn()` + `signIn.create(...)` + Google OAuth
- `src/app/(auth)/signup/page.tsx` → descomentar `useSignUp()` + `signUp.create(...)` + verificação de email
- `src/app/(auth)/forgot-password/page.tsx` → descomentar `signIn.create({ strategy: 'reset_password_email_code' })`

Re-adicionar `ClerkProvider` no `src/app/layout.tsx` (hoje removido pra funcionar em static export):

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

<ClerkProvider
  localization={ptBR}
  appearance={{
    variables: {
      colorPrimary: "#ffc60a",
      colorBackground: "#000000",
      colorText: "#ffffff",
      borderRadius: "0.75rem",
    },
  }}
>
  {children}
</ClerkProvider>
```

Recriar `src/middleware.ts` pra proteger rotas:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/login(.*)", "/signup(.*)", "/forgot-password(.*)",
  "/sso-callback(.*)", "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

Recriar `src/app/sso-callback/page.tsx`:

```tsx
"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback signInForceRedirectUrl="/streak" signUpForceRedirectUrl="/streak" />;
}
```

Remover o modo demo no `src/app/page.tsx` e usar `auth()` do Clerk pra checar sessão.

### 2. Rodar o schema no Supabase

1. Criar projeto em https://supabase.com/dashboard
2. Abrir SQL Editor → colar `supabase/schema.sql` → executar
3. Pegar URL + anon key + service_role key
4. Conferir RLS policies (usa `clerk_id` via JWT claims — pode precisar ajustar o template JWT no Clerk)

### 3. Recriar as API routes (foram removidas no static export)

As rotas em `src/app/api/` foram removidas pro deploy GitHub Pages. Precisa recriar:

- `POST /api/referral/verify-email` — envia OTP via Resend, salva em `otp_codes`
- `POST /api/referral/confirm-otp` — valida código, marca email verificado, gera `ref_code`
- `POST /api/webhooks/clerk` — sincroniza user com Supabase (`user.created`, `user.updated`, `email.created`)
- `POST /api/webhooks/beehiiv` — registra leituras → atualiza streaks/missions

O pseudocódigo dessas rotas está documentado nas libs (`src/lib/supabase.ts`, `src/lib/resend.ts`, `src/lib/beehiiv.ts`).

### 4. Resend (email)

1. Criar conta em https://resend.com
2. Configurar DNS (SPF + DKIM) no domínio (ex: ladob.com.br)
3. API key em `RESEND_API_KEY`
4. `RESEND_FROM_EMAIL=noreply@ladob.com.br`

### 5. Beehiiv (newsletter)

**Status atual**: integração de leitura já está ligada. `/streak` faz fetch das edições em build-time via `listPosts()` (server component). Form de inscrição em `/newsletter` está pronto em modo demo (simula sucesso).

**Pra ativar inscrição real (precisa Vercel)**:

1. API key em app.beehiiv.com → Settings → Integrations → API → setar `BEEHIIV_API_KEY` e `BEEHIIV_PUBLICATION_ID` nas env vars
2. Criar route handler `src/app/api/subscribe/route.ts`:
   ```ts
   import { NextResponse } from "next/server";
   import { subscribe } from "@/lib/beehiiv";

   export async function POST(req: Request) {
     const { email } = await req.json();
     if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
     try {
       const result = await subscribe(email, { utmSource: "lado-b-app" });
       return NextResponse.json(result);
     } catch (err) {
       const msg = err instanceof Error ? err.message : "subscribe failed";
       return NextResponse.json({ error: msg }, { status: 500 });
     }
   }
   ```
3. Setar `NEXT_PUBLIC_SUBSCRIBE_ENDPOINT=/api/subscribe` no `.env` — o `NewsletterForm` já consome essa env var.

**Webhook de leituras (gamificação de streak)**:

1. Configurar webhook no painel Beehiiv apontando pra `https://<domínio>/api/webhooks/beehiiv`
2. Evento: `post.opened`
3. Secret em `BEEHIIV_WEBHOOK_SECRET`
4. Criar `src/app/api/webhooks/beehiiv/route.ts` que valida assinatura HMAC e dá insert em `readings` no Supabase (schema já tem trigger pra atualizar streak).

### 6. Ajustar `next.config.ts` pra produção

Remover o modo GitHub Pages (`output: 'export'` etc.) quando for deployar na Vercel/servidor Node:

```ts
const nextConfig: NextConfig = {
  // Modo produção Vercel: sem export, com SSR/API routes normal
};
```

Também remover o uso de `asset()` (helper de basePath) que só precisa em static export com subpath.

### 7. Deploy Vercel

1. Conectar https://github.com/allanjsr21/lado-b à Vercel
2. Colar as env vars no painel:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   CLERK_WEBHOOK_SECRET=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   RESEND_API_KEY=...
   RESEND_FROM_EMAIL=noreply@ladob.com.br
   BEEHIIV_API_KEY=...
   BEEHIIV_PUBLICATION_ID=...
   BEEHIIV_WEBHOOK_SECRET=...
   NEXT_PUBLIC_APP_URL=https://ladob.com.br
   ```
3. Deploy automático a cada push na branch `main`
4. Configurar domínio customizado (Vercel → Settings → Domains)
5. Configurar webhooks do Clerk e Beehiiv apontando pro domínio final

---

## 📋 TODOs marcados no código

Todos os pontos de integração estão marcados com `TODO (time de tech)`:

- `src/app/(auth)/login/page.tsx` — ativar `useSignIn`
- `src/app/(auth)/signup/page.tsx` — ativar `useSignUp`
- `src/app/(auth)/forgot-password/page.tsx` — ativar reset password
- `src/components/layout/sidebar.tsx` — ativar `signOut`
- `src/app/(dashboard)/*` — buscar dados reais do Supabase
- `src/app/(dashboard)/layout.tsx` — proteção de rotas
- `src/lib/{supabase,resend,beehiiv}.ts` — clientes prontos com pseudocódigo nas rotas de API

Grep rápido: `grep -rn "TODO (time de tech)" src/` dentro do repo.

---

## 🗂 Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/              — rotas públicas
│   ├── (dashboard)/         — rotas autenticadas (com sidebar)
│   │   └── layout.tsx
│   ├── layout.tsx           — root layout (fontes + metadata)
│   └── page.tsx             — redirect pra /streak
├── components/
│   ├── layout/sidebar.tsx
│   └── ui/                  — 15+ componentes (backgrounds, card, button, glass, etc)
├── lib/
│   ├── supabase.ts          — browser + admin client
│   ├── resend.ts            — email OTP com template HTML
│   ├── beehiiv.ts           — wrapper da API
│   ├── asset.ts             — helper basePath (GitHub Pages)
│   └── utils.ts             — cn() + helpers
public/
├── logo.svg                 — versão com fundo branco
└── logo-dark.svg            — versão transparente (usada no site)
supabase/schema.sql          — schema completo com RLS + triggers
.github/workflows/deploy.yml — workflow GitHub Pages
```

---

## 🏃 Rodar local

```bash
git clone https://github.com/allanjsr21/lado-b.git
cd lado-b
npm install
cp .env.local.example .env.local
# preencher env vars
npm run dev
# abre http://localhost:3000
```

---

## 🔍 Debug / como foi decidido

**Por que GitHub Pages no momento do handoff?**
- Time visual precisa revisar o site antes de ativar produção
- Clerk em dev tem rate limits e qualquer teste gera contas fake
- Static export é gratuito e instantâneo
- Migrar pra Vercel/SSR é 15min (basta remover `output: 'export'`)

**Por que 4 backgrounds WebGL diferentes em `/components/ui/`?**
- Foram iterações durante o design
- Só `aurora-background.tsx` (dashboard) e `procedural-ground.tsx` (login desktop) estão em uso
- Os outros (`wavy`, `shader-background`, `neural-noise`, `background-boxes`, etc.) podem ser deletados se o time quiser

**Por que liquid-glass tem 2 arquivos?**
- `liquid-glass.tsx` = componente original do 21st.dev (referência)
- `glass-effect.tsx` = versão dark-mode customizada com props `overlayColor` e `highlightColor`

---

## 💬 Contato

- **Produto / Conteúdo:** Allan (allan.junior777@gmail.com)
- **Repo:** https://github.com/allanjsr21/lado-b
- **Demo ao vivo:** https://allanjsr21.github.io/lado-b/
