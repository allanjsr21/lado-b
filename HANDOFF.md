# 🚀 LADO ₿ — Handoff para o time de tech

Guia direto pra quem vai continuar o desenvolvimento e colocar em produção.

---

## 📊 Estado atual do projeto

### ✅ Pronto (frontend + estrutura)

- **Next.js 16** (App Router, TypeScript, Tailwind 4, Turbopack)
- **Páginas públicas (auth)**
  - `/login` — email/senha + Google OAuth
  - `/signup` — cadastro com verificação de email (6 dígitos)
  - `/forgot-password` — recuperação de senha via código
  - `/sso-callback` — retorno do OAuth (Google)
- **Dashboard** (com sidebar responsiva, drawer mobile):
  - `/streak` — home com calendário semanal/mensal + stats
  - `/ranking` — placar streak + indicações
  - `/missions` — 5 conquistas + badges
  - `/referral` — programa de indicação com fluxo OTP
  - `/giveaway` — sorteios
  - `/coupons` — cupons de parceiros
- **Backgrounds WebGL** (testados e aprovados):
  - `aurora-background.tsx` — blobs dourados + estrelinhas piscando
  - `procedural-ground.tsx` — linhas topográficas com perspectiva 3D
  - `neural-noise.tsx`, `shader-background.tsx`, etc. (disponíveis em `/src/components/ui/`)
- **Identidade visual**
  - Dark mode + paleta dourado Bitcoin (`#ffc60a`)
  - Logo LADO ₿ em `/public/logo-dark.svg`
  - Liquid glass + glassmorphism nos cards
- **Schema Supabase completo** (`supabase/schema.sql`)
  - 10 tabelas: users, streaks, missions, user_missions, referrals, otp_codes, readings, coupons, giveaways, giveaway_entries
  - RLS (Row Level Security) habilitado
  - Triggers: gera `ref_code` único quando email é verificado
  - 5 missions iniciais já inseridas
- **API routes** (stubs documentados)
  - `POST /api/referral/verify-email` — envia OTP via Resend
  - `POST /api/referral/confirm-otp` — valida código + libera ref_code
  - `POST /api/webhooks/clerk` — sincroniza user com Supabase
  - `POST /api/webhooks/beehiiv` — registra leituras → atualiza streaks/missions
- **Libs utilitárias**
  - `lib/supabase.ts` — browser + admin client
  - `lib/resend.ts` — email OTP com template HTML
  - `lib/beehiiv.ts` — wrapper da API Beehiiv
- **Integração Clerk**
  - `ClerkProvider` no layout raiz (com localização PT-BR e cores da marca)
  - Hooks `useSignIn`, `useSignUp`, `useClerk` nas páginas auth
  - Middleware Clerk pronto (em passthrough no momento)

---

## ⚠️ Estado atual: **MODO DEMO ATIVO**

Hoje o site navega **sem exigir autenticação real**. Qualquer clique em "Entrar" ou "Criar conta" vai direto pro `/streak`, pra permitir que o time navegue e revise todas as telas.

**Onde isso está implementado:**

- `src/middleware.ts` → Clerk em passthrough (rotas comentadas prontas pra reativar)
- `src/app/(auth)/login/page.tsx` → `handleSubmit` redireciona pro `/streak` com fallback
- `src/app/(auth)/signup/page.tsx` → idem
- `src/app/page.tsx` → sempre redireciona pro `/streak`

---

## 🔧 Pra colocar em produção

### 1. Clerk (autenticação) — **JÁ CONFIGURADO EM DEV**

Aplicação "LADO B" já criada em https://dashboard.clerk.com. As chaves de dev estão em `.env.local` (não commitadas).

Pra produção:
1. Criar instância de production no Clerk
2. Adicionar domínio customizado (ex: `ladob.com.br`)
3. Configurar Google OAuth com domínio próprio (hoje usa shared credentials)
4. Configurar webhook Clerk → `https://ladob.com.br/api/webhooks/clerk`
5. Descomentar proteção de rotas em `src/middleware.ts`
6. Remover fallbacks "modo demo" em `login`, `signup` e `page.tsx`

### 2. Supabase (banco de dados)

1. Criar projeto em https://supabase.com/dashboard
2. Rodar `supabase/schema.sql` no SQL Editor
3. Copiar URL + anon_key + service_role_key pro `.env.local`
4. Ajustar RLS policies se necessário (hoje usa `clerk_id` via JWT claims)

### 3. Resend (emails OTP)

1. Criar conta em https://resend.com
2. Configurar DNS do domínio (SPF + DKIM)
3. Criar API key e colocar em `RESEND_API_KEY`
4. Ajustar `RESEND_FROM_EMAIL` pra `noreply@ladob.com.br`

### 4. Beehiiv (integração com a newsletter)

1. Pegar API key em: app.beehiiv.com → Settings → Integrations → API
2. Configurar webhook Beehiiv apontando pra `https://ladob.com.br/api/webhooks/beehiiv`
3. Evento a escutar: `post.opened`
4. Colocar chaves em `BEEHIIV_API_KEY` e `BEEHIIV_PUBLICATION_ID`

### 5. Deploy (Vercel)

1. Conectar este repo à Vercel
2. Colar todas as env vars no painel Vercel
3. Deploy automático em cada push

---

## 🗂 Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/              — rotas públicas de autenticação
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/         — rotas autenticadas
│   │   ├── layout.tsx       — sidebar + conteúdo
│   │   ├── streak/
│   │   ├── ranking/
│   │   ├── missions/
│   │   ├── referral/
│   │   ├── giveaway/
│   │   └── coupons/
│   ├── api/
│   │   ├── referral/{verify-email,confirm-otp}/
│   │   └── webhooks/{clerk,beehiiv}/
│   ├── sso-callback/
│   ├── layout.tsx           — ClerkProvider + Geist fonts
│   ├── page.tsx             — redirect pra /streak
│   └── globals.css
├── components/
│   ├── layout/sidebar.tsx   — nav lateral + drawer mobile
│   └── ui/                  — componentes reutilizáveis (incluindo vários backgrounds WebGL)
├── lib/
│   ├── supabase.ts
│   ├── resend.ts
│   ├── beehiiv.ts
│   └── utils.ts
└── middleware.ts            — Clerk (passthrough no demo)
supabase/schema.sql          — schema completo
```

---

## 🏃 Rodar local

```bash
git clone git@github.com:allanjsr21/lado-b.git
cd lado-b
npm install
cp .env.local.example .env.local
# preencher as env vars do .env.local
npm run dev
# abrir http://localhost:3000
```

---

## 📝 Padrões usados

- Componentes UI em `/src/components/ui` seguem convenção shadcn
- `"use client"` em tudo que usa hooks
- Glass cards usam `backdrop-blur` + gradient linear + border sutil
- Paleta dourada: `#ffc60a` como primary, preto puro como background
- Formulários: estado local com `useState`, loading states com `<Loader2 />` da `lucide-react`
- Erros: sempre caem num `<div>` com `border-red-500/30 bg-red-500/10 text-red-300`

---

## 💬 Dúvidas?

O `README.md` tem docs complementares. Todas as funções críticas estão comentadas com o que o time precisa implementar (procurar por `TODO (time de tech)` no código).

Qualquer dúvida conceitual — falar com Allan (allan.junior777@gmail.com).
