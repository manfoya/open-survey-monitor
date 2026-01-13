import { Suspense } from "react";
import { getUsers } from "@/features/users/services";
import { UsersDataTable } from "@/features/users/components/users-data-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

// Titre et bouton d'action
function PageHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">
          Consultez et recherchez les membres de l'équipe de collecte.
        </p>
      </div>
      <Button asChild>
        <Link href="/users/create">
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau Compte
        </Link>
      </Button>
    </div>
  );
}

export default async function UsersPage() {
  // Récupération Server-Side (rapide et sécurisé)
  // Note: Assure-toi que getUsers() gère le cas où l'API est down
  const users = await getUsers().catch(() => []);

  return (
    <div className="container mx-auto py-6">
      <PageHeader />
      
      <Suspense fallback={<UsersTableSkeleton />}>
        {users.length > 0 ? <UsersDataTable initialUsers={users} /> : <div>Vous n&apos;avez aucun utilisateur sous votre tutelle.</div>}
      </Suspense>
    </div>
  );
}

// Un petit squelette de chargement pour l'élégance
function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}