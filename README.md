# LADO ₿ — Área de Membros

Aplicação web para engajamento dos leitores da newsletter **LADO ₿ by Vault Capital**.

Sistema de gamificação com streak de leituras, ranking, missões, programa de indicação com verificação por email, giveaways e cupons de parceiros.

---

## Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | Next.js 14+ (App Router) | TypeScript |
| UI | Tailwind CSS + 21st.dev | Dark mode + liquid glass |
| Autenticação | Clerk | OAuth Google + email/senha |
| Banco de dados | Supabase (PostgreSQL) | Row Level Security habilitado |
| Envio de emails | Resend | Códigos OTP + notificações |
| Newsletter | Beehiiv | Integração via API para tracking de leituras |
| Hosting | Vercel | Deploy automático via GitHub |

---

## Estrutura de pastas

```
lado-b/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── (auth)/             # Grupo de rotas públicas
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/        # Grupo de rotas protegidas
│   │   │   ├── streak/         # Home — calendário de leituras
│   │   │   ├── ranking/        # Placar de leitores
│   │   │   ├── missions/       # Conquistas e badges
│   │   │   ├── referral/       # Programa de indicação
│   │   │   ├── giveaway/       # Sorteios ativos
│   │   │   └── coupons/        # Cupons de parceiros
│   │   ├── api/                # Rotas de API
│   │   │   ├── referral/
│   │   │   │   ├── verify-email/route.ts    # Envia OTP
│   │   │   │   └── confirm-otp/route.ts     # Valida OTP
│   │   │   ├── beehiiv/
│   │   │   │   └── webhook/route.ts         # Webhook de leituras
│   │   │   └── webhooks/
│   │   │       └── clerk/route.ts           # Sincroniza users
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Componentes base (21st.dev)
│   │   ├── layout/             # Sidebar, header
│   │   └── features/           # Streak, missões, etc.
│   ├── lib/
│   │   ├── supabase.ts         # Cliente Supabase
│   │   ├── resend.ts           # Cliente Resend
│   │   ├── beehiiv.ts          # Cliente Beehiiv
│   │   └── utils.ts
│   ├── types/                  # Tipos TypeScript
│   └── middleware.ts           # Proteção de rotas Clerk
├── public/
│   └── logo.svg                # Logo LADO ₿
├── supabase/
│   ├── migrations/             # Migrações SQL
│   └── schema.sql              # Schema completo
├── .env.local.example
├── .env.local                  # (não versionar)
└── package.json
```

---

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
# Clerk (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend (https://resend.com)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@ladob.com.br

# Beehiiv (https://developers.beehiiv.com)
BEEHIIV_API_KEY=
BEEHIIV_PUBLICATION_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Setup local

```bash
# 1. Clonar
git clone <repo-url>
cd lado-b

# 2. Instalar
npm install

# 3. Configurar env
cp .env.local.example .env.local
# preencher as chaves

# 4. Rodar migrações do Supabase
npx supabase db push

# 5. Dev
npm run dev
```

Acesse: http://localhost:3000

---

## Fluxos críticos

### 1. Login
Clerk gerencia. Rotas protegidas via `middleware.ts`. Após login, o webhook Clerk dispara criação do registro na tabela `users` do Supabase.

### 2. Streak (dias consecutivos de leitura)
1. Beehiiv envia webhook quando um assinante abre uma edição
2. `api/beehiiv/webhook` incrementa o streak do usuário no Supabase
3. Dashboard lê o streak e renderiza o calendário

### 3. Indicação com verificação de email (OTP)
1. Usuário logado acessa `/referral`
2. Se email ainda não verificado → dispara `POST /api/referral/verify-email`
3. Resend envia código de 6 dígitos
4. Usuário digita código → `POST /api/referral/confirm-otp`
5. Supabase marca email como verificado e gera `ref_code` único
6. Frontend exibe o link: `ladob.com.br/?ref={ref_code}`

**Validação da indicação:**
- Alguém se cadastra pelo link → salva `referred_by` pendente
- Confirma email via Clerk → trigger marca indicação como válida
- Contador do indicador sobe +1

---

## Deploy (Vercel)

### Pré-requisitos
1. Conta Vercel conectada ao GitHub
2. Todas as env vars configuradas no painel da Vercel
3. Domínio apontando para Vercel

### Passos
1. Push para branch `main` → deploy automático
2. Configurar webhook do Clerk apontando para `https://<dominio>/api/webhooks/clerk`
3. Configurar webhook do Beehiiv apontando para `https://<dominio>/api/beehiiv/webhook`

### Domínio
- Produção: `ladob.com.br` (a definir)
- Staging: `staging.ladob.com.br` (a definir)

---

## Segurança

- **Autenticação:** Clerk com MFA disponível
- **Proteção de rotas:** middleware Next.js valida sessão em todas as rotas `(dashboard)`
- **Banco:** Supabase com Row Level Security (RLS) — cada usuário só vê seus próprios dados
- **OTP:** códigos expiram em 10 minutos, rate limiting por email
- **Webhooks:** validação de assinatura (Clerk signature, Beehiiv HMAC)
- **Secrets:** todas as chaves em env vars, nunca versionadas

---

## Identidade visual

- **Logo:** LADO ₿ (letras em amarelo) + "by Vault Capital" (branco)
- **Paleta:**
  - Preto: `#000000` (background principal)
  - Amarelo Bitcoin: `#FFC60A` (destaques, CTAs)
  - Branco: `#FFFFFF` (textos)
- **Estilo:** Dark mode + liquid glass (glassmorphism) — backdrop-blur + bordas com glow dourado sutil

---

## Roadmap

- [x] Bootstrap do projeto Next.js
- [x] Configuração Tailwind + TypeScript
- [ ] Página de login (glassmorphism)
- [ ] Schema Supabase + migrações
- [ ] Integração Clerk
- [ ] Layout autenticado (sidebar + content)
- [ ] Página Streak
- [ ] Página Missões
- [ ] Página Ranking
- [ ] Página Indicar + fluxo OTP
- [ ] Página Giveaway
- [ ] Página Cupons
- [ ] Webhook Beehiiv
- [ ] Deploy Vercel

---

## Responsáveis

- **Produto / Conteúdo:** Allan (Vault Capital)
- **Desenvolvimento:** time de tech Vault Capital
