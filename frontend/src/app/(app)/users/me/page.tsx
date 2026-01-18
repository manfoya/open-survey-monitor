import { Suspense } from "react";
import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, ShieldCheck, Hash, Fingerprint, Pencil } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";
import PageHeader from "@/components/page-header";
import ErrorState from "@/components/error-state";

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

            {/* Bouton d'édition pour les directeurs uniquement */}
            <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
              <Button asChild variant="outline" size="sm">
                <Link href={`/users/${user.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </Button>
            </RoleGuard>
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
          </div>
        </CardContent>
      </Card>

      {/* Message d'information pour les codes CSPro */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 rounded-lg flex gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          Votre <strong>Code CSPro</strong> est requis pour la synchronisation
          des données sur tablette. Si ce code ne correspond pas à votre
          matériel, contactez votre supérieur.
        </p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
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
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="p-4 rounded-lg border">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
