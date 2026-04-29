# 🚀 LADO ₿ — Handoff para o time de tech

> **Atualizado:** 29 de abril de 2026

## Links

| Ambiente | URL |
|---|---|
| **Produção (Vercel)** | https://lado-b-khaki.vercel.app |
| **GitHub Pages (demo estático)** | https://allanjsr21.github.io/lado-b/ |
| **Repositório** | https://github.com/allanjsr21/lado-b |

---

## ✅ O que já está pronto e no ar

| Item | Status | Detalhe |
|---|---|---|
| Frontend — 11 rotas | ✅ | Responsive, dark mode, identidade dourada |
| ClerkProvider no layout | ✅ | `src/app/layout.tsx` — ptBR + tema dourado |
| Supabase — org + projeto | ✅ | `lado-b` em São Paulo (sa-east-1) |
| Supabase — 7 tabelas + RLS | ✅ | Schema rodado, 6 missões seedadas |
| Resend — conta + API key | ✅ | `sendOtpEmail()` em `src/lib/resend.ts` |
| Beehiiv — fetch de edições | ✅ | Aparece no `/streak` em build-time |
| API routes | ✅ | Ver lista abaixo |
| Deploy Vercel | ✅ | 15 env vars configuradas, status: Ready |
| GitHub Pages | ✅ | Deploy automático a cada push em `main` |

### API routes existentes

| Rota | Função |
|---|---|
| `POST /api/subscribe` | Inscrição na newsletter via Beehiiv |
| `GET /api/missions` | Lista missões do usuário |
| `GET /api/ranking` | Ranking por streak e indicações |
| `POST /api/referral/send-otp` | Envia OTP por email via Resend |
| `POST /api/referral/verify-otp` | Valida OTP, gera `ref_code` |
| `GET /api/referral/status` | Status de verificação do usuário |
| `POST /api/webhooks/clerk` | Sincroniza usuário novo com Supabase |
| `POST /api/webhooks/beehiiv` | Registra leituras → atualiza streak/missões |

---

## ⏳ O que falta (configuração manual — ~30 min)

### 1. Clerk — Webhook

