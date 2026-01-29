export interface TableColumn {
  key: string;
  label: string;
  className?: string;
  required?: boolean; // Colonnes qui ne peuvent pas être cachées
  sortable?: boolean; // Colonnes qui peuvent être triées
  sortKey?: string; // Clé de tri pour l'API (si différente de key)
}

export interface ColumnVisibility {
  [key: string]: boolean;
}
