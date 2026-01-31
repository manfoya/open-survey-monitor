import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import AppSideBar from "@/features/app-shell/components/app-sidebar";
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumb";
import { getAccessToken, getMe } from "@/features/auth/services/auth";
import { UserProvider } from "@/features/auth/contexts/user-context";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- GUARD CLÔTURE (Sécurité) ---
  const token = await getAccessToken();

  // Si pas de token, on redirige vers le login (en plus du middleware par sécurité)
  if (!token) {
    redirect("/login");
  }

  // Récupérer les données utilisateur pour le contexte
  const currentUser = await getMe();

  return (
    <UserProvider currentUser={currentUser}>
      <SidebarProvider>
        {/* La Sidebar */}
        <AppSideBar />

        <SidebarInset>
          {/* HEADER GLOBAL */}
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />

              {/* Navigation contextuelle dynamique (Fil d'Ariane) */}
              <DynamicBreadcrumbs />
            </div>

            {/* ACTIONS GLOBALES (Droite) */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {/* Futur composant : UserAccountNav (Avatar + Mini menu) */}
              <div className="h-8 w-8 rounded-full bg-primary/10 border flex items-center justify-center text-xs font-bold">
                {currentUser
                  ? currentUser.username.charAt(0).toUpperCase()
                  : "?"}
              </div>
            </div>
          </header>

          {/* CONTENU DE LA PAGE */}
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 bg-muted/20">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
