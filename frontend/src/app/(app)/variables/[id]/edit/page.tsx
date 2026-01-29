import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";
import { getVariableById } from "@/features/variables/services";
import UpdateVariableForm from "@/features/variables/components/update-variable-form";
import { Settings2 } from "lucide-react";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import { VariableFormSkeleton } from "@/features/variables/components/variable-form-skeleton";

interface UpdateVariablePageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateVariablePage({ params }: UpdateVariablePageProps) {
  const { id } = await params;
  const variableId = Number(id);

  if (isNaN(variableId)) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <PageHeader
        title={`Modifier la variable #${variableId}`}
        description="Configuration et paramètres de la variable."
        backHref="/variables"
        backLabel="Retour aux variables"
      />

      <Suspense fallback={<VariableFormSkeleton />}>
        <UpdateVariableFormAsync variableId={variableId} />
      </Suspense>
    </div>
  );
}

async function UpdateVariableFormAsync({ variableId }: { variableId: number }) {
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

  if (!variable || !currentUser) {
    notFound();
  }

  // Vérifier les autorisations - Seul le Directeur peut modifier les variables
  const isDirector = currentUser.role === UserRole.DIRECTEUR;

  if (!isDirector) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Seuls les directeurs peuvent modifier les variables."
        primaryAction={{ label: "Retour aux variables", href: "/variables" }}
        showRefresh={false}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          {variable.label}
        </CardTitle>
        <CardDescription>
          Modifiez les paramètres de la variable. Le changement de type peut entraîner une perte de données.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateVariableForm variable={variable} />
      </CardContent>
    </Card>
  );
}
