import { Suspense } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";
import { getUserById, getUsers } from "@/features/users/services";
import { User, ShieldCheck, Hash, Fingerprint, Edit } from "lucide-react";
import Link from "next/link";
import DeleteUserForm from "@/features/users/components/delete-user-form";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";
import { RoleGuard } from "@/features/auth/components/role-guard";

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
      getUsers(),
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

  // Trouver le chef
  const chef = user.chef_id
    ? subordinates.find((u) => u.id === user.chef_id)
    : null;

  return (
    <div className="space-y-6">
      {/* Carte principale avec informations */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{user.username}</CardTitle>
                <Badge variant="outline" className="mt-1 capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>

            {/* Boutons d'actions - Protégés par RoleGuard */}
            <div className="flex items-center gap-2">
              <RoleGuard
                allowedRoles={
                  canEdit
                    ? [
                        UserRole.DIRECTEUR,
                        UserRole.SUPERVISEUR,
                        UserRole.CONTROLEUR,
                      ]
                    : []
                }
              >
                <Button asChild variant="outline" size="sm">
                  <Link href={`/users/${user.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Link>
                </Button>
              </RoleGuard>

              <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
                {canDelete && (
                  <DeleteUserForm
                    userId={user.id}
                    buttonClassName="flex items-center text-destructive bg-destructive/10 hover:bg-destructive/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    buttonText="Supprimer"
                    redirectOnSuccess={true}
                  />
                )}
              </RoleGuard>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y text-sm">
            {/* Code CSPro */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span>Code CSPro</span>
              </div>
              <span className="font-mono font-bold text-primary">
                {user.cspro_code || "N/A"}
              </span>
            </div>

            {/* ID Interne */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Fingerprint className="h-4 w-4" />
                <span>ID Interne</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {user.id}
              </span>
            </div>

            {/* Chef hiérarchique */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Responsable hiérarchique</span>
              </div>
              <div className="text-right">
                {chef ? (
                  <div>
                    <div className="font-medium">{chef.username}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {chef.role}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Aucun</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
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

function UserDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg border">
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
