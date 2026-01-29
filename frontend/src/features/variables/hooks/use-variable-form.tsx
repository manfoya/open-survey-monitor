import { createVariableAction } from "@/features/variables/actions/create-variable-action";
import {
  DataType,
  UIConfig,
  Modalite,
  OperatorType,
  PropertySetter,
  CreateVariableDataType,
} from "@/features/variables/types";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

export default function useVariableForm() {
  const defaultDataType = DataType.NUMBER
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [dataType, setDataType] = useState<DataType>(defaultDataType);
  const [isQuota, setIsQuota] = useState(true);
  const [uiConfig, setUiConfig] = useState<UIConfig>({});
  const [modalites, setModalites] = useState<Modalite[]>([]);
  const [excludedOperators, setExcludedOperators] = useState<Set<OperatorType>>(
    new Set<OperatorType>()
  );
  const [isPending, startTransition] = useTransition();

  // Handle data type change
  const onDataTypeChange = (newType: DataType) => {
    setDataType(newType);
    // Reset des configurations spécifiques
    setUiConfig({});
    setModalites([]);
    setExcludedOperators(new Set<OperatorType>());
  };

  const onLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    // Générer le slug automatiquement si vide
    if (!slug.trim()) {
      setSlug(generateSlug(newLabel));
    }
  };

  // Mise à jour de la configuration UI
  const updateUIConfig: PropertySetter<UIConfig> = (key, value) => {
    setUiConfig((prev) => {
      const next = { ...prev, [key]: value };
      // Optionnel : Supprimer la clé si la valeur est vide pour garder l'objet propre
      if (value === undefined || value === "") {
        delete next[key];
      }
      return next;
    });
  };

  // Fonctions pour gérer les modalités
  const addModalite = () => {
    const newOrder = modalites.length + 1;
    const newModalite: Modalite = {
      id: crypto.randomUUID(),
      value: newOrder.toString(),
      label: "",
      order: newOrder,
    };
    setModalites([...modalites, newModalite]);
  };

  const updateModalite = (
    id: string,
    field: keyof Modalite,
    value: string | number
  ) => {
    setModalites(
      modalites.map((mod) => (mod.id === id ? { ...mod, [field]: value } : mod))
    );
  };

  const removeModalite = (id: string) => {
    const filtered = modalites.filter((mod) => mod.id !== id);
    // Réordonner
    const reordered = filtered.map((mod, index) => ({
      ...mod,
      order: index + 1,
    }));
    setModalites(reordered);
  };

  // Gestion des opérateurs exclus
  const toggleOperator = (operator: OperatorType) => {
    setExcludedOperators((prev) => {
      if (prev.has(operator)) {
        const newSet = new Set(prev);
        newSet.delete(operator);
        return newSet;
      } else {
        return new Set([...prev, operator]);
      }
    });
  };

  // Reset du formulaire
  const resetForm = () => {
    setLabel("");
    setSlug("");
    setDataType(defaultDataType);
    setIsQuota(true);
    setUiConfig({});
    setModalites([]);
    setExcludedOperators(new Set<OperatorType>());
  };

  const formData: CreateVariableDataType = useMemo(
    () =>
      generateFormData({
        label,
        slug,
        dataType,
        isQuota,
        modalites,
        excludedOperators,
        uiConfig,
      }),
    [label, slug, dataType, isQuota, modalites, excludedOperators, uiConfig]
  );

  // Dans le hook
  const submitData = async () => {
    startTransition(async () => {
      try {
        const result = await createVariableAction(null, formData);
        if (result.success) {
          toast.success("Variable créée avec succès !");
          resetForm();
        } else {
          toast.error(result.message || "Erreur lors de la création de la variable.");
        }
      } catch (err) {
        console.error("Erreur lors de la création de la variable", err);
        toast.error("Erreur lors de la création de la variable.");
      }
    });
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitData();
  };

  return {
    state: {
      label,
      slug,
      dataType,
      isQuota,
      uiConfig,
      modalites,
      excludedOperators,
      isPending,
      formData,
    },
    actions: {
      onLabelChange,
      onSlugChange: setSlug,
      onDataTypeChange,
      onIsQuotaChange: setIsQuota,
      updateUIConfig,
      addModalite,
      updateModalite,
      removeModalite,
      toggleOperator,
      resetForm,
      onFormSubmit,
    },
  };
}

// Fonction pour générer le slug automatiquement
function generateSlug(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9\s]/g, "") // Garde seulement lettres, chiffres et espaces
    .replace(/\s+/g, "_") // Remplace espaces par underscores
    .replace(/_{2,}/g, "_") // Supprime underscores multiples
    .replace(/^_|_$/g, ""); // Supprime underscores début/fin
}

// Génération des données à envoyer au backend
const generateFormData = ({
  label,
  slug,
  dataType,
  isQuota,
  modalites,
  excludedOperators,
  uiConfig,
}: {
  label: string;
  slug: string;
  dataType: DataType;
  isQuota: boolean;
  modalites: Modalite[];
  excludedOperators: Set<OperatorType>;
  uiConfig: UIConfig;
}): CreateVariableDataType => {
  const baseData = {
    label,
    slug,
    data_type: dataType,
    is_quota: isQuota,
  };

  if (dataType === DataType.LIST) {
    return {
      ...baseData,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      modalites: modalites.map(({ id, ...rest }) => rest), // Retire l'ID React
      excluded_operators: Array.from(excludedOperators),
    };
  }

  return {
    ...baseData,
    ui_config: uiConfig,
    excluded_operators: Array.from(excludedOperators),
  };
};
