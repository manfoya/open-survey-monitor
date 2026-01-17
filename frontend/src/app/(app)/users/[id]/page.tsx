import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";
import { getSubordinates, getUserById } from "@/features/users/services";
import { User, ShieldCheck, Hash, Fingerprint, Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DeleteUserForm from "@/features/users/components/delete-user-form";

export default async function UserDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  // Valider le paramètre id
  const userId = Number(id) || null;
  if (!userId) {
    return <div>Identifiant non valide</div>;
  }

  // Obtenir les informations de l'utilisateur
  const user = await getUserById(userId);
  if (!user) {
    return (
      <div>
        L&apos;utilisateur n&apos;existe pas ou ne fait peut-être pas partie de
        votre équipe
      </div>
    );
  }

  // Obtenir les infos de l'utilisateur actuel (connecté)
  const me = await getMe();
  if (!me) {
    return (
      <div>Vous n&apos;êtes pas connecté. Déconnectez et reconnectez-vous.</div>
    );
  }

  // Pour la page de détails, on est plus permissif que pour l'édition
  // On permet la consultation si c'est dans l'équipe ou si c'est un directeur
  const subordinates = await getSubordinates();
  const subordinateIds = subordinates.map((u) => u.id);
  
  const canView = 
    me.role === UserRole.DIRECTEUR || 
    subordinateIds.includes(user.id) ||
    user.id === me.id; // Permet de voir son propre profil

  if (!canView) {
    return (
      <div>
        Accès refusé: Vous n&apos;êtes pas autorisé à consulter ce profil.
      </div>
    );
  }

  // Déterminer si on peut éditer (même logique que la page edit mais pour le bouton)
  const canEdit = me.role === UserRole.DIRECTEUR || subordinateIds.includes(user.id);

  // Déterminer si on peut supprimer (seuls les directeurs, et pas un autre directeur)
  const canDelete = 
    me.role === UserRole.DIRECTEUR && 
    user.role !== UserRole.DIRECTEUR &&
    user.id !== me.id; // Ne peut pas se supprimer soi-même

  // Trouver le nom du chef
  const chef = user.chef_id ? subordinates.find(u => u.id === user.chef_id) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/users">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Profil utilisateur
            </h1>
            <p className="text-sm text-muted-foreground">
              Consultez les informations de l&apos;utilisateur.
            </p>
          </div>
        </div>

        {/* Boutons d'actions */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </Button>
          )}
          
          {canDelete && (
            <DeleteUserForm
              userId={user.id}
              userName={user.username}
              buttonClassName="flex items-center text-destructive bg-destructive/10 hover:bg-destructive/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              buttonText="Supprimer"
              redirectOnSuccess={true}
            />
          )}
        </div>
      </div>

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
          Le <strong>Code CSPro</strong> est requis pour la synchronisation
          des données terrain. Il doit être unique dans le système.
        </p>
      </div>
    </div>
  );
}
