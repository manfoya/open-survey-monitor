import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";

interface VariablesEmptyStateProps {
  query?: string;
}

export function VariablesEmptyState({ query }: VariablesEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Plus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {query
          ? `Aucune variable trouvée pour "${query}"`
          : "Aucune variable configurée"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {query
          ? "Essayez de modifier votre recherche."
          : "Commencez par définir votre première variable de données."}
      </p>
      <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
        <Button asChild>
          <Link href="/variables/create">
            <Plus className="mr-2 h-4 w-4" />
            Créer une variable
          </Link>
        </Button>
      </RoleGuard>
    </div>
  );
}