No [dashboard.clerk.com](https://dashboard.clerk.com):

1. Ir em **Webhooks** → Add Endpoint
2. URL: `https://lado-b-khaki.vercel.app/api/webhooks/clerk`
3. Eventos: `user.created`, `user.updated`
4. Copiar o **Signing Secret** gerado
5. Adicionar em Vercel → Settings → Environment Variables:
   ```
   CLERK_WEBHOOK_SECRET=whsec_...
   ```
6. Redeploy (ou novo push em `main`)

### 2. Beehiiv — Webhook

No painel [app.beehiiv.com](https://app.beehiiv.com):

1. Settings → Integrations → Webhooks → Add Webhook
2. URL: `https://lado-b-khaki.vercel.app/api/webhooks/beehiiv`
3. Evento: `post.opened` (contabiliza leitura para o streak)
4. Copiar o **Webhook Secret**
5. Adicionar em Vercel → Settings → Environment Variables:
   ```
   BEEHIIV_WEBHOOK_SECRET=...
   ```
6. Redeploy

### 3. Domínio customizado (quando tiver o domínio)

Na Vercel:
1. Settings → Domains → Add Domain
2. Adicionar `ladob.com.br` (ou o domínio escolhido)
3. Apontar DNS conforme instrução da Vercel
4. Atualizar a env var `NEXT_PUBLIC_APP_URL=https://ladob.com.br`
5. Atualizar também o domínio nos webhooks do Clerk e Beehiiv

### 4. Resend — domínio próprio (para produção real)

Hoje os emails saem de `onboarding@resend.dev` (domínio da Resend).
Para usar `noreply@ladob.com.br`:

1. Em [resend.com/domains](https://resend.com/domains) → Add Domain → `ladob.com.br`
2. Configurar os registros DNS indicados (SPF, DKIM, DMARC)
3. Atualizar em Vercel: `RESEND_FROM_EMAIL=noreply@ladob.com.br`

### 5. Ativar autenticação real nas páginas (modo demo)

Hoje as páginas de login/signup/forgot-password redirecionam direto pro dashboard sem validar nada. Para ativar o Clerk real:

- `src/app/(auth)/login/page.tsx` → descomentar `useSignIn()` + `signIn.create()`
- `src/app/(auth)/signup/page.tsx` → descomentar `useSignUp()` + `signUp.create()`
- `src/app/(auth)/forgot-password/page.tsx` → descomentar reset password
- `src/components/layout/sidebar.tsx` → ativar `useClerk().signOut()`
- Recriar `src/middleware.ts` para proteger rotas autenticadas:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/login(.*)", "/signup(.*)", "/forgot-password(.*)",
  "/newsletter(.*)", "/sso-callback(.*)", "/api/webhooks(.*)",
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

---

## 🗄️ Supabase

**Projeto:** `lado-b`
**Região:** South America (São Paulo) — `sa-east-1`
**URL:** `https://glqvuilreommxdixxxim.supabase.co`

### Tabelas criadas

| Tabela | Descrição |
|---|---|
| `users` | Espelha usuários do Clerk (`clerk_id` único) |
| `streaks` | Streak atual e recorde por usuário |
| `readings` | Registro de leituras (1 por edição por usuário) |
| `missions` | Catálogo de missões (6 seedadas) |
| `user_missions` | Progresso de cada usuário em cada missão |
| `referrals` | Link único de indicação + status de verificação de email |
| `otp_codes` | Códigos OTP temporários para verificação |

Schema completo em `supabase/schema.sql`.

### RLS

Todas as tabelas têm RLS habilitado. Hoje as políticas são permissivas (leitura pública) para facilitar o desenvolvimento. Para produção, ajustar para validar `clerk_id` via JWT claims:

```sql
-- Exemplo para tabela readings
CREATE POLICY "users can read own readings"
ON public.readings FOR SELECT
USING (
  user_id = (
    SELECT id FROM public.users
    WHERE clerk_id = auth.jwt()->>'sub'
  )
);
```

---

## 🔑 Env vars — resumo completo

| Variável | Onde obter | Status |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | dashboard.clerk.com | ✅ Configurada |
| `CLERK_SECRET_KEY` | dashboard.clerk.com | ✅ Configurada |
| `CLERK_WEBHOOK_SECRET` | dashboard.clerk.com → Webhooks | ⏳ Falta criar webhook |
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Project Settings | ✅ Configurada |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → Project Settings | ✅ Configurada |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase.com → Project Settings | ✅ Configurada |
| `RESEND_API_KEY` | resend.com/api-keys | ✅ Configurada |
| `RESEND_FROM_EMAIL` | — | ✅ `onboarding@resend.dev` (trocar p/ domínio próprio) |
| `BEEHIIV_API_KEY` | app.beehiiv.com → Settings → API | ✅ Configurada |
| `BEEHIIV_PUBLICATION_ID` | app.beehiiv.com → Settings → API | ✅ Configurada |
| `BEEHIIV_WEBHOOK_SECRET` | app.beehiiv.com → Webhooks | ⏳ Falta criar webhook |
| `NEXT_PUBLIC_APP_URL` | — | ✅ `https://lado-b-khaki.vercel.app` |

Para rodar local: `cp .env.local.example .env.local` e preencher os valores.

---

## 🏗️ Stack

- **Next.js 16** (App Router + Turbopack)
- **TypeScript + Tailwind CSS 4**
- **@clerk/nextjs** v7 + `@clerk/localizations` (ptBR)
- **@supabase/supabase-js**
- **resend** ^6
- **lucide-react**, **framer-motion**, **three.js / ogl** (UI/animações)

---

## 🗂️ Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/              Rotas públicas (login, signup, forgot-password)
│   ├── (dashboard)/         Rotas autenticadas (sidebar)
│   ├── api/                 API routes (subscribe, missions, ranking, referral, webhooks)
│   ├── layout.tsx           Root layout com ClerkProvider
│   └── page.tsx             Redirect para /streak
├── components/
│   ├── layout/sidebar.tsx
│   └── ui/                  Componentes visuais (glass, backgrounds, cards)
└── lib/
    ├── supabase.ts           Clients browser + admin
    ├── resend.ts             sendOtpEmail()
    ├── beehiiv.ts            listPosts() + subscribe()
    ├── asset.ts              Helper basePath (GitHub Pages)
    └── utils.ts              cn() + helpers
supabase/
└── schema.sql               Schema completo com RLS
.github/
└── workflows/deploy.yml     GitHub Pages CI
```

---

## 🏃 Rodar local

```bash
git clone https://github.com/allanjsr21/lado-b.git
cd lado-b
npm install
cp .env.local.example .env.local
# preencher env vars no .env.local
npm run dev
# abre http://localhost:3000
```

---

## 📋 TODOs no código

Todos os pontos de integração incompletos estão marcados com `TODO (time de tech)`:

```bash
grep -rn "TODO (time de tech)" src/
```

Principais:
- Auth real nas páginas de login/signup/forgot-password
- Middleware de proteção de rotas
- Buscar dados reais do Supabase nas páginas do dashboard (hoje usam dados mockados)
- Criar `sso-callback` page para OAuth do Google

---

## 💬 Contato

- **Produto:** Allan — allan.junior777@gmail.com
- **Repo:** https://github.com/allanjsr21/lado-b
