"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { GenericMapProps, MapPoint } from "./types";
import "leaflet/dist/leaflet.css";

// Petit utilitaire pour recentrer la carte quand les props changent
function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
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
  enableClustering = true,
}: GenericMapProps) {
  useEffect(() => {
    // Fix pour les icônes Leaflet dans Next.js
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const getIcon = (p: MapPoint) => {
    if (p.iconHtml) {
      return L.divIcon({
        className: "custom-div-icon",
        html: p.iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
    }

    if (p.iconUrl) {
      return L.icon({
        iconUrl: p.iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    }

    if (p.color) {
      return L.divIcon({
        className: "custom-div-icon",
        html: `<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.59645 0 0 5.59645 0 12.5C0 21.875 12.5 41 12.5 41C12.5 41 25 21.875 25 12.5C25 5.59645 19.4036 0 12.5 0ZM12.5 17C10.0147 17 8 14.9853 8 12.5C8 10.0147 10.0147 8 12.5 8C14.9853 8 17 10.0147 17 12.5C17 14.9853 14.9853 17 12.5 17Z" fill="${p.color}"/></svg>`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    }

    return new L.Icon.Default();
  };

  const PointContent = points.map((p) => (
    <Marker key={p.id} position={[p.latitude, p.longitude]} icon={getIcon(p)}>
      {p.popupContent && <Popup>{p.popupContent}</Popup>}
    </Marker>
  ));

  return (
    <div
      style={{ height }}
      className="w-full rounded-xl border shadow-sm overflow-hidden isolate relative z-0"
    >
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
              fillOpacity: 0.2,
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
