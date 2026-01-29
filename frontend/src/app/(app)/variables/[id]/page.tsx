import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";
import { getVariableById } from "@/features/variables/services";
import { Settings2 } from "lucide-react";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import VariableConfigurationViewer from "@/features/variables/components/variable-details/configuration-viewer";
import VariableDetailsSkeleton from "@/features/variables/components/variable-details/skeleton";
import VariableHeader from "@/features/variables/components/variable-details/header";
import VariableExcludedOperators from "@/features/variables/components/variable-details/excluded-operators";
import VariableJsonDebug from "@/features/variables/components/variable-details/json-debug";

interface VariableDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function VariableDetailsPage({
  params,
}: VariableDetailsPageProps) {
  const { id } = await params;
  const variableId = Number(id);

  if (isNaN(variableId)) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <PageHeader
        title={`Variable #${variableId}`}
        description="Détails et configuration de la variable."
        backHref="/variables"
        backLabel="Retour aux variables"
      />

      <Suspense fallback={<VariableDetailsSkeleton />}>
        <VariableDetailsAsync variableId={variableId} />
      </Suspense>
    </div>
  );
}

async function VariableDetailsAsync({ variableId }: { variableId: number }) {
  let variable;
  let currentUser;

  try {
    [variable, currentUser] = await Promise.all([
      getVariableById(variableId),
      getMe(),
    ]);
  } catch (error) {
    console.error("Erreur lors du chargement de la variable:", error);
    return (
      <ErrorState
        title="Erreur de chargement"
        message={`Impossible de charger la variable #${variableId}.`}
        primaryAction={{ label: "Retour aux variables", href: "/variables" }}
      />
    );
  }

  if (!variable) {
    notFound();
  }

  const canEdit = currentUser?.role === UserRole.DIRECTEUR;

  return (
    <div className="space-y-6">
      {/* En-tête de la variable */}
      <VariableHeader variable={variable} canEdit={canEdit} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche : Configuration */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Paramètres spécifiques au type de donnée.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariableConfigurationViewer variable={variable} />
            </CardContent>
          </Card>
        </div>

        {/* Colonne Droite : Méta & Avancé */}
        <div>
          <VariableExcludedOperators variable={variable} className="h-full" />
        </div>
      </div>

      {/* Section Debug / Technique en bas de page */}
      <VariableJsonDebug variable={variable} />
    </div>
  );
}
