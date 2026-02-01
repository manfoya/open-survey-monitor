import { Suspense } from "react";
import UpdateAffectationForm from "@/features/affectations-zones/components/update-affectation-form";
import PageHeader from "@/components/page-header";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link2Icon } from "lucide-react";
import { getAffectationById } from "@/features/affectations-zones/services";
import { notFound } from "next/navigation";

interface EditAffectationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAffectationPage({
  params,
}: EditAffectationPageProps) {
  const id = Number((await params).id);

  if (isNaN(id)) {
    notFound();
  }

  const affectation = await getAffectationById(id);

  if (!affectation) {
    notFound();
  }

  return (
    <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
      <div className="container mx-auto py-6 max-w-2xl">
        <PageHeader
          title="Modifier l'affectation"
          description={`Modification de l'affectation #${affectation.id}`}
          backHref="/affectations-zones"
          backLabel="Retour aux affectations"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2Icon className="h-5 w-5" />
              Modifier l&apos;affectation
            </CardTitle>
            <CardDescription>
              Modifiez la zone, les dates ou le statut de l&apos;affectation. Le
              contrôleur ne peut pas être modifié.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Chargement du formulaire...</div>}>
              <UpdateAffectationForm affectation={affectation} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
