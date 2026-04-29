# ✅ TODO — O que falta para ir a 100%

> App no ar em https://lado-b-khaki.vercel.app  
> Tudo abaixo são configurações de serviços externos — não requer mudança de código.

---

## 1. Configurar webhooks (Clerk + Beehiiv)

### Clerk → cria usuário no Supabase

1. Acessar [dashboard.clerk.com](https://dashboard.clerk.com) → **Webhooks** → Add Endpoint
2. URL: `https://lado-b-khaki.vercel.app/api/webhooks/clerk`
3. Eventos a ativar: `user.created` e `user.updated`
4. Copiar o **Signing Secret** gerado
5. Adicionar em [Vercel → lado-b → Settings → Environment Variables](https://vercel.com/allans-projects-c44e5e95/lado-b/settings/environment-variables):
   ```
   CLERK_WEBHOOK_SECRET=whsec_...
   ```
6. Fazer redeploy (ou qualquer push em `main`)

> ⚠️ Sem isso: novos usuários não são salvos no Supabase → streak e missões não funcionam.

### Beehiiv → registra leitura no streak

1. Acessar [app.beehiiv.com](https://app.beehiiv.com) → Settings → Integrations → Webhooks → Add Webhook
2. URL: `https://lado-b-khaki.vercel.app/api/webhooks/beehiiv`
3. Evento: `post.opened`
4. Copiar o **Webhook Secret**
5. Adicionar em Vercel como:
   ```
   BEEHIIV_WEBHOOK_SECRET=...
   ```
6. Redeploy

> ⚠️ Sem isso: abertura de email não é registrada → streak nunca avança.

**Arquivos já prontos:**
- `src/app/api/webhooks/clerk/route.ts`
- `src/app/api/webhooks/beehiiv/route.ts`

---

## 2. Ativar autenticação real (Clerk)

As páginas de login/signup/forgot-password hoje redirecionam direto pro dashboard sem validar nada (modo demo). Para ativar o Clerk real:

### Páginas de auth

- `src/app/(auth)/login/page.tsx` → descomentar `useSignIn()` + `signIn.create(...)`
- `src/app/(auth)/signup/page.tsx` → descomentar `useSignUp()` + `signUp.create(...)`
- `src/app/(auth)/forgot-password/page.tsx` → descomentar reset password flow
- `src/components/layout/sidebar.tsx` → ativar `useClerk().signOut()`

### Middleware de proteção de rotas

Criar `src/middleware.ts`:

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

### Callback do OAuth Google

Criar `src/app/sso-callback/page.tsx`:

```tsx
"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/streak"
      signUpForceRedirectUrl="/streak"
    />
  );
}
```

> Todos os pontos de integração estão marcados com `TODO (time de tech)` no código.  
> Para listar todos: `grep -rn "TODO (time de tech)" src/`

---

## 3. Trocar o domínio (quando estiver pronto)

1. Em [Vercel → lado-b → Settings → Domains](https://vercel.com/allans-projects-c44e5e95/lado-b/settings/domains) → Add Domain
2. Adicionar o domínio (ex: `ladob.com.br`)
3. Apontar DNS conforme instrução da Vercel
4. Atualizar em Vercel → Environment Variables:
   ```
   NEXT_PUBLIC_APP_URL=https://ladob.com.br
   ```
5. Atualizar a URL nos webhooks do Clerk e Beehiiv para o domínio novo
6. Configurar domínio no Resend para enviar de `noreply@ladob.com.br` em vez de `onboarding@resend.dev`

---

## Resumo do estado atual

| Serviço | Status |
|---|---|
| Vercel (deploy) | ✅ No ar — lado-b-khaki.vercel.app |
| Supabase (banco) | ✅ Projeto criado, 7 tabelas, RLS ativo |
| Clerk (auth) | ✅ Chaves configuradas — falta webhook + ativar nas páginas |
| Resend (email OTP) | ✅ API key configurada — falta domínio próprio |
| Beehiiv (newsletter) | ✅ Edições aparecem no streak — falta webhook de leituras |
| GitHub Actions (Pages) | ✅ Deploy automático a cada push |
