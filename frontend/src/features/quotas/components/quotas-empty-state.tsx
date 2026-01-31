import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";

interface QuotasEmptyStateProps {
  query?: string;
}

export function QuotasEmptyState({ query }: QuotasEmptyStateProps) {
  if (query) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Aucun résultat</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
          Aucun quota ne correspond à votre recherche "{query}".
          <br />
          Essayez d'autres termes ou effacez la recherche.
        </p>
        <Button asChild variant="outline">
          <Link href="/quotas">Effacer la recherche</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Plus className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Aucun quota</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        Vous n'avez pas encore configuré de quotas. Commencez par en créer un
        pour suivre les objectifs de collecte.
      </p>
      <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
        <Button asChild>
          <Link href="/quotas/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer un quota
          </Link>
        </Button>
      </RoleGuard>
    </div>
  );
}
