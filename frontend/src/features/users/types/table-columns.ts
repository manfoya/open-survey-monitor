// Types pour les colonnes personnalisables
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

// Configuration des colonnes disponibles
export const availableColumns: TableColumn[] = [
  { key: 'id', label: 'ID', width: 'w-[100px]', required: true, sortable: true, sortKey: 'id' },
  { key: 'username', label: 'Utilisateur', required: true, sortable: true, sortKey: 'username' },
  { key: 'role', label: 'Rôle', sortable: true, sortKey: 'role' },
  { key: 'cspro_code', label: 'Code CSPro', sortable: true, sortKey: 'cspro_code' },
  { key: 'chef', label: 'Chef', sortable: true, sortKey: 'id'},
  { key: 'actions', label: 'Actions', width: 'text-right', required: true },
];

// Configuration par défaut des colonnes visibles
export const defaultUserColumnVisibility: ColumnVisibility = {
  id: true,
  username: true,
  role: true,
  cspro_code: true,
  chef: false, // Masquée par défaut
  actions: true,
};