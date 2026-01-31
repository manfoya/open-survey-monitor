import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import ErrorState from "@/components/error-state";

export default function QuotasLayout({
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
            message="Seuls un directeur peut gérer les quotas."
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
