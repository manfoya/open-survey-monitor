"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Zone } from "@/features/zones/types";

// On importe le CSS ici ou dans le layout global
import "leaflet/dist/leaflet.css";

interface ZoneMapInnerProps {
  zone: Zone;
  height: string;
  showPopup: boolean;
}

export default function ZoneMapInner({ zone, height, showPopup }: ZoneMapInnerProps) {
  useEffect(() => {
    // Correction des icônes Leaflet (spécifique au client)
    // Utilisation de CDN ou assets locaux
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  const center: [number, number] = [zone.latitude_centrale, zone.longitude_centrale];

  const getZoomLevel = (radius: number) => {
    if (radius <= 100) return 17;
    if (radius <= 500) return 15;
    if (radius <= 5000) return 12;
    return 10;
  };

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border w-full">
      <MapContainer
        center={center}
        zoom={getZoomLevel(zone.rayon_tolerance_metres)}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={center}
          radius={zone.rayon_tolerance_metres}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }}
        />
        <Marker position={center}>
          {showPopup && (
            <Popup>
               <div className="text-sm p-1">
                <p className="font-bold">{zone.nom_zone}</p>
                <p className="text-xs">Rayon: {zone.rayon_tolerance_metres}m</p>
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
}