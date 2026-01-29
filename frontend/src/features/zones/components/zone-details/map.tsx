import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zone } from "@/features/zones/types";
import ZoneMap from "@/features/zones/components/zone-map";
import { Maximize2 } from "lucide-react";
import Link from "next/link";

interface ZoneDetailsMapProps {
  zone: Zone;
}

export function ZoneDetailsMap({ zone }: ZoneDetailsMapProps) {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            Localisation
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link href={`/zones/${zone.id}/map`}>
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Voir la carte en grand</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ZoneMap zone={zone} height="70vh" />
      </CardContent>
    </Card>
  );
}
