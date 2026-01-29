import { ReactNode } from "react";

export interface MapPoint {
  id: string | number;
  latitude: number;
  longitude: number;
  popupContent?: ReactNode;
  iconUrl?: string; // Pour changer l'image du marqueur si besoin
}

export interface MapArea {
  id: string | number;
  latitude: number;
  longitude: number;
  radius: number;
  color?: string;
  fillColor?: string;
  label?: string;
}

export interface GenericMapProps {
  points?: MapPoint[];
  areas?: MapArea[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  enableClustering?: boolean;
}
