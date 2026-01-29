import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole, UserProfile } from "@/features/auth/types";
import DeleteUserForm from "@/features/users/components/delete-user-form";
import { User as UserIcon, Edit } from "lucide-react";
import Link from "next/link";

interface UserDetailsHeaderProps {
  user: UserProfile;
  canEdit: boolean;
  canDelete: boolean;
}

export function UserDetailsHeader({
  user,
  canEdit,
  canDelete,
}: UserDetailsHeaderProps) {
  return (
    <CardHeader className="bg-muted/30 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">{user.username}</CardTitle>
            <Badge variant="outline" className="mt-1 capitalize">
              {user.role}
            </Badge>
          </div>
        </div>

        {/* Boutons d'actions - Protégés par RoleGuard + props calculées */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <RoleGuard
              allowedRoles={[
                UserRole.DIRECTEUR,
                UserRole.SUPERVISEUR,
                UserRole.CONTROLEUR,
              ]}
            >
              <Button asChild variant="outline" size="sm">
                <Link href={`/users/${user.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </Button>
            </RoleGuard>
          )}

          {canDelete && (
            <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
              <DeleteUserForm
                userId={user.id}
                buttonClassName="flex items-center text-destructive bg-destructive/10 hover:bg-destructive/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                buttonText="Supprimer"
                redirectOnSuccess={true}
              />
            </RoleGuard>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
