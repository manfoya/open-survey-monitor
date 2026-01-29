import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";
import { getUserById, getAllSubordinates } from "@/features/users/services";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import { ShieldCheck } from "lucide-react";
import { UserDetailsHeader } from "@/features/users/components/user-details/header";
import { UserDetailsInfo } from "@/features/users/components/user-details/info";
import { UserDetailsSkeleton } from "@/features/users/components/user-details/skeleton";

export default async function UserDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const userId = Number(id);

  if (isNaN(userId)) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <PageHeader
        title={`Utilisateur #${userId}`}
        description="Informations détaillées et paramètres du compte."
        backHref="/users"
        backLabel="Retour aux utilisateurs"
      />

      <Suspense fallback={<UserDetailsSkeleton />}>
        <UserDetailsAsync userId={userId} />
      </Suspense>
    </div>
  );
}

async function UserDetailsAsync({ userId }: { userId: number }) {
  let user;
  let currentUser;
  let subordinates;

  try {
    [user, currentUser, subordinates] = await Promise.all([
      getUserById(userId),
      getMe(),
      getAllSubordinates(),
    ]);
  } catch (error) {
    console.error("Erreur lors du chargement de l'utilisateur:", error);
    return (
      <ErrorState
        title="Erreur de chargement"
        message={`Impossible de charger l'utilisateur #${userId}.`}
        primaryAction={{ label: "Retour aux utilisateurs", href: "/users" }}
      />
    );
  }

  if (!user || !currentUser) {
    notFound();
  }

  // Vérifier les permissions
  const subordinateIds = subordinates.map((u) => u.id);
  const canView =
    currentUser.role === UserRole.DIRECTEUR ||
    subordinateIds.includes(user.id) ||
    user.id === currentUser.id;

  if (!canView) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'êtes pas autorisé à consulter ce profil."
        primaryAction={{ label: "Retour aux utilisateurs", href: "/users" }}
        showRefresh={false}
      />
    );
  }

  const canEdit =
    currentUser.role === UserRole.DIRECTEUR || subordinateIds.includes(user.id);
  const canDelete =
    currentUser.role === UserRole.DIRECTEUR &&
    user.role !== UserRole.DIRECTEUR &&
    user.id !== currentUser.id;

  return (
    <div className="space-y-6">
      {/* Carte principale avec informations */}
      <Card className="overflow-hidden">
        <UserDetailsHeader
          user={user}
          canEdit={canEdit}
          canDelete={canDelete}
        />
        <UserDetailsInfo user={user} />
      </Card>

      {/* Message d'information pour les codes CSPro */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 rounded-lg flex gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          Le <strong>Code CSPro</strong> est requis pour la synchronisation des
          données terrain. Il doit être unique dans le système.
        </p>
      </div>
    </div>
  );
}

