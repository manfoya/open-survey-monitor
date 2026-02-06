"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { MapPoint } from "@/components/shared/map/types";
import { SurveyPoint } from "../types";
import { SurveyMapPopup } from "./map-popup";

const GenericMap = dynamic(
  () => import("@/components/shared/map/generic-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-muted animate-pulse rounded-md" />
    ),
  },
);

const getValidationColor = (isValid: boolean) => {
  return isValid ? "#22c55e" : "#ef4444";
};

const getValidationIcon = (isValid: boolean) => {
  const color = getValidationColor(isValid);
  const iconPath = isValid
    ? "M20 6L9 17L4 12" // Check
    : "M18 6L6 18M6 6l12 12"; // X

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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="${iconPath}"/>
      </svg>
    </div>
  `;
};

export function OverviewMap({ points }: { points: SurveyPoint[] }) {
  const mapPoints: MapPoint[] = points.map((point) => ({
    id: point.id,
    latitude: point.latitude,
    longitude: point.longitude,
    iconHtml: getValidationIcon(point.is_valid),
    popupContent: <SurveyMapPopup point={point} />,
  }));
  const center = points.reduce(
    (acc, point) => {
      acc[0] += point.latitude;
      acc[1] += point.longitude;
      return acc;
    },
    [0, 0] as [number, number],
  );
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
            zoom={10}
            enableClustering={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
