"use client";

import { Button } from "@/components/ui/button";
import useVariableForm from "@/features/variables/hooks/use-variable-form";
import BaseInfoSection from "./create-variable-form/section-base";
import DynamicConfigSection from "./create-variable-form/section-config";
import AdvancedSettingsSection from "./create-variable-form/section-advanced";
import JSONPreview from "./create-variable-form/json-preview";
import ValidationIndicator from "./create-variable-form/validation-indicator";
import { updateVariableAction } from "@/features/variables/actions/update-variable-action";
import { toast } from "sonner";
import { useTransition } from "react";
import { VariableDataType } from "../types";
import { useRouter } from "next/navigation";

interface UpdateVariableFormProps {
  variable: VariableDataType;
}

export default function UpdateVariableForm({ variable }: UpdateVariableFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    state: {
      label,
      slug,
      dataType,
      isQuota,
      uiConfig,
      modalites,
      excludedOperators,
      formData,
    },
    actions: {
      onLabelChange,
      onSlugChange,
      onDataTypeChange,
      onIsQuotaChange,
      updateUIConfig,
      addModalite,
      updateModalite,
      removeModalite,
      toggleOperator,
    },
  } = useVariableForm(variable);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await updateVariableAction(variable.id, null, formData);
        if (result.success) {
          toast.success("Variable mise à jour avec succès !");
          router.push("/variables"); // Redirection vers la liste
          router.refresh(); // Rafraîchir les données
        } else {
          toast.error(result.message || "Erreur lors de la mise à jour de la variable.");
          if (result.errors) {
            console.error("Erreurs de validation:", result.errors);
          }
        }
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la variable", err);
        toast.error("Erreur lors de la mise à jour de la variable.");
      }
    });
  };

  return (
    <form className="space-y-8" onSubmit={onFormSubmit}>
      {/* Indicateur de validation */}
      <ValidationIndicator
        label={label}
        slug={slug}
        dataType={dataType}
        modalites={modalites}
      />

      <BaseInfoSection
        label={label}
        slug={slug}
        dataType={dataType}
        isQuota={isQuota}
        onLabelChange={onLabelChange}
        onSlugChange={onSlugChange}
        onDataTypeChange={onDataTypeChange}
        onIsQuotaChange={onIsQuotaChange}
      />

      <DynamicConfigSection
        dataType={dataType}
        uiConfig={uiConfig}
        updateUIConfig={updateUIConfig}
        modalites={modalites}
        addModalite={addModalite}
        updateModalite={updateModalite}
        removeModalite={removeModalite}
      />

      {/* Section C: Paramètres Avancés */}
      <AdvancedSettingsSection
        excludedOperators={excludedOperators}
        toggleOperator={toggleOperator}
      />

      {/* Aperçu JSON */}
      <JSONPreview data={formData} />

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
        <Button 
            type="button" 
            variant="outline" 
            className="flex-1" 
            onClick={() => router.back()}
            disabled={isPending}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
