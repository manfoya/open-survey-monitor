"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { MapPoint } from "@/components/shared/map/types";
import { SurveyPoint, SurveyStatus } from "../types";

const GenericMap = dynamic(
  () => import("@/components/shared/map/generic-map"),
  { 
    ssr: false, 
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-md" /> 
  }
);

const getStatusColor = (status: SurveyStatus) => {
  switch (status) {
    case "complet":
      return "#22c55e";
    case "partiel":
      return "#fc8d5aff"; // Darker yellow (Yellow-700ish)
    case "refus":
      return "#ef4444";
    default:
      return "#3b82f6";
  }
};

const getStatusIcon = (status: SurveyStatus) => {
  const color = getStatusColor(status);
  let iconPath = "";
  
  switch (status) {
    case "complet":
      iconPath = "M20 6L9 17L4 12"; // Check
      break;
    case "refus":
      iconPath = "M18 6L6 18M6 6l12 12"; // X
      break;
    case "partiel":
      iconPath = "M12 9v4m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z"; // Alert/Info circleish
      break;
    default:
      iconPath = "M12 21a9 9 0 100-18 9 9 0 000 18z";
  }

  const svgContent = status === "partiel" 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="10"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${iconPath}"/></svg>`;

  return `
    <div style="
      background-color: ${color}; 
      width: 32px; 
      height: 32px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    ">
      ${svgContent}
    </div>
  `;
};


export function OverviewMap({points}: {points: SurveyPoint[]}) {
    const mapPoints: MapPoint[] = points.map((point) => ({
        id: point.id,
        latitude: point.latitude,
        longitude: point.longitude,
        iconHtml: getStatusIcon(point.status),
        popupContent: (
            <div className="p-1">
                <div className="font-bold">Enquête {point.id}</div>
                <div className="text-xs text-muted-foreground">{point.status}</div>
            </div>
        ),
    }));
    const center = points.reduce((acc, point) => {
        acc[0] += point.latitude;
        acc[1] += point.longitude;
        return acc;
    }, [0, 0] as [number, number]);
    if (points.length > 0) {
        center[0] /= points.length;
        center[1] /= points.length;
    }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Répartition géographique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <GenericMap
            points={mapPoints}
            height="70vh"
            center={center}
            zoom={20}
            enableClustering={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
