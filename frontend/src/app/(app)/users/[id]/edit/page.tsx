import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";
import UpdateUserForm from "@/features/users/components/update-user-form";
import { getSubordinates, getUserById } from "@/features/users/services";

export default async function UpdateUserPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  // Valider le paramètre id (revoir la logique si le type d'ID change)
  const userId = Number(id) || null;
  if (!userId) {
    return <div>Identifiant non valide</div>;
  }
  // Obtenir les informations de l'utilisateur via une fonction serveur
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

  // Vérifier les autorisations
  // Le directeur peut modifier tout le monde
  // Les autres peuvent modifier uniquement les utilisateurs sous leur responsabilité
  // Finalement, un user ne peut modifier son propre profil sauf le directeur
  const subordinates = await getSubordinates();
  const subordinateIds = subordinates.map((u) => u.id);

  const canEdit =
    me.role === UserRole.DIRECTEUR || subordinateIds.includes(user.id);
  // Comme un utilsateur n'est pas dans sa propre liste de subordonnés,
  // on n'a pas besoin de vérifier explicitement qu'il ne peut pas modifier son propre profil

  if (!canEdit) {
    return (
      <div>
        Accès refusé: Vous n&apos;êtes pas autorisé à modifier ce profil.
      </div>
    );
  }

  // Déterminer si l'utilisateur peut changer le chef
  // Le directeur peut toujours changer le chef
  // Je ne peux pas changer le chef d'un utilisateur dont je suis déjà le chef direct
  const canChangeChef =
    me.role === UserRole.DIRECTEUR || user.chef_id !== me.id;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Modifier un utilisateur
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifier les informations de l&apos;utilisateur et ses rattachements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de compte</CardTitle>
          <CardDescription>
            Modifiez uniquement les informations nécessaires. Les champs non
            modifiés conserveront leurs valeurs actuelles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateUserForm user={user} canChangeChef={canChangeChef} />
        </CardContent>
      </Card>
    </div>
  );
}
