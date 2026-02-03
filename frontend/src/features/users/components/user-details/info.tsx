import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/features/auth/types";
import { Calendar, Fingerprint, Hash, MapPin, ShieldCheck } from "lucide-react";
import { Affectation } from "@/features/affectations-zones/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

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

export function UserAffectationList({
  affectations,
}: {
  affectations?: Affectation[];
}) {
  if (!affectations) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Affectation(s) aux Zones
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {affectations.length > 0 ? (
          <div className="divide-y">
            {affectations.map((affectation) => (
              <Link
                key={affectation.id}
                href={`/zones/${affectation.zone_id}`}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base group-hover:text-primary transition-colors">
                      {affectation.nom_zone}
                    </span>
                    <Badge
                      variant={affectation.est_actif ? "default" : "secondary"}
                      className="text-[10px] px-1.5 py-0 uppercase"
                    >
                      {affectation.est_actif ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {affectation.date_debut
                        ? format(
                            new Date(affectation.date_debut),
                            "dd MMM yyyy",
                            {
                              locale: fr,
                            },
                          )
                        : "Indéfinie"}
                      {" - "}
                      {affectation.date_fin
                        ? format(
                            new Date(affectation.date_fin),
                            "dd MMM yyyy",
                            {
                              locale: fr,
                            },
                          )
                        : "En cours"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Aucune zone assignée</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
