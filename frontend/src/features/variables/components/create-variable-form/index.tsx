"use client";

import { Button } from "@/components/ui/button";
import useVariableForm from "@/features/variables/hooks/use-variable-form";
import BaseInfoSection from "./section-base";
import DynamicConfigSection from "./section-config";
import AdvancedSettingsSection from "./section-advanced";
import JSONPreview from "./json-preview";
import ValidationIndicator from "./validation-indicator";

export default function CreateVariableForm() {
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
      isPending,
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
      onFormSubmit,
    },
  } = useVariableForm();

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
      <FormActions isPending={isPending} />
    </form>
  );
}


// Composant pour les actions du formulaire
function FormActions({ isPending = false }: { isPending?: boolean }) {
  return (
    <div className="flex gap-4">
      <Button type="submit" className="flex-1" disabled={isPending}>
        Créer la variable
      </Button>
      <Button type="button" variant="outline" className="flex-1">
        Annuler
      </Button>
    </div>
  );
}
