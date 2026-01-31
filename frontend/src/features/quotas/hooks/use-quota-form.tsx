import { useState, useTransition } from "react";
import {
  CreateQuotaDTO,
  QuotaDefinition,
  Quota,
} from "@/features/quotas/types";

export default function useQuotaForm(initialValues?: Quota) {
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [isActive, setIsActive] = useState(initialValues?.is_active ?? true);

  // Ensure we have a valid definition object structure even if initialValues is partial or missing
  const [definition, setDefinition] = useState<QuotaDefinition>(
    initialValues?.definition || {
      combinator: "and", // Default combinator
      rules: [],
    },
  );

  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setDescription("");
    setIsActive(true);
    setDefinition({ combinator: "and", rules: [] });
  };

  const formData: CreateQuotaDTO = {
    description,
    is_active: isActive,
    definition,
  };

  return {
    state: {
      description,
      isActive,
      definition,
      isPending,
      formData,
    },
    actions: {
      onDescriptionChange: setDescription,
      onIsActiveChange: setIsActive,
      onDefinitionChange: setDefinition,
      resetForm,
    },
  };
}
