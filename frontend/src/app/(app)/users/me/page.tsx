import { Suspense } from "react";
import { getMe } from "@/features/auth/services/auth";
import { Card, CardContent } from "@/components/ui/card";
import { RoleGuard } from "@/features/auth/components/role-guard";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import { ProfileHeader } from "@/features/users/components/profile/header";
import { CsproWarning } from "@/features/users/components/profile/cspro-warning";
import { ProfileSkeleton } from "@/features/users/components/profile/skeleton";
import { UserDetailsInfo } from "@/features/users/components/user-details/info";

export default async function ProfilePage() {
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <PageHeader
        title="Mon profil"
        description="Consultez vos identifiants système et paramètres d'accès."
      />

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileAsync />
      </Suspense>
    </div>
  );
}

async function ProfileAsync() {
  let user;

  try {
    user = await getMe();
  } catch (error) {
    console.error("Erreur lors du chargement du profil:", error);
    return (
      <ErrorState
        title="Erreur de chargement"
        message="Impossible de charger votre profil utilisateur."
        primaryAction={{ label: "Retour aux utilisateurs", href: "/users" }}
      />
    );
  }

  if (!user) {
    return (
      <ErrorState
        title="Session expirée"
        message="Votre session a expiré. Veuillez vous reconnecter."
        primaryAction={{ label: "Se reconnecter", href: "/login" }}
        showRefresh={false}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <ProfileHeader user={user} />
        <UserDetailsInfo user={user} />
      </Card>

      <CsproWarning />
    </div>
  );
}
