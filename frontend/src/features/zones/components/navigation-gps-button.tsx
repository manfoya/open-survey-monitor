"use client";

import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Zone } from "@/features/zones/types";
import { toast } from "sonner";

interface NavigationGPSButtonProps {
  zone: Zone;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  className?: string;
}

export default function NavigationGPSButton({ 
  zone, 
  size = "sm", 
  variant = "outline",
  className = ""
}: NavigationGPSButtonProps) {
  
  const openNavigation = () => {
    const { latitude_centrale: lat, longitude_centrale: lng, nom_zone } = zone;
    
    // Détection de l'appareil et du système d'exploitation
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    
    let navigationUrl: string;
    
    if (isIOS) {
      // iOS : Apple Plans ou Google Maps
      navigationUrl = `http://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(nom_zone)}`;
    } else if (isAndroid) {
      // Android : Google Maps
      navigationUrl = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(nom_zone)})`;
    } else {
      // Desktop : Google Maps dans le navigateur
      navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(nom_zone)}`;
    }
    
    try {
      if (isMobile) {
        // Sur mobile, essayer d'ouvrir l'app native
        window.location.href = navigationUrl;
      } else {
        // Sur desktop, ouvrir dans un nouvel onglet
        window.open(navigationUrl, '_blank', 'noopener,noreferrer');
      }
      
      toast.success("Application de navigation ouverte");
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la navigation:", error);
      
      // Fallback : copier les coordonnées dans le presse-papier
      const coordinates = `${lat}, ${lng}`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(coordinates).then(() => {
          toast.success(`Coordonnées copiées : ${coordinates}`);
        }).catch(() => {
          toast.error("Impossible d'ouvrir la navigation");
        });
      } else {
        toast.info(`Coordonnées : ${coordinates}`);
      }
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={openNavigation}
      className={className}
    >
      <Navigation className="mr-2 h-4 w-4" />
      Navigation GPS
    </Button>
  );
}