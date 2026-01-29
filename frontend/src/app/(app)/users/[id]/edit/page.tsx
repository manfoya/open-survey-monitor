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
import UpdateUserForm from "@/features/users/components/update-user-form";
import { getUserById, getAllSubordinates } from "@/features/users/services";
import { User } from "lucide-react";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import { UserFormSkeleton } from "@/features/users/components/user-form-skeleton";

interface UpdateUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateUserPage({ params }: UpdateUserPageProps) {
  const { id } = await params;
  const userId = Number(id);

  if (isNaN(userId)) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <PageHeader
        title={`Modifier l'utilisateur #${userId}`}
        description="Modifiez les informations du compte et ses rattachements."
        backHref="/users"
        backLabel="Retour aux utilisateurs"
      />

      <Suspense fallback={<UserFormSkeleton />}>
        <UpdateUserFormAsync userId={userId} />
      </Suspense>
    </div>
  );
}

async function UpdateUserFormAsync({ userId }: { userId: number }) {
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

  // Vérifier les autorisations - Protection au niveau serveur
  const subordinateIds = subordinates.map((u) => u.id);
  const canEdit =
    currentUser.role === UserRole.DIRECTEUR || subordinateIds.includes(user.id);

  if (!canEdit) {
    return (
      <ErrorState
        title="Accès refusé"
        message="Vous n'êtes pas autorisé à modifier ce profil."
        primaryAction={{ label: "Retour aux utilisateurs", href: "/users" }}
        showRefresh={false}
      />
    );
  }

  // Déterminer si l'utilisateur peut changer le chef
  const canChangeChef =
    currentUser.role === UserRole.DIRECTEUR || user.chef?.id !== currentUser.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {user.username}
        </CardTitle>
        <CardDescription>
          Modifiez uniquement les informations nécessaires. Les champs non
          modifiés conserveront leurs valeurs actuelles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateUserForm user={user} canChangeChef={canChangeChef} />
      </CardContent>
    </Card>
  );
}
