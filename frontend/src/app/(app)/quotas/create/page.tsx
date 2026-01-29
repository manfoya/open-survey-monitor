import { Suspense } from "react";
import PageHeader from "@/components/page-header";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import { getAllVariables } from "@/features/variables/services";
import CreateQuotaForm from "@/features/quotas/components/create-quota-form";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/error-state";

export default function CreateQuotaPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
      <div className="container mx-auto py-6 max-w-4xl">
        <PageHeader
          title="Créer un nouveau quota"
          description="Définissez les critères de population pour vos objectifs d'enquête."
          backHref="/quotas" // Assuming quotas list exists, otherwise adjust
          backLabel="Retour aux quotas"
        />

        <Suspense fallback={<QuotaFormSkeleton />}>
          <CreateQuotaFormAsync />
        </Suspense>
      </div>
    </RoleGuard>
  );
}

async function CreateQuotaFormAsync() {
  let variables;

  try {
    // Fetch variables that can be used for quotas? 
    // Usually we just want all variables, potentially filtered by is_quota on the UI or backend
    // For now, let's fetch all and let the user pick
    variables = await getAllVariables();
  } catch (error) {
    console.error("Erreur lors du chargement des variables:", error);
    return (
      <ErrorState
        title="Erreur de chargement"
        message="Impossible de charger la liste des variables nécessaires à la configuration."
      />
    );
  }

  // Filter variables that are marked as usable for quotas?
  const quotaVariables = variables.filter(v => v.is_quota);

  if (quotaVariables.length === 0) {
     return (
        <ErrorState
            title="Aucune variable disponible"
            message="Aucune variable n'est configurée pour être utilisée dans les quotas ('is_quota'). Veuillez d'abord configurer vos variables."
            primaryAction={{ label: "Gérer les variables", href: "/variables" }}
        />
     )
  }

  return <CreateQuotaForm variables={quotaVariables} />;
}

function QuotaFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
