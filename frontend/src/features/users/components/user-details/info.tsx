import { CardContent } from "@/components/ui/card";
import { UserProfile } from "@/features/auth/types";
import { Fingerprint, Hash, ShieldCheck } from "lucide-react";

interface UserDetailsInfoProps {
  user: UserProfile;
}

export function UserDetailsInfo({ user }: UserDetailsInfoProps) {
  return (
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
            {user.chef ? (
              <div>
                <div className="font-medium">{user.chef.username}</div>
              </div>
            ) : (
              <span className="text-muted-foreground">Aucun</span>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  );
}
