// Types pour les colonnes personnalisables
import { TableColumn, ColumnVisibility } from "@/types/table";

// Types pour les colonnes personnalisables
export type { TableColumn, ColumnVisibility };

// Configuration des colonnes disponibles
export const availableColumns: TableColumn[] = [
  { key: 'id', label: 'ID', className: 'w-[100px]', required: true, sortable: true, sortKey: 'id' },
  { key: 'username', label: 'Utilisateur', required: true, sortable: true, sortKey: 'username' },
  { key: 'role', label: 'Rôle', sortable: true, sortKey: 'role' },
  { key: 'cspro_code', label: 'Code CSPro', sortable: true, sortKey: 'cspro_code' },
  { key: 'chef', label: 'Chef', sortable: true, sortKey: 'id'},
  { key: 'actions', label: 'Actions', className: 'text-right', required: true },
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