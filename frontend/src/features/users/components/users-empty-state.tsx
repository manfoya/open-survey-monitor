import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import { UserPlus } from "lucide-react";
import Link from "next/link";

interface UsersEmptyStateProps {
  query?: string;
}

export function UsersEmptyState({ query }: UsersEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {query
          ? `Aucun utilisateur trouvé pour "${query}"`
          : "Aucun utilisateur sous votre responsabilité"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {query
          ? "Essayez de modifier votre recherche."
          : "Vous n'avez aucun utilisateur dans votre équipe pour le moment."}
      </p>
      <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
        <Button asChild>
          <Link href="/users/create">
            <UserPlus className="mr-2 h-4 w-4" />
            Créer un compte
          </Link>
        </Button>
      </RoleGuard>
    </div>
  );
}
