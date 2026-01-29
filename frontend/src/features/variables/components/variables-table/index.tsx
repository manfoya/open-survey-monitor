import VariablesDataTable from "../variables-data-table";
import { PaginatedResponse } from "@/lib/api-types";

// Type temporaire pour les données de demo
interface Variable {
  id: number;
  label: string;
  slug: string;
  data_type: string;
  is_quota: boolean;
  created_at?: string;
}

// Données de démonstration
const mockVariables: Variable[] = [
  {
    id: 1,
    label: "Âge du répondant",
    slug: "age_repondant",
    data_type: "number",
    is_quota: true,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    label: "Sexe",
    slug: "sexe",
    data_type: "list",
    is_quota: true,
    created_at: "2024-01-15T10:31:00Z"
  },
  {
    id: 3,
    label: "Nom complet",
    slug: "nom_complet",
    data_type: "text",
    is_quota: false,
    created_at: "2024-01-15T10:32:00Z"
  },
];

const mockPaginatedVariables: PaginatedResponse<Variable> = {
  items: mockVariables,
  meta: {
    current_page: 1,
    page_size: 10,
    total_items: 3,
    total_pages: 1,
  }
};

export default function VariablesTable() {
  return <VariablesDataTable paginatedVariables={mockPaginatedVariables} />;
}
