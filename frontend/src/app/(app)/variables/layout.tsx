import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import ErrorState from "@/components/error-state";

export default function VariablesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.DIRECTEUR]}
      fallback={
        <div className="container mx-auto py-6 max-w-4xl">
          <ErrorState
            title="Accès refusé"
            message="Seuls les directeurs peuvent gérer les variables."
            primaryAction={{ label: "Retour à l'accueil", href: "/overview" }}
            showRefresh={false}
          />
        </div>
      }
    >
      {children}
    </RoleGuard>
  );
}
