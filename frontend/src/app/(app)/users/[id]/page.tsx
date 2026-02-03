import { Suspense } from "react";
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";
import { getUserById, getAllSubordinates } from "@/features/users/services";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import { ShieldCheck } from "lucide-react";
import { UserDetailsHeader } from "@/features/users/components/user-details/header";
import {
  UserAffectationList,
  UserDetailsInfo,
} from "@/features/users/components/user-details/info";
import { UserDetailsSkeleton } from "@/features/users/components/user-details/skeleton";
import { CsproWarning } from "@/features/users/components/profile/cspro-warning";
import { getAffectationsById } from "@/features/affectations-zones/services";

export const metadata: Metadata = {
  title: "Détails de l'utilisateur",
  description: "Consultation et modification du profil utilisateur.",
};

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
  let affectations;

  try {
    [user, currentUser, subordinates, affectations] = await Promise.all([
      getUserById(userId),
      getMe(),
      getAllSubordinates(),
      getAffectationsById(userId),
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

  // Vérifier les permissions (normalement à faire côté serveur)
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
      {/* Affectaions: ne concerne que les agents et contrôleurs */}
      {user.role === UserRole.AGENT || user.role === UserRole.CONTROLEUR ? (
        <UserAffectationList affectations={affectations} />
      ) : null}

      {/* Message d'information pour les codes CSPro */}
      <CsproWarning />
    </div>
  );
}
