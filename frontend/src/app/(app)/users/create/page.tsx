import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/services/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreateUserForm from "@/features/users/components/create-user-form";

export default function CreateUserPage() {
  return (
    // Sécurité au niveau du rendu : Seul le directeur passe
    <RoleGuard
      allowedRoles={[UserRole.DIRECTEUR]}
      fallback={
        <div className="p-8 text-center">Accès réservé à la Direction.</div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nouvel Utilisateur
          </h1>
          <p className="text-sm text-muted-foreground">
            Enregistrez un nouvel agent ou contrôleur dans le système.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de compte</CardTitle>
            <CardDescription>
              Créez un profil et rattachez-le à un responsable si nécessaire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateUserForm />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
