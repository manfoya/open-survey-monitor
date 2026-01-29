import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserProfile, UserRole } from "@/features/auth/types";
import { Pencil, User } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  user: UserProfile;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
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
  );
}
