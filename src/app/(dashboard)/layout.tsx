import Sidebar from "@/components/layout/sidebar";
import { GlassFilter } from "@/components/ui/glass-effect";

/**
 * Layout do grupo autenticado (dashboard).
 *
 * Estrutura:
 *  - Fundo preto com gradiente sutil (pra dar o que o liquid glass distorcer)
 *  - Sidebar fixa à esquerda (240px) com liquid glass
 *  - Conteúdo à direita com cards em liquid glass
 *
 * TODO (time de tech):
 *  - Adicionar verificação de auth no middleware.ts (Clerk)
 *  - Proteger essas rotas contra acesso não autenticado
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black">
      {/* SVG filter do liquid glass (oculto) */}
      <GlassFilter />

      {/* Gradiente sutil no fundo pra dar textura pro glass */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 198, 10, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 198, 10, 0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Sidebar fixa */}
      <Sidebar />

      {/* Conteúdo principal — responsivo: full width no mobile, com margin de sidebar no desktop */}
      <main className="relative z-10 min-h-screen lg:ml-60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-10 pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
