import { Badge } from "@/components/ui/badge";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zone } from "@/features/zones/types";
import { MapPin } from "lucide-react";

interface ZoneDetailsHeaderProps {
  zone: Zone;
}

export function ZoneDetailsHeader({ zone }: ZoneDetailsHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <CardTitle>{zone.nom_zone}</CardTitle>
        </div>
        <Badge variant="outline" className="font-mono">
          #{zone.id}
        </Badge>
      </div>
      <CardDescription>
        Zone géographique configurée pour la collecte de données
      </CardDescription>
    </CardHeader>
  );
}
