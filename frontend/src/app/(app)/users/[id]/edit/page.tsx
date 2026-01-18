import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";
import UpdateUserForm from "@/features/users/components/update-user-form";
import { getSubordinates, getUserById } from "@/features/users/services";
import { User } from "lucide-react";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";

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

      <Suspense fallback={<UpdateUserFormSkeleton />}>
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
      getSubordinates()
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
  const canEdit = currentUser.role === UserRole.DIRECTEUR || subordinateIds.includes(user.id);

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
  const canChangeChef = currentUser.role === UserRole.DIRECTEUR || user.chef_id !== currentUser.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {user.username}
        </CardTitle>
        <CardDescription>
          Modifiez uniquement les informations nécessaires. Les champs non modifiés conserveront leurs valeurs actuelles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateUserForm user={user} canChangeChef={canChangeChef} />
      </CardContent>
    </Card>
  );
}

function UpdateUserFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
