import { TableColumn } from "@/types/table";

export const availableColumns: TableColumn[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "agent", label: "Agent", sortable: false },
  { key: "status", label: "Statut", sortable: true },
  { key: "validation", label: "Validation", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "duree", label: "Durée", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
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
