/**
 * Middleware — proteção de rotas via Clerk.
 *
 * Rotas públicas (sem auth): /login, /signup, /forgot-password, /api/webhooks/*
 * Rotas protegidas (auth obrigatório): todas as outras (especialmente /streak, /ranking etc.)
 *
 * TODO (time de tech):
 *  - Descomentar os imports e ativar o middleware quando Clerk estiver configurado
 *  - Testar redirecionamentos em produção
 */

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isPublicRoute = createRouteMatcher([
//   "/login(.*)",
//   "/signup(.*)",
//   "/forgot-password(.*)",
//   "/api/webhooks(.*)",
// ]);

// export default clerkMiddleware(async (auth, req) => {
//   if (!isPublicRoute(req)) {
//     await auth.protect();
//   }
// });

// Stub enquanto Clerk não está configurado:
export default function middleware() {
  // pass through
}

export const config = {
  matcher: [
    // Match de todas as rotas, exceto assets estáticos
    "/((?!_next|.*\\..*).*)",
    // Inclui rotas de API
    "/api/(.*)",
  ],
};
