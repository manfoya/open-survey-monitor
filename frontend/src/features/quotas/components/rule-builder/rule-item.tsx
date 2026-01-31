import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuotaRule } from "@/features/quotas/types";
import {
  AVAILABLE_OPERATORS,
  DataType,
  VariableDataType,
} from "@/features/variables/types";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";

interface RuleItemProps {
  rule: QuotaRule;
  variables: VariableDataType[];
  onChange: (updatedRule: QuotaRule) => void;
  onRemove: () => void;
}

export default function RuleItem({
  rule,
  variables,
  onChange,
  onRemove,
}: RuleItemProps) {
  const selectedVariable = variables.find((v) => v.slug === rule.field);

  // Filter operators based on selected variable type (optional refinement)
  // For now, allow all, but you could restrict lists to "equals/in_list" etc.
  const operators = AVAILABLE_OPERATORS;

  // Reset value/operator if variable changes type? (complex, let's keep simple first)
  const handleVariableChange = (slug: string) => {
    const newVar = variables.find((v) => v.slug === slug);
    onChange({
      ...rule,
      field: slug,
      value: "", // Reset value on field change
    });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background border rounded-md">
      {/* Variable Selector */}
      <Select value={rule.field} onValueChange={handleVariableChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Variable" />
        </SelectTrigger>
        <SelectContent>
          {variables.map((v) => (
            <SelectItem key={v.id} value={v.slug}>
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operator Selector */}
      <Select
        value={rule.operator}
        onValueChange={(val: any) => onChange({ ...rule, operator: val })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Opérateur" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value Input - Adapts to Variable Type */}
      <div className="flex-1">
        {selectedVariable?.data_type === DataType.LIST &&
        selectedVariable.modalites ? (
          <Select
            value={String(rule.value)}
            onValueChange={(val) => onChange({ ...rule, value: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une valeur" />
            </SelectTrigger>
            <SelectContent>
              {selectedVariable.modalites.map((mod) => (
                <SelectItem key={mod.value} value={mod.value}>
                  {mod.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : selectedVariable?.data_type === DataType.NUMBER ? (
          <Input
            type="number"
            value={rule.value as string}
            onChange={(e) =>
              onChange({ ...rule, value: Number(e.target.value) })
            }
            placeholder="Valeur numérique"
          />
        ) : (
          <Input
            type="text"
            value={rule.value as string}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            placeholder="Valeur"
          />
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:bg-destructive/10"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
