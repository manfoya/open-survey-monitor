import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { VariableDataType } from "@/features/variables/types";

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
  value,
  placeholder = "Sélectionner une variable",
  variables,
  disabled,
}: VariableSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={value || "__none__"} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">Aucune</SelectItem>
          {variables.map((v) => (
            <SelectItem key={v.id} value={v.slug}>
              {v.label} ({v.slug})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
