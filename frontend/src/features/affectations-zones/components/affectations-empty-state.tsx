import { FileIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";

export function AffectationsEmptyState({ query }: { query: string }) {
  if (query) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <FileIcon className="h-10 w-10 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-semibold">Aucun résultat</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Aucune affectation ne correspond à &quot;{query}&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <FileIcon className="h-10 w-10 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-semibold">Aucune affectation</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Aucune affectation n&apos;a encore été créée. Commencez par en ajouter
          une.
        </p>
        <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
          <Button asChild>
            <Link href="/affectations-zones/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer une affectation
            </Link>
          </Button>
        </RoleGuard>
      </div>
    </div>
  );
}
