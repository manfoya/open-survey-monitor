// Types pour les colonnes personnalisables
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  required?: boolean; // Colonnes qui ne peuvent pas être cachées
}

export interface ColumnVisibility {
  [key: string]: boolean;
}

// Configuration des colonnes disponibles
export const availableColumns: TableColumn[] = [
  { key: 'id', label: 'ID', width: 'w-[100px]', required: true },
  { key: 'username', label: 'Utilisateur', required: true },
  { key: 'role', label: 'Rôle' },
  { key: 'cspro_code', label: 'Code CSPro' },
  { key: 'chef_id', label: 'Chef' },
  { key: 'actions', label: 'Actions', width: 'text-right', required: true },
];

// Configuration par défaut des colonnes visibles
export const defaultUserColumnVisibility: ColumnVisibility = {
  id: true,
  username: true,
  role: true,
  cspro_code: true,
  chef_id: false, // Masquée par défaut
  actions: true,
};