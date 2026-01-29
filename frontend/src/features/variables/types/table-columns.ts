// Types pour les colonnes personnalisables des variables
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  required?: boolean; // Colonnes qui ne peuvent pas être cachées
  sortable?: boolean; // Colonnes qui peuvent être triées
  sortKey?: string; // Clé de tri pour l'API (si différente de key)
}

export interface ColumnVisibility {
  [key: string]: boolean;
}

// Configuration des colonnes disponibles pour les variables
export const availableColumns: TableColumn[] = [
  { key: 'id', label: 'ID', width: 'w-[80px]', required: true, sortable: true, sortKey: 'id' },
  { key: 'label', label: 'Libellé', required: true, sortable: true, sortKey: 'label' },
  { key: 'slug', label: 'Identifiant', sortable: true, sortKey: 'slug' },
  { key: 'data_type', label: 'Type', sortable: true, sortKey: 'data_type' },
  { key: 'is_quota', label: 'Quota', sortable: true, sortKey: 'is_quota' },
  { key: 'created_at', label: 'Créé le', sortable: true, sortKey: 'created_at' },
  { key: 'actions', label: 'Actions', width: 'text-right', required: true, sortable: false },
];

// Configuration par défaut des colonnes visibles
export const defaultVariableColumnVisibility: ColumnVisibility = {
  id: true,
  label: true,
  slug: true,
  data_type: true,
  is_quota: true,
  created_at: false, // Masquée par défaut
  actions: true,
};