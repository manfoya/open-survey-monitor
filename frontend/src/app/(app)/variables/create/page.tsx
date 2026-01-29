import { Suspense } from "react";
import CreateVariableForm from "@/features/variables/components/create-variable-form/index";
import PageHeader from "@/components/page-header";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Variable, Plus } from "lucide-react";
import { VariableFormSkeleton } from "@/features/variables/components/variable-form-skeleton";

export default function CreateVariablePage() {
  return (
    <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
      <div className="container mx-auto py-6 max-w-2xl">
        <PageHeader
          title="Créer une nouvelle variable"
          description="Définissez une nouvelle variable de données pour vos enquêtes."
          backHref="/variables"
          backLabel="Retour aux variables"
        />

        <Suspense fallback={<VariableFormSkeleton />}>
          <CreateVariableFormAsync />
        </Suspense>
      </div>
    </RoleGuard>
  );
}

async function CreateVariableFormAsync() {
  // Simuler un délai ou charger des données si nécessaire à l'avenir
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nouvelle variable
        </CardTitle>
        <CardDescription>
          Configurez l&apos;identifiant, le libellé et le type de donnée.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateVariableForm />
      </CardContent>
    </Card>
  );
}