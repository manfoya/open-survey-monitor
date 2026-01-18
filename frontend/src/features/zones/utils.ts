/**
 * Utilitaires pour les zones géographiques
 */

/**
 * Formate une coordonnée géographique avec indication de direction
 * @param value - Valeur de la coordonnée
 * @param type - Type de coordonnée ('lat' pour latitude, 'lng' pour longitude)
 * @returns Coordonnée formatée avec direction (ex: "48.856600° N")
 */
export function formatCoordinate(value: number, type: "lat" | "lng"): string {
  const direction =
    type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(6)}° ${direction}`;
}

/**
 * Formate un rayon de tolérance en unité appropriée
 * @param radius - Rayon en mètres
 * @returns Rayon formaté (ex: "1.5 km" ou "500 m")
 */
export function formatRadius(radius: number): string {
  if (radius >= 1000) {
    return `${(radius / 1000).toFixed(1)} km`;
  }
  return `${radius} m`;
}

/**
 * Calcule l'aire approximative d'une zone circulaire
 * @param radiusInMeters - Rayon en mètres
 * @returns Aire en km² arrondie à 2 décimales
 */
export function calculateZoneArea(radiusInMeters: number): number {
  const radiusInKm = radiusInMeters / 1000;
  return Math.round(Math.PI * Math.pow(radiusInKm, 2) * 100) / 100;
}

/**
 * Détermine le niveau de zoom approprié pour une carte selon le rayon
 * @param radius - Rayon de la zone en mètres
 * @returns Niveau de zoom pour Leaflet
 */
export function getOptimalZoomLevel(radius: number): number {
  if (radius <= 100) return 17;
  if (radius <= 500) return 15;
  if (radius <= 5000) return 12;
  return 10;
}
