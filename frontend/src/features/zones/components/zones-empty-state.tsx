import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import { MapPin } from "lucide-react";
import Link from "next/link";

interface ZonesEmptyStateProps {
  query?: string;
}

export function ZonesEmptyState({ query }: ZonesEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {query
          ? `Aucune zone trouvée pour "${query}"`
          : "Aucune zone configurée"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {query
          ? "Essayez de modifier votre recherche."
          : "Commencez par créer votre première zone géographique."}
      </p>
      <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
        <Button asChild>
          <Link href="/zones/create">
            <MapPin className="mr-2 h-4 w-4" />
            Créer une zone
          </Link>
        </Button>
      </RoleGuard>
    </div>
  );
}
