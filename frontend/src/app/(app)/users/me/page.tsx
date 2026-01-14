import { getMe, UserRole } from "@/features/auth/services/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Assure-toi d'avoir le bouton
import { User, ShieldCheck, Hash, Fingerprint, Pencil } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/features/auth/components/role-guard";

export default async function ProfilePage() {
  const user = await getMe();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-sm text-muted-foreground">
            Identifiants système et accès terrain.
          </p>
        </div>

        {/* Bouton d'édition pointant vers ta route dynamique [id] */}
        <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/users/${user.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
          </Button>
        </RoleGuard>
      </div>

      <div className="grid gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{user.username}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-sm">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>Code CSPro</span>
                </div>
                <span className="font-bold text-primary">
                  {user.cspro_code || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Fingerprint className="h-4 w-4" />
                  <span>ID Interne</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {user.id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 rounded-lg flex gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            Votre <strong>Code CSPro</strong> est requis pour la synchronisation
            des données sur tablette. Si ce code ne correspond pas à votre
            matériel, contactez votre supérieur.
          </p>
        </div>
      </div>
    </div>
  );
}
