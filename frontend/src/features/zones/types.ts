export interface Zone {
  id: number;
  nom_zone: string;
  latitude_centrale: number;
  longitude_centrale: number;
  rayon_tolerance_metres: number;
}

export type CreateZoneData = Omit<Zone, "id">;

export type UpdateZoneData = Partial<CreateZoneData>;