// Types pour les colonnes personnalisables des variables
import { TableColumn, ColumnVisibility } from "@/types/table";

// Types pour les colonnes personnalisables des variables
export type { TableColumn, ColumnVisibility };

// Configuration des colonnes disponibles pour les variables
export const availableColumns: TableColumn[] = [
  { key: 'id', label: 'ID', className: 'w-[80px]', required: true, sortable: true, sortKey: 'id' },
  { key: 'label', label: 'Libellé', required: true, sortable: true, sortKey: 'label' },
  { key: 'slug', label: 'Identifiant', sortable: true, sortKey: 'slug' },
  { key: 'data_type', label: 'Type', sortable: true, sortKey: 'data_type' },
  { key: 'is_quota', label: 'Quota', sortable: true, sortKey: 'is_quota' },
  { key: 'actions', label: 'Actions', className: 'text-right', required: true, sortable: false },
];

// Configuration par défaut des colonnes visibles
export const defaultVariableColumnVisibility: ColumnVisibility = {
  id: true,
  label: true,
  slug: true,
  data_type: true,
  is_quota: true,
  actions: true,
};