"use client";

import dynamic from "next/dynamic";
import { Zone } from "@/features/zones/types";
import { useMemo } from "react";

interface ZoneMapProps {
  zone: Zone;
  height?: string; // Optionnel ici
  showPopup?: boolean;
}

export default function ZoneMap({
  zone,
  height = "400px", // Valeur par défaut définie ici
  showPopup = true, // Valeur par défaut définie ici
}: ZoneMapProps) {
  const Map = useMemo(
    () =>
      dynamic(() => import("./zone-map-inner"), {
        loading: () => (
          <div
            style={{ height }}
            className="bg-slate-100 animate-pulse rounded-lg flex items-center justify-center border"
          >
            <p className="text-sm text-muted-foreground">
              Chargement de la carte...
            </p>
          </div>
        ),
        ssr: false,
      }),
    [height],
  );

  // On passe les variables qui sont maintenant garanties d'être des strings/booleans
  return <Map zone={zone} height={height} showPopup={showPopup} />;
}
