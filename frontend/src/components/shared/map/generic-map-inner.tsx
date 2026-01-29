"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { GenericMapProps } from "./types";
import "leaflet/dist/leaflet.css";

// Petit utilitaire pour recentrer la carte quand les props changent
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function GenericMapInner({
  points = [],
  areas = [],
  center = [9.3782, 2.6388], // Par défaut : Parakou
  zoom = 13,
  height = "400px",
  enableClustering = true
}: GenericMapProps) {
  
  useEffect(() => {
    // Fix pour les icônes Leaflet dans Next.js
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const PointContent = points.map((p) => (
    <Marker key={p.id} position={[p.latitude, p.longitude]}>
      {p.popupContent && <Popup>{p.popupContent}</Popup>}
    </Marker>
  ));

  return (
    <div style={{ height }} className="w-full rounded-xl border shadow-sm overflow-hidden isolate relative z-0">
      <MapContainer center={center} zoom={zoom} className="h-full w-full">
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />

        {/* 1. Affichage des Zones */}
        {areas.map((area) => (
          <Circle
            key={area.id}
            center={[area.latitude, area.longitude]}
            radius={area.radius}
            pathOptions={{
              color: area.color || "#3b82f6",
              fillColor: area.fillColor || area.color || "#3b82f6",
              fillOpacity: 0.2
            }}
          />
        ))}

        {/* 2. Affichage des Points (avec ou sans cluster) */}
        {enableClustering ? (
          <MarkerClusterGroup chunkedLoading>{PointContent}</MarkerClusterGroup>
        ) : (
          PointContent
        )}
      </MapContainer>
    </div>
  );
}
