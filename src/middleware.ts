import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Middleware — Clerk em modo passthrough.
 *
 * MODO ATUAL: Todas as rotas acessíveis sem login (modo demo/dev).
 * Quando quiser ativar proteção real, descomentar o `createRouteMatcher`
 * e o `auth.protect()` abaixo.
 */
export default clerkMiddleware();

// --- Para ativar proteção no futuro:
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
//
// const isPublicRoute = createRouteMatcher([
//   "/login(.*)",
//   "/signup(.*)",
//   "/forgot-password(.*)",
//   "/sso-callback(.*)",
//   "/api/webhooks(.*)",
// ]);
//
// export default clerkMiddleware(async (auth, req) => {
//   if (!isPublicRoute(req)) {
//     await auth.protect();
//   }
// });

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
