import { TableColumn } from "@/types/table";

// Types pour les variables selon vos spécifications
export enum DataType {
  NUMBER = "number",
  TEXT = "text",
  LIST = "list",
  DATE = "date",
  TIME = "time",
  BOOLEAN = "boolean",
}

export type Modalite = {
  id: string; // Pour React uniquement
  value: string;
  label: string;
  order: number;
};

export type UIConfig = {
  // Pour NUMBER
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;

  // Pour DATE
  minDate?: string;
  maxDate?: string;

  // Pour TEXT
  regex?: string;
};

export type OperatorType =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_equal"
  | "less_equal"
  | "contains"
  | "begins_with"
  | "ends_with"
  | "in_list";

// Configuration des types de données
export const DATA_TYPES: {
  value: DataType;
  label: string;
  description: string;
}[] = [
    {
      value: DataType.NUMBER,
      label: "Nombre",
      description: "Valeurs numériques (âge, revenus, quantités...)",
    },
    {
      value: DataType.LIST,
      label: "Liste de choix",
      description: "Options prédéfinies (sexe, région, niveau d'études...)",
    },
    {
      value: DataType.TEXT,
      label: "Texte",
      description: "Texte libre avec validation optionnelle",
    },
    {
      value: DataType.DATE,
      label: "Date",
      description: "Dates avec limites optionnelles",
    },
    {
      value: DataType.TIME,
      label: "Heure",
      description: "Heure spécifique (HH:MM)",
    },
    {
      value: DataType.BOOLEAN,
      label: "Booléen",
      description: "Choix binaire (Oui/Non, Vrai/Faux)",
    },
  ];

// Opérateurs disponibles avec descriptions
export const AVAILABLE_OPERATORS: {
  value: OperatorType;
  label: string;
  description: string;
}[] = [
    { value: "equals", label: "Égal à (=)", description: "Valeur exacte" },
    {
      value: "not_equals",
      label: "Différent de (≠)",
      description: "Toutes valeurs sauf celle-ci",
    },
    {
      value: "greater_than",
      label: "Supérieur à (>)",
      description: "Valeur strictement supérieure",
    },
    {
      value: "less_than",
      label: "Inférieur à (<)",
      description: "Valeur strictement inférieure",
    },
    {
      value: "greater_equal",
      label: "Supérieur ou égal (≥)",
      description: "Valeur supérieure ou égale",
    },
    {
      value: "less_equal",
      label: "Inférieur ou égal (≤)",
      description: "Valeur inférieure ou égale",
    },
    {
      value: "contains",
      label: "Contient",
      description: "Texte qui contient cette valeur",
    },
    {
      value: "begins_with",
      label: "Commence par",
      description: "Texte qui commence par cette valeur",
    },
    {
      value: "ends_with",
      label: "Se termine par",
      description: "Texte qui se termine par cette valeur",
    },
    {
      value: "in_list",
      label: "Dans la liste",
      description: "Valeur présente dans une liste",
    },
  ];

export type PropertySetter<T> = <K extends keyof T>(
  key: K,
  value: T[K],
) => void;

export type CreateVariableDataType = {
  label: string;
  slug: string;
  data_type: DataType;
  is_quota: boolean;
  ui_config?: UIConfig;
  modalites?: Omit<Modalite, "id">[];
  excluded_operators: OperatorType[];
};

export type VariableDataType = {
  id: number;
  label: string;
  slug: string;
  data_type: DataType;
  is_quota: boolean;
  ui_config?: UIConfig;
  modalites?: Omit<Modalite, "id">[];
  excluded_operators: OperatorType[];
};

export const availableColumns: TableColumn[] = [
  { key: "id", label: "ID", sortable: true, sortKey: "id" },
  { key: "label", label: "Libellé", sortable: true, sortKey: "label" },
  { key: "slug", label: "Nom technique", sortable: true, sortKey: "slug" },
  { key: "data_type", label: "Type", sortable: true, sortKey: "data_type" },
  {
    key: "is_quota",
    label: "Utilisé pour quota ?",
    sortable: true,
    sortKey: "is_quota",
  },
  { key: "actions", label: "Actions", sortable: false },
];
