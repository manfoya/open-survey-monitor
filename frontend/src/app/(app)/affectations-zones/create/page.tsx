import { Suspense } from "react";
import CreateAffectationForm from "@/features/affectations-zones/components/create-affectation-form";
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

export default function CreateAffectationPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
      <div className="container mx-auto py-6 max-w-2xl">
        <PageHeader
          title="Nouvelle Affectation"
          description="Affecter un Contrôleur à une Zone."
          backHref="/affectations-zones"
          backLabel="Retour aux affectations"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2Icon className="h-5 w-5" />
              Créer une affectation
            </CardTitle>
            <CardDescription>
              Sélectionnez un contrôleur et une zone pour créer une liaison.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Chargement du formulaire...</div>}>
              <CreateAffectationForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
