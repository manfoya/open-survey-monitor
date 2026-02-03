import * as React from "react";
import { VariableDataType } from "@/features/variables/types";
import { FormCombobox, ComboboxItem } from "@/components/form-combobox";

interface VariableSelectorProps {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
  variables: VariableDataType[];
  disabled?: boolean;
}

export function VariableSelector({
  name,
  label,
  value: initialValue,
  placeholder = "Sélectionner une variable",
  variables,
  disabled,
}: VariableSelectorProps) {
  const [currentValue, setCurrentValue] = React.useState(
    initialValue || "__none__",
  );

  const items: ComboboxItem[] = [
    { value: "__none__", label: "Aucune" },
    ...variables.map((v) => ({
      value: v.slug,
      label: v.label,
      subLabel: v.slug,
    })),
  ];

  return (
    <FormCombobox
      label={label}
      name={name}
      value={currentValue}
      onChange={setCurrentValue}
      items={items}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}
