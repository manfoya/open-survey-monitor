import { TableColumn, ColumnVisibility } from "@/types/table";

export type { TableColumn, ColumnVisibility };

export const availableColumns: TableColumn[] = [
  {
    key: "id",
    label: "ID",
    className: "w-[80px]",
    sortable: true,
    sortKey: "id",
  },
  {
    key: "nom_zone",
    label: "Nom de la zone",
    sortable: true,
    sortKey: "nom_zone",
  },
  { key: "coordinates", label: "Coordonnées", sortable: false },
  {
    key: "rayon_tolerance_metres",
    label: "Rayon",
    sortable: true,
    sortKey: "rayon_tolerance_metres",
  },
  { key: "actions", label: "Action", className: "text-right", sortable: false },
];

export const defaultZoneColumnVisibility: ColumnVisibility = {
  id: true,
  nom_zone: true,
  coordinates: true,
  rayon_tolerance_metres: true,
  actions: true,
};
