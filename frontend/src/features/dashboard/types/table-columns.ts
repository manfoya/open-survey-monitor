import { TableColumn } from "@/types/table";

export const availableColumns: TableColumn[] = [
  { key: "id", label: "ID", sortable: true, sortKey: "id" },
  { key: "agent", label: "Agent", sortable: false },
  { key: "status", label: "Statut", sortable: true, sortKey: "status" },
  {
    key: "validation",
    label: "Validation",
    sortable: true,
    sortKey: "is_valid",
  },
  { key: "date", label: "Date", sortable: true, sortKey: "date_entretien" },
  { key: "duree", label: "Durée", sortable: true, sortKey: "duree_minutes" },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    required: true,
    className: "text-right",
  },
];

export const defaultSurveyColumnVisibility = {
  id: true,
  agent: true,
  status: true,
  validation: true,
  date: true,
  duree: true,
  actions: true,
};
