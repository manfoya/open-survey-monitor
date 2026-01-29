import { Suspense } from "react";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import CreateUserForm from "@/features/users/components/create-user-form";
import PageHeader from "@/components/page-header";
import { UserFormSkeleton } from "@/features/users/components/user-form-skeleton";

export default function CreateUserPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
      <div className="container mx-auto py-6 max-w-2xl">
        <PageHeader
          title="Créer un nouveau compte"
          description="Ajoutez un nouveau membre à l'équipe de collecte."
          backHref="/users"
          backLabel="Retour aux utilisateurs"
        />

        <Suspense fallback={<UserFormSkeleton />}>
          <CreateUserFormAsync />
        </Suspense>
      </div>
    </RoleGuard>
  );
}

async function CreateUserFormAsync() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Nouveau compte utilisateur
        </CardTitle>
        <CardDescription>
          Configurez le nom d&apos;utilisateur, le rôle et les paramètres
          d&apos;accès.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateUserForm />
      </CardContent>
    </Card>
  );
}
